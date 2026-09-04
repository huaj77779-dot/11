import { desc } from "drizzle-orm";
import { newsArticles } from "../../../../db/schema";
import { cleanText, requireAdmin } from "../../../lib/admin";

const validStatus = new Set(["draft", "published", "archived"]);

export async function GET(request: Request) {
  const guard = await requireAdmin(request, "news");
  if (guard.error) return guard.error;
  const rows = await guard.db.select().from(newsArticles).orderBy(desc(newsArticles.updatedAt), desc(newsArticles.id));
  return Response.json({ articles: rows }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request, "news");
  if (guard.error) return guard.error;
  const body = await request.json() as Record<string, unknown>;
  const slug = cleanText(body.slug, 120).toLowerCase();
  const title = cleanText(body.title, 240);
  const status = validStatus.has(String(body.status)) ? String(body.status) : "draft";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title) {
    return Response.json({ error: "请填写标题，slug 仅可使用小写字母、数字和连字符" }, { status: 400 });
  }
  const now = new Date().toISOString();
  try {
    const [article] = await guard.db.insert(newsArticles).values({
      slug, title, locale: cleanText(body.locale, 10) || "en",
      excerpt: cleanText(body.excerpt, 1000), body: cleanText(body.body, 30000),
      category: cleanText(body.category, 80) || "Company News",
      coverImage: cleanText(body.coverImage, 1000) || null, status,
      publishedAt: status === "published" ? now : null, authorId: guard.user.id,
      createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ article }, { status: 201 });
  } catch {
    return Response.json({ error: "slug 已存在，请更换" }, { status: 409 });
  }
}
