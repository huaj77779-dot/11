import { env } from "cloudflare:workers";

const FROM = "VEROSUITS <accounts@verosuits.com>";

export async function sendAccountEmail(to: string, subject: string, html: string): Promise<void> {
  const key = (env as Record<string, string | undefined>).RESEND_API_KEY;
  if (!key) throw new Error("Email service is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error("Unable to send email");
}

export function accountEmailShell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Arial,sans-serif;color:#18362f"><main style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;padding:36px"><p style="letter-spacing:.16em;font-size:12px;font-weight:700">VEROSUITS</p><h1 style="font-size:24px">${title}</h1>${body}<p style="color:#6b7773;font-size:13px">If you did not request this, you can safely ignore this email.</p></main></body></html>`;
}
