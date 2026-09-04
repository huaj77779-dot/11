import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/init";
import { inquiries } from "../../../db/schema";

type ContactPayload = { name?: unknown; contact?: unknown; message?: unknown; website?: unknown };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = clean(body.name, 100);
    const contact = clean(body.contact, 160);
    const message = clean(body.message, 1200);
    if (clean(body.website, 100)) return Response.json({ ok: true });
    if (!name || !contact) return Response.json({ error: "请填写公司或门店名称以及联系方式" }, { status: 400 });

    const db = getDb();
    await ensureSchema(db);
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
