import { getDb } from "../../../../db";
import { ensureSchema } from "../../../../db/init";
import { getSession } from "../../../lib/auth";

export async function GET(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    if (!user) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    return Response.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}


