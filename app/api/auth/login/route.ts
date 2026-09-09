import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { ensureSchema, hashPassword, verifyPassword } from "../../../../db/init";
import { createToken, sessionCookie } from "../../../lib/auth";
import { clientIp, rateLimit, rateLimitResponse, recordRateLimitAttempt } from "../../../lib/abuse-protection";

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const key = `login-ip:${clientIp(request)}`;
    const limit = await rateLimit(db, { key, purpose: "login-rate", limit: 5, windowSeconds: 10 * 60 });
    if (limit.limited) return rateLimitResponse(limit.retryAfter);
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
    if (!user || !user.active) {
      await recordRateLimitAttempt(db, key, "login-rate", 10 * 60);
      return Response.json({ error: "账号或密码错误" }, { status: 401 });
    }
    const verification = await verifyPassword(password, user.passwordHash);
    if (!verification.valid) {
      await recordRateLimitAttempt(db, key, "login-rate", 10 * 60);
      return Response.json({ error: "账号或密码错误" }, { status: 401 });
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
    return Response.json({ error: "Login failed. Please try again later." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

