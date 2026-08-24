import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import type { User } from "../../db/schema";

export type AuthUser = Pick<User, "id" | "username" | "role" | "storeName">;

export function getToken(request: Request): string | null {
  const auth = request.headers.get("Authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(request.url);
  return url.searchParams.get("token");
}

export async function getSession(
  db: DrizzleD1Database<typeof schema>,
  request: Request
): Promise<AuthUser | null> {
  const token = getToken(request);
  if (!token) return null;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.token, token))
    .limit(1);
  if (!user || !user.tokenExpiresAt) return null;
  if (new Date(user.tokenExpiresAt).getTime() < Date.now()) return null;
  return { id: user.id, username: user.username, role: user.role, storeName: user.storeName };
}

export async function createToken(
  db: DrizzleD1Database<typeof schema>,
  userId: number
): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  await db
    .update(schema.users)
    .set({ token, tokenExpiresAt: expires })
    .where(eq(schema.users.id, userId));
  return token;
}

export async function clearToken(
  db: DrizzleD1Database<typeof schema>,
  request: Request
): Promise<void> {
  const token = getToken(request);
  if (!token) return;
  await db
    .update(schema.users)
    .set({ token: null, tokenExpiresAt: null })
    .where(eq(schema.users.token, token));
}

/**
 * 数据隔离作用域：
 * - 主账号(master)返回 null → 查询不过滤，可见全部数据
 * - 子账号(store)返回自身 id → 查询按 owner_id 过滤，只能看到自己的数据
 */
export function scopeFor(user: AuthUser | null): number | null {
  if (!user) return null;
  return user.role === "master" ? null : user.id;
}
