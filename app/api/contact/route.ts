import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/init";
import { inquiries } from "../../../db/schema";
import { clientIp, rateLimit, rateLimitResponse, recordRateLimitAttempt } from "../../lib/abuse-protection";

type ContactPayload = { name?: unknown; contact?: unknown; message?: unknown; website?: unknown; turnstileToken?: unknown };
type TurnstileResponse = { success?: boolean; hostname?: string; action?: string };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function verifyTurnstile(token: string, request: Request): Promise<boolean> {
  const secret = (env as Record<string, string | undefined>).TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: clientIp(request) }),
    });
    const result = (await response.json()) as TurnstileResponse;
    return response.ok && result.success === true && result.hostname === "verosuits.com" && result.action === "contact";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = clean(body.name, 100);
    const contact = clean(body.contact, 160);
    const message = clean(body.message, 1200);
    const turnstileToken = clean(body.turnstileToken, 4096);
    if (clean(body.website, 100)) return Response.json({ ok: true });
    if (!name || !contact) return Response.json({ error: "请填写公司或门店名称以及联系方式" }, { status: 400 });

    const db = getDb();
    await ensureSchema(db);
    const rate = await rateLimit(db, {
      key: `contact-ip:${clientIp(request)}`,
      purpose: "contact-submit",
      limit: 5,
      windowSeconds: 10 * 60,
    });
    if (rate.limited) return rateLimitResponse(rate.retryAfter);
    if (!await verifyTurnstile(turnstileToken, request)) {
      return Response.json(
        { error: "Please complete the security check and try again." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    await recordRateLimitAttempt(db, `contact-ip:${clientIp(request)}`, "contact-submit", 10 * 60);
    const now = new Date().toISOString();
    await db.insert(inquiries).values({
      company: name, contact, message, source: "website", status: "new",
      createdAt: now, updatedAt: now,
    });

    const webhookUrl = (env as unknown as { WECHAT_WEBHOOK_URL?: string }).WECHAT_WEBHOOK_URL;
    if (!webhookUrl) return Response.json({ ok: true, notified: false }, { status: 201 });

    const content = [
      "【verosuits 新合作需求】",
      `公司/门店：${name}`,
      `联系方式：${contact}`,
      `合作需求：${message || "未填写"}`,
      `提交时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    ].join("\n");

    const result = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msgtype: "text", text: { content } }),
    });
    const response = (await result.json().catch(() => ({}))) as { errcode?: number; errmsg?: string };
    if (!result.ok || (typeof response.errcode === "number" && response.errcode !== 0)) {
      console.error("WeChat webhook rejected contact notification", result.status, response.errcode, response.errmsg);
      return Response.json({ ok: true, notified: false }, { status: 201 });
    }
    return Response.json({ ok: true, notified: true }, { status: 201 });
  } catch (error) {
    console.error("Contact notification failed", error);
    return Response.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}
