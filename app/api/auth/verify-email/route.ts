import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authTokens, users } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";
import { createToken, sessionCookie } from "../../../lib/auth";
import { clientIp, rateLimit, rateLimitResponse, recordRateLimitAttempt } from "../../../lib/abuse-protection";

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((part) => part.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const { email: rawEmail, code } = await request.json() as { email?: string; code?: string };
    const email = (rawEmail ?? "").trim().toLowerCase();
    if (!email || !/^\d{6}$/.test(code ?? "")) return Response.json({ error: "Enter the six-digit verification code." }, { status: 400 });
    const db = getDb();
    await ensureSchema(db);
    const key = `verify-email-ip:${clientIp(request)}`;
    const limit = await rateLimit(db, { key, purpose: "verify-email-rate", limit: 8, windowSeconds: 10 * 60 });
    if (limit.limited) return rateLimitResponse(limit.retryAfter);
    const candidates = await db.select().from(authTokens).where(and(eq(authTokens.email, email), eq(authTokens.purpose, "verify-code"), isNull(authTokens.consumedAt), gt(authTokens.expiresAt, new Date().toISOString()))).orderBy(desc(authTokens.createdAt)).limit(3);
    let matched = undefined as typeof candidates[number] | undefined;
    for (const candidate of candidates) {
      const data = JSON.parse(candidate.payload) as { nonce?: string };
      if (data.nonce && candidate.tokenHash === await hash(`verify:${email}:${code}:${data.nonce}`)) { matched = candidate; break; }
    }
    if (!matched) {
      await recordRateLimitAttempt(db, key, "verify-email-rate", 10 * 60);
      return Response.json({ error: "This verification code is invalid or has expired." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const data = JSON.parse(matched.payload) as { passwordHash: string; storeName: string; displayName: string; whatsapp?: string };
    const [existing] = await db.select().from(users).where(eq(users.email, matched.email)).limit(1);
    if (existing) return Response.json({ error: "An account already exists for this email. Please sign in instead." }, { status: 409 });
    const inserted = await db.insert(users).values({ username: matched.email, email: matched.email, passwordHash: data.passwordHash, role: "store", storeName: data.storeName, displayName: data.displayName, whatsapp: data.whatsapp ?? "" }).returning({ id: users.id });
    await db.update(authTokens).set({ consumedAt: new Date().toISOString() }).where(eq(authTokens.id, matched.id));
    const token = await createToken(db, inserted[0].id);
    return Response.json({ message: "Email verified. Your store account is ready.", username: matched.email }, { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to verify this email." }, { status: 500 });
  }
}
