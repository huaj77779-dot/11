import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { ensureSchema, hashPassword, verifyPassword } from "../../../../db/init";
import { createToken, sessionCookie } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);

    const payload = (await request.json()) as { username?: string; password?: string };
    const username = (payload.username ?? "").trim();
    const password = String(payload.password ?? "");
    if (!username || !password) {
      return Response.json({ error: "请输入账号和密码" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (!user || !user.active) {
      return Response.json({ error: "账号或密码错误" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const verification = await verifyPassword(password, user.passwordHash);
    if (!verification.valid) {
      return Response.json({ error: "账号或密码错误" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    if (verification.needsUpgrade) {
      await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id));
    }
    const token = await createToken(db, user.id);
    return Response.json(
      { user: { id: user.id, username: user.username, role: user.role, storeName: user.storeName, displayName: user.displayName, email: user.email, permissions: JSON.parse(user.permissions || "[]") } },
      { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "登录失败，请稍后重试" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
