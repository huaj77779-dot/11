import { eq } from "drizzle-orm";
import { newsArticles } from "../../../../../db/schema";
import { cleanText, requireAdmin } from "../../../../lib/admin";

const validStatus = new Set(["draft", "published", "archived"]);
const parseId = (value: string) => { const id = Number(value); return Number.isSafeInteger(id) && id > 0 ? id : null; };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request, "news");
  if (guard.error) return guard.error;
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "无效记录" }, { status: 400 });
  const body = await request.json() as Record<string, unknown>;
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [key, max] of [["title", 240], ["excerpt", 1000], ["body", 30000], ["category", 80], ["coverImage", 1000]] as const) {
    if (key in body) patch[key] = cleanText(body[key], max) || (key === "coverImage" ? null : "");
  }
  if ("status" in body && validStatus.has(String(body.status))) {
    patch.status = String(body.status);
    patch.publishedAt = body.status === "published" ? new Date().toISOString() : null;
  }
  const [article] = await guard.db.update(newsArticles).set(patch).where(eq(newsArticles.id, id)).returning();
  return article ? Response.json({ article }) : Response.json({ error: "文章不存在" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request, "news");
  if (guard.error) return guard.error;
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "无效记录" }, { status: 400 });
  await guard.db.delete(newsArticles).where(eq(newsArticles.id, id));
  return Response.json({ ok: true });
}
