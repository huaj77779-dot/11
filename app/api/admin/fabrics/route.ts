import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { fabrics, type NewFabric } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";
import { getSession } from "../../../lib/auth";

async function requireMaster(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user || user.role !== "master") {
    return { db, error: Response.json({ error: "仅主账号可操作" }, { status: 403 }) };
  }
  return { db, error: null };
}

export async function GET(request: Request) {
  const guard = await requireMaster(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const garmentType = url.searchParams.get("garmentType");
  const all = await db
    .select()
    .from(fabrics)
    .where(
      garmentType && garmentType !== "all" ? eq(fabrics.garmentType, garmentType) : undefined
    )
    .orderBy(asc(fabrics.garmentType), asc(fabrics.sortOrder), desc(fabrics.id));
  const rows = q
    ? all.filter(
        (f) =>
          f.code.includes(q) || f.name.includes(q) || f.mill.includes(q)
      )
    : all;
  return Response.json({ fabrics: rows });
}

/** 批量上架面料：body 为数组，或 { fabrics: [...] } */
export async function POST(request: Request) {
  const guard = await requireMaster(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const payload = await request.json();
  const list: NewFabric[] = Array.isArray(payload) ? payload : payload.fabrics ?? [];
  if (!list.length) return Response.json({ error: "面料数据为空" }, { status: 400 });
  const created = [];
  const skipped: string[] = [];
  for (const item of list) {
    const code = String(item.code ?? "").trim().toUpperCase();
    if (!code || !item.name) continue;
    try {
      const [row] = await db
        .insert(fabrics)
        .values({
          code,
          name: String(item.name).trim(),
          mill: String(item.mill ?? "").trim(),
          book: String(item.book ?? "").trim(),
          tone: String(item.tone ?? "navy").trim(),
          meta: String(item.meta ?? "").trim(),
          stock: String(item.stock ?? "现货").trim(),
          price: Number(item.price) || 0,
          imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
          garmentType: String(item.garmentType ?? "jacket").trim(),
          sortOrder: Number(item.sortOrder) || 0,
          active: item.active !== false,
        })
        .returning();
      created.push(row);
    } catch {
      skipped.push(code);
    }
  }
  return Response.json({ created: created.length, skipped });
}

