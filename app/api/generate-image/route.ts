import { env } from "cloudflare:workers";

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return `${message}${detail ? `\n${detail}` : ""}`;
}

/**
 * 实时 AI 生图端点
 *
 * 支持两种模式：
 * 1. 真实生成：配置环境变量后调用 OpenAI Images API 兼容服务
 *    - AI_IMAGE_API_KEY  （必需）
 *    - AI_IMAGE_BASE_URL （可选，默认 https://api.openai.com/v1，兼容硅基流动/即梦等）
 *    - AI_IMAGE_MODEL    （可选，默认 gpt-image-1；dall-e-3 / 硅基流动 flux 等均可）
 * 2. 演示模式：未配置密钥时返回 public/ai-previews/ 下的示例图，功能链路可完整演示
 */
/** 参考图（dataURL 或 http URL）转为二进制 */
async function referenceToBytes(ref: string): Promise<Uint8Array> {
  if (ref.startsWith("data:")) {
    const base64 = ref.slice(ref.indexOf(",") + 1);
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  const res = await fetch(ref);
  if (!res.ok) throw new Error(`参考图下载失败 ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      garment?: string;
      prompt?: string;
      style?: "wear" | "flat";
      /** 款式参考图（dataURL 或 http URL），最多 4 张 */
      referenceImages?: string[];
    };
    const garment = payload.garment ?? "jacket";
    const prompt = (payload.prompt ?? "").trim();
    const faceSafePrompt = `${prompt}, privacy-safe product presentation: never show a face or facial features; if a person is present, compose the image strictly from the neck down with the entire head outside the frame; do not generate portraits, reflections of faces, or background faces`;
    const style = payload.style === "flat" ? "flat" : "wear";
    const referenceImages = (payload.referenceImages ?? []).slice(0, 4);

    const apiKey = (env as Record<string, string | undefined>).AI_IMAGE_API_KEY;
    const baseUrl = ((env as Record<string, string | undefined>).AI_IMAGE_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = (env as Record<string, string | undefined>).AI_IMAGE_MODEL ?? "gpt-image-1";

    if (!apiKey) {
      // 演示模式：返回内置示例图（真实密钥配置后自动切换）
      const demoFiles: Record<string, string> = {
        jacket: "/ai-previews/jacket.png",
        trousers: "/ai-previews/trousers.png",
        waistcoat: "/ai-previews/waistcoat.png",
        shirt: "/ai-previews/shirt.png",
        fabric: "/ai-previews/jacket.png",
      };
      return Response.json({
        imageUrl: `${demoFiles[garment] ?? demoFiles.jacket}?v=${Date.now()}`,
        provider: "demo",
        demo: true,
        note: "演示模式：未配置 AI_IMAGE_API_KEY。配置真实生图服务后自动切换为实时生成。",
      });
    }

    if (!prompt) {
      return Response.json({ error: "prompt 不能为空" }, { status: 400 });
    }

    // 真实生成：有参考图走 edits 端点（款式保真），无参考图走 generations
    let res: Response;
    if (referenceImages.length) {
      const form = new FormData();
      form.append("model", model);
      for (const ref of referenceImages) {
        const bytes = await referenceToBytes(ref);
        form.append("image", new Blob([bytes], { type: "image/png" }), "ref.png");
      }
      form.append("prompt", faceSafePrompt);
      form.append("response_format", "url");
      res = await fetch(`${baseUrl}/images/edits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      res = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt: faceSafePrompt,
          n: 1,
          size: style === "flat" ? "1024x1024" : "1024x1536",
          response_format: "url",
        }),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: `生图服务返回 ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: Array<{ url?: string; b64_json?: string }>;
    };
    const item = data.data?.[0];
    if (!item) {
      return Response.json({ error: "生图服务未返回图片" }, { status: 502 });
    }

    const imageUrl = item.url
      ? item.url
      : item.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : null;
    if (!imageUrl) {
      return Response.json({ error: "生图服务返回格式异常" }, { status: 502 });
    }

    return Response.json({ imageUrl, provider: model, demo: false });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
