import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { styleOptions } from "../../../../db/schema";
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
  const garmentType = url.searchParams.get("garmentType") ?? "all";
  const rows = await db
    .select()
    .from(styleOptions)
    .where(garmentType !== "all" ? eq(styleOptions.garmentType, garmentType) : undefined)
    .orderBy(asc(styleOptions.garmentType), asc(styleOptions.groupTitle), asc(styleOptions.sortOrder), asc(styleOptions.id));
  return Response.json({ styles: rows });
}

/** 新增款式选项（或批量：body 数组 / { styles: [...] }） */
export async function POST(request: Request) {
  const guard = await requireMaster(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const payload = await request.json();
  const list = Array.isArray(payload) ? payload : payload.styles ?? [];
  const created = [];
  for (const item of list) {
    if (!item.garmentType || !item.groupTitle || !item.item) continue;
    const [row] = await db
      .insert(styleOptions)
      .values({
        garmentType: String(item.garmentType),
        groupTitle: String(item.groupTitle),
        item: String(item.item),
        surcharge: Number(item.surcharge) || 0,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
        sortOrder: Number(item.sortOrder) || 0,
        active: item.active !== false,
      })
      .returning();
    created.push(row);
  }
  return Response.json({ created: created.length });
}

