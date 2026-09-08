import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authTokens, users } from "../../../../db/schema";
import { ensureSchema, hashPassword } from "../../../../db/init";
import { env } from "cloudflare:workers";
import { accountEmailShell, sendAccountEmail } from "../../../lib/email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((part) => part.toString(16).padStart(2, "0")).join("");
}

function verificationCode() {
  const number = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return number.toString().padStart(6, "0");
}

async function verifyTurnstile(token: string | undefined, request: Request): Promise<boolean> {
  const secret = (env as Record<string, string | undefined>).TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && result.hostname === "verosuits.com" && result.action === "register";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { email?: string; password?: string; storeName?: string; displayName?: string; whatsapp?: string; turnstileToken?: string };
    const email = (payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const storeName = (payload.storeName ?? "").trim();
    const displayName = (payload.displayName ?? "").trim();
    const whatsapp = (payload.whatsapp ?? "").trim();
    if (!EMAIL.test(email) || password.length < 10 || !storeName || !/^\+?[0-9][0-9\s()-]{6,24}$/.test(whatsapp)) return Response.json({ error: "Please provide your store name, a valid WhatsApp number and work email." }, { status: 400 });
    if (!await verifyTurnstile(payload.turnstileToken, request)) return Response.json({ error: "Please complete the human verification and try again." }, { status: 400 });

    const db = getDb();
    await ensureSchema(db);
    const [existing] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const recent = await db.select({ id: authTokens.id }).from(authTokens).where(and(eq(authTokens.email, email), eq(authTokens.purpose, "verify-code"), gt(authTokens.createdAt, cutoff))).limit(3);
    const recentIp = await db.select({ id: authTokens.id }).from(authTokens).where(and(eq(authTokens.email, `ip:${ip}`), eq(authTokens.purpose, "register-rate"), gt(authTokens.createdAt, cutoff))).limit(6);
    // Send a code for both new and existing addresses. This avoids account
    // enumeration, while letting a returning store owner prove email ownership
    // before being taken to sign-in.
    if (recent.length < 3 && recentIp.length < 5) {
      const code = verificationCode();
      const nonce = crypto.randomUUID();
      await db.insert(authTokens).values({ email: `ip:${ip}`, purpose: "register-rate", tokenHash: await hash(`rate:${crypto.randomUUID()}`), expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() });
      await db.insert(authTokens).values({
        email, purpose: "verify-code", tokenHash: await hash(`verify:${email}:${code}:${nonce}`),
        payload: JSON.stringify({ passwordHash: await hashPassword(password), storeName, displayName, whatsapp, nonce }),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      await sendAccountEmail(email, "Your VEROSUITS verification code", accountEmailShell("Your verification code", `<p>Enter this code to activate your VEROSUITS store account:</p><p style="font-size:32px;letter-spacing:.22em;font-weight:700;color:#174b3d">${code}</p><p>This code expires in 10 minutes and can only be used once.</p>`));
    }
    return Response.json({ message: "If the email can be registered, we have sent a verification code." });
  } catch {
    return Response.json({ error: "Unable to create the account request. Please try again later." }, { status: 500 });
  }
}
