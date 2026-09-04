import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import type { User } from "../../db/schema";

export type AuthUser = Pick<User, "id" | "username" | "role" | "storeName" | "displayName" | "email"> & {
  permissions: string[];
};

export const SESSION_COOKIE = "tailorsupply_session";

async function digestToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  const cookieToken = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (cookieToken) return decodeURIComponent(cookieToken.slice(SESSION_COOKIE.length + 1));
  const auth = request.headers.get("Authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

export function sessionCookie(token: string, maxAge = 7 * 24 * 3600): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function getSession(
  db: DrizzleD1Database<typeof schema>,
  request: Request
): Promise<AuthUser | null> {
  const token = getToken(request);
  if (!token) return null;
  const tokenHash = await digestToken(token);
  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.token, tokenHash))
    .limit(1);
  if (!user) {
    [user] = await db.select().from(schema.users).where(eq(schema.users.token, token)).limit(1);
    if (user) await db.update(schema.users).set({ token: tokenHash }).where(eq(schema.users.id, user.id));
  }
  if (!user || !user.active || !user.tokenExpiresAt) return null;
  if (new Date(user.tokenExpiresAt).getTime() < Date.now()) return null;
  let permissions: string[] = [];
  try { permissions = JSON.parse(user.permissions || "[]") as string[]; } catch { permissions = []; }
  return { id: user.id, username: user.username, role: user.role, storeName: user.storeName, displayName: user.displayName, email: user.email, permissions };
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
    .set({ token: await digestToken(token), tokenExpiresAt: expires })
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
    .where(eq(schema.users.token, await digestToken(token)));
}

/**
 * 数据隔离作用域：
 * - 主账号(master)返回 null → 查询不过滤，可见全部数据
 * - 子账号(store)返回自身 id → 查询按 owner_id 过滤，只能看到自己的数据
 */
export function scopeFor(user: AuthUser | null): number | null {
  if (!user) return null;
  return user.role === "store" ? user.id : null;
}

export function canManage(user: AuthUser | null, permission?: string): boolean {
  if (!user || user.role === "store") return false;
  if (user.role === "master" || user.role === "admin") return true;
  return permission ? user.permissions.includes(permission) : true;
}
