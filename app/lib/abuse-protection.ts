import { and, eq, gt, sql } from "drizzle-orm";
import type { Db } from "../../db/init";
import { authTokens } from "../../db/schema";

type RateLimitOptions = {
  key: string;
  purpose: string;
  limit: number;
  windowSeconds: number;
};

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((part) => part.toString(16).padStart(2, "0")).join("");
}

export function clientIp(request: Request): string {
  // CF-Connecting-IP is supplied by Cloudflare for proxied requests. Keep a
  // bounded fallback for local development, where that header is absent.
  return (request.headers.get("CF-Connecting-IP") ?? "local").slice(0, 64);
}

export async function rateLimit(
  db: Db,
  { key, purpose, limit, windowSeconds }: RateLimitOptions,
): Promise<{ limited: boolean; retryAfter: number }> {
  const safeWindow = Math.max(1, Math.min(windowSeconds, 24 * 60 * 60));
  const cutoff = sql.raw(`datetime('now', '-${safeWindow} seconds')`);
  const recent = await db
    .select({ id: authTokens.id })
    .from(authTokens)
    .where(and(eq(authTokens.email, key), eq(authTokens.purpose, purpose), gt(authTokens.createdAt, cutoff)))
    .limit(limit);

  return { limited: recent.length >= limit, retryAfter: safeWindow };
}

export async function recordRateLimitAttempt(db: Db, key: string, purpose: string, windowSeconds: number): Promise<void> {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000).toISOString();
  await db.insert(authTokens).values({
    email: key,
    purpose,
    tokenHash: await digest(`rate:${purpose}:${crypto.randomUUID()}`),
    expiresAt,
  });
}

export function rateLimitResponse(retryAfter: number): Response {
  return Response.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) } },
  );
}
