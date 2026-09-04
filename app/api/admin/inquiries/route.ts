import { desc } from "drizzle-orm";
import { inquiries } from "../../../../db/schema";
import { requireAdmin } from "../../../lib/admin";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, "inquiries");
  if (guard.error) return guard.error;
  const rows = await guard.db.select().from(inquiries).orderBy(desc(inquiries.createdAt), desc(inquiries.id)).limit(500);
  return Response.json({ inquiries: rows }, { headers: { "Cache-Control": "no-store" } });
}
