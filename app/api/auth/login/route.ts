import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { ensureSchema, hashPassword } from "../../../../db/init";
import { createToken } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const payload = (await request.json()) as { username?: string; password?: string };
    const username = (payload.username ?? "").trim();
    const password = String(payload.password ?? "");
    if (!username || !password) {
      return Response.json({ error: "请输入账号和密码" }, { status: 400 });
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (!user || (await hashPassword(password)) !== user.passwordHash) {
      return Response.json({ error: "账号或密码错误" }, { status: 401 });
    }
    const token = await createToken(db, user.id);
    return Response.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, storeName: user.storeName },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

