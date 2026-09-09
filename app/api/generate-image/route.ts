import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/init";
import { getSession } from "../../lib/auth";
import { clientIp, rateLimit, rateLimitResponse, recordRateLimitAttempt } from "../../lib/abuse-protection";

const MAX_PROMPT_LENGTH = 2_000;
const MAX_REFERENCE_IMAGES = 4;
const MAX_REFERENCE_BYTES = 1_500_000;

function referenceToBlob(ref: string): Blob {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(ref);
  if (!match) throw new Error("Reference images must be PNG, JPEG, or WebP data URLs.");
  const estimatedBytes = Math.floor(match[2].length * 0.75);
  if (estimatedBytes > MAX_REFERENCE_BYTES) throw new Error("A reference image is too large.");
  const bin = atob(match[2]);
  const buffer = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([buffer], { type: `image/${match[1].toLowerCase()}` });
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    if (!user) {
      return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const key = `image-ip:${clientIp(request)}`;
    const limit = await rateLimit(db, { key, purpose: "image-rate", limit: 8, windowSeconds: 10 * 60 });
    if (limit.limited) return rateLimitResponse(limit.retryAfter);

    const payload = (await request.json()) as {
      garment?: string;
      prompt?: string;
      style?: "wear" | "flat";
      referenceImages?: string[];
    };
    const allowedGarments = new Set(["jacket", "trousers", "waistcoat", "shirt", "fabric"]);
    const garment = allowedGarments.has(payload.garment ?? "") ? payload.garment! : "jacket";
    const prompt = (payload.prompt ?? "").trim();
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return Response.json({ error: "The image prompt is too long." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const style = payload.style === "flat" ? "flat" : "wear";
    const referenceImages = Array.isArray(payload.referenceImages) ? payload.referenceImages.slice(0, MAX_REFERENCE_IMAGES) : [];
    if (referenceImages.some((image) => typeof image !== "string")) {
      return Response.json({ error: "Reference images are invalid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const apiKey = (env as Record<string, string | undefined>).AI_IMAGE_API_KEY;
    const baseUrl = ((env as Record<string, string | undefined>).AI_IMAGE_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = (env as Record<string, string | undefined>).AI_IMAGE_MODEL ?? "gpt-image-1";

    if (!apiKey) {
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
      }, { headers: { "Cache-Control": "no-store" } });
    }

    if (!prompt) {
      return Response.json({ error: "An image prompt is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const faceSafePrompt = `${prompt}, privacy-safe product presentation: never show a face or facial features; if a person is present, compose the image strictly from the neck down with the entire head outside the frame; do not generate portraits, reflections of faces, or background faces`;
    await recordRateLimitAttempt(db, key, "image-rate", 10 * 60);

    let response: Response;
    if (referenceImages.length) {
      const form = new FormData();
      form.append("model", model);
      for (const ref of referenceImages) {
        form.append("image", referenceToBlob(ref), "reference-image");
      }
      form.append("prompt", faceSafePrompt);
      form.append("response_format", "url");
      response = await fetch(`${baseUrl}/images/edits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      response = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          prompt: faceSafePrompt,
          n: 1,
          size: style === "flat" ? "1024x1024" : "1024x1536",
          response_format: "url",
        }),
      });
    }

    if (!response.ok) {
      console.error("image-provider-error", JSON.stringify({ status: response.status }));
      return Response.json({ error: "The image service is unavailable. Please try again later." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
    const item = data.data?.[0];
    const imageUrl = item?.url ?? (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
    if (!imageUrl) {
      return Response.json({ error: "The image service returned an unexpected response." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ imageUrl, provider: model, demo: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("image-generation-error", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Unable to generate an image. Please try again later." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
