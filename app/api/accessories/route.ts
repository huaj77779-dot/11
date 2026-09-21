import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { accessoryProducts } from "../../../db/schema";
import { ensureSchema } from "../../../db/init";
import { getSession, scopeFor } from "../../lib/auth";

const CATEGORIES = new Set([
  "cufflinks",
  "tie",
  "brooch",
  "packaging_bag",
  "pocket_square",
  "bow_tie",
  "tie_pin",
]);

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function serialize(row: typeof accessoryProducts.$inferSelect) {
  return {
    ...row,
    priceTiers: parseJson(row.priceTiers, []),
    skus: parseJson(row.skus, []),
  };
}

export async function GET(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user) return Response.json({ error: "登录后才能查看配件" }, { status: 401 });
  const scope = scopeFor(user);
  const rows = await db.select().from(accessoryProducts)
    .where(and(eq(accessoryProducts.active, true), scope == null ? undefined : eq(accessoryProducts.ownerId, scope)))
    .orderBy(desc(accessoryProducts.updatedAt), desc(accessoryProducts.id));
  return Response.json({ products: rows.map(serialize) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user) return Response.json({ error: "登录后才能提交采集链接" }, { status: 401 });
  const payload = await request.json() as { sourceUrl?: string; category?: string };
  const category = String(payload.category ?? "");
  if (!CATEGORIES.has(category)) return Response.json({ error: "请选择配件分类" }, { status: 400 });
  let url: URL;
  try { url = new URL(String(payload.sourceUrl ?? "").trim()); }
  catch { return Response.json({ error: "请输入有效的1688商品链接" }, { status: 400 }); }
  if (!(url.hostname === "1688.com" || url.hostname.endsWith(".1688.com"))) {
    return Response.json({ error: "目前只接受1688商品链接" }, { status: 400 });
  }
  const offerId = url.pathname.match(/\/offer\/(\d+)\.html/i)?.[1] ?? url.searchParams.get("offerId") ?? "";
  if (!offerId) return Response.json({ error: "链接中没有识别到商品ID" }, { status: 400 });
  const sourceUrl = `https://detail.1688.com/offer/${offerId}.html`;
  const ownerId = user.id;
  const existing = await db.select().from(accessoryProducts)
    .where(and(eq(accessoryProducts.ownerId, ownerId), eq(accessoryProducts.sourceUrl, sourceUrl))).limit(1);
  if (existing[0]) return Response.json({ product: serialize(existing[0]), duplicate: true });
  const now = new Date().toISOString();
  const [created] = await db.insert(accessoryProducts).values({
    ownerId, category, sourceUrl, offerId, status: "pending", createdAt: now, updatedAt: now,
  }).returning();
  return Response.json({ product: serialize(created) }, { status: 201 });
}
