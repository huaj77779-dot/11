import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/init";
import { siteContent } from "../../../db/schema";

export async function GET(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const locale = new URL(request.url).searchParams.get("locale") || "en";
  const rows = await db.select({ key: siteContent.contentKey, value: siteContent.value, valueType: siteContent.valueType })
    .from(siteContent).where(eq(siteContent.locale, locale)).orderBy(asc(siteContent.contentKey));
  return Response.json({ content: Object.fromEntries(rows.map((row) => [row.key, row.value])) }, { headers: { "Cache-Control": "public, max-age=60" } });
}
