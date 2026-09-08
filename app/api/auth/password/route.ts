import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { ensureSchema, hashPassword } from "../../../../db/init";
import { getSession } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    if (!user) return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    const { password } = await request.json() as { password?: string };
    if (typeof password !== "string" || password.length < 10) return Response.json({ error: "Please use at least 10 characters." }, { status: 400 });
    await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id));
    return Response.json({ message: "Password updated." }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to update password. Please try again." }, { status: 500 });
  }
}
