import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/init";
import { fabrics, styleOptions } from "../../../db/schema";

/** Public storefront catalog. The browser keeps built-in defaults if this request is unavailable. */
export async function GET() {
  const db = getDb();
  await ensureSchema(db);
  const [catalogFabrics, catalogStyles] = await Promise.all([
    db.select().from(fabrics).where(eq(fabrics.active, true)).orderBy(asc(fabrics.garmentType), asc(fabrics.sortOrder), asc(fabrics.id)),
    db.select().from(styleOptions).where(eq(styleOptions.active, true)).orderBy(asc(styleOptions.garmentType), asc(styleOptions.sortOrder), asc(styleOptions.id)),
  ]);
  return Response.json({ fabrics: catalogFabrics, styles: catalogStyles }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
