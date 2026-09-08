import { env } from "cloudflare:workers";

export async function GET() {
  const siteKey = (env as Record<string, string | undefined>).NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return Response.json({ siteKey: siteKey ?? "" }, { headers: { "Cache-Control": "no-store" } });
}
