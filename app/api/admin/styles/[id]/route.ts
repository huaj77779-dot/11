import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { styleOptions } from "../../../../../db/schema";
import { ensureSchema } from "../../../../../db/init";
import { getSession } from "../../../../lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user || user.role !== "master") {
    return Response.json({ error: "仅主账号可操作" }, { status: 403 });
  }
  const { id } = await params;
  const payload = (await request.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const key of ["garmentType", "groupTitle", "item", "imageUrl"] as const) {
    if (typeof payload[key] === "string") patch[key] = payload[key];
  }
  if (typeof payload.surcharge === "number") patch.surcharge = payload.surcharge;
  if (typeof payload.sortOrder === "number") patch.sortOrder = payload.sortOrder;
  if (typeof payload.active === "boolean") patch.active = payload.active;
  const [updated] = await db
    .update(styleOptions)
    .set(patch)
    .where(eq(styleOptions.id, Number(id)))
    .returning();
  if (!updated) return Response.json({ error: "选项不存在" }, { status: 404 });
  return Response.json({ style: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, _request);
  if (!user || user.role !== "master") {
    return Response.json({ error: "仅主账号可操作" }, { status: 403 });
  }
  const { id } = await params;
  await db.delete(styleOptions).where(eq(styleOptions.id, Number(id)));
  return Response.json({ deleted: true });
}
