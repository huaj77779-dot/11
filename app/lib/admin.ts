import { getDb } from "../../db";
import { ensureSchema } from "../../db/init";
import { canManage, getSession } from "./auth";

export async function requireAdmin(request: Request, permission?: string) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!canManage(user, permission)) {
    return { db, user, error: Response.json({ error: "没有此项管理权限" }, { status: 403 }) };
  }
  return { db, user: user!, error: null };
}

export const cleanText = (value: unknown, max = 5000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

