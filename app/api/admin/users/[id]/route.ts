import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { ensureSchema, hashPassword } from "../../../../../db/init";
import { getSession } from "../../../../lib/auth";

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
  const idNum = Number(id);
  if (idNum === user.id) {
    return Response.json({ error: "不能删除主账号自身" }, { status: 400 });
  }
  await db.delete(users).where(eq(users.id, idNum));
  return Response.json({ deleted: true });
}

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
  const idNum = Number(id);
  const payload = (await request.json()) as { storeName?: string; password?: string };
  const patch: Record<string, unknown> = {};
  if (typeof payload.storeName === "string" && payload.storeName.trim()) {
    patch.storeName = payload.storeName.trim();
  }
  if (typeof payload.password === "string" && payload.password.length >= 6) {
    patch.passwordHash = await hashPassword(payload.password);
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "没有可更新的内容（密码至少 6 位）" }, { status: 400 });
  }
  const [updated] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, idNum))
    .returning();
  if (!updated) return Response.json({ error: "账号不存在" }, { status: 404 });
  return Response.json({
    user: { id: updated.id, username: updated.username, role: updated.role, storeName: updated.storeName },
  });
}
