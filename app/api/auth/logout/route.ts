import { getDb } from "../../../../db";
import { ensureSchema } from "../../../../db/init";
import { clearSessionCookie, clearToken } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    await clearToken(db, request);
    return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(), "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}


