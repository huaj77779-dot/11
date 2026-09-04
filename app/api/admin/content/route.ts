import { and, asc, eq } from "drizzle-orm";
import { siteContent } from "../../../../db/schema";
import { cleanText, requireAdmin } from "../../../lib/admin";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, "content");
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "all";
  const rows = await guard.db.select().from(siteContent)
    .where(locale === "all" ? undefined : eq(siteContent.locale, locale))
    .orderBy(asc(siteContent.section), asc(siteContent.contentKey), asc(siteContent.locale));
  return Response.json({ content: rows });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin(request, "content");
  if (guard.error) return guard.error;
  const body = await request.json() as Record<string, unknown>;
  const section = cleanText(body.section, 60);
  const contentKey = cleanText(body.contentKey, 100);
  const locale = cleanText(body.locale, 20) || "en";
  const value = cleanText(body.value, 20000);
  const valueType = ["text", "textarea", "image", "url"].includes(String(body.valueType)) ? String(body.valueType) : "text";
  if (!section || !contentKey) return Response.json({ error: "栏目和字段名称不能为空" }, { status: 400 });
  const existing = await guard.db.select({ id: siteContent.id }).from(siteContent)
    .where(and(eq(siteContent.contentKey, contentKey), eq(siteContent.locale, locale))).limit(1);
  const now = new Date().toISOString();
  if (existing[0]) {
    await guard.db.update(siteContent).set({ section, value, valueType, updatedBy: guard.user.id, updatedAt: now }).where(eq(siteContent.id, existing[0].id));
  } else {
    await guard.db.insert(siteContent).values({ section, contentKey, locale, value, valueType, updatedBy: guard.user.id, updatedAt: now });
  }
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request, "content");
  if (guard.error) return guard.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id)) return Response.json({ error: "无效记录" }, { status: 400 });
  await guard.db.delete(siteContent).where(eq(siteContent.id, id));
  return Response.json({ ok: true });
}

