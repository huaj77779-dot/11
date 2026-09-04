import { eq } from "drizzle-orm";
import { inquiries } from "../../../../../db/schema";
import { cleanText, requireAdmin } from "../../../../lib/admin";

const statuses = new Set(["new", "contacted", "qualified", "closed", "spam"]);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request, "inquiries");
  if (guard.error) return guard.error;
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: "无效记录" }, { status: 400 });
  const body = await request.json() as Record<string, unknown>;
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (statuses.has(String(body.status))) patch.status = String(body.status);
  if ("notes" in body) patch.notes = cleanText(body.notes, 5000);
  if (Number.isSafeInteger(Number(body.assigneeId)) && Number(body.assigneeId) >= 0) patch.assigneeId = Number(body.assigneeId);
  const [inquiry] = await guard.db.update(inquiries).set(patch).where(eq(inquiries.id, id)).returning();
  return inquiry ? Response.json({ inquiry }) : Response.json({ error: "询盘不存在" }, { status: 404 });
}
