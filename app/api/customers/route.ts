import { and, desc, eq, or, like, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { customers } from "../../../db/schema";
import { ensureSchema } from "../../../db/init";
import { getSession, scopeFor } from "../../lib/auth";

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return `${message}${detail ? `\n${detail}` : ""}`;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    const scope = scopeFor(user);

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim();

    const rows = await db
      .select()
      .from(customers)
      .where(
        and(
          scope != null ? eq(customers.ownerId, scope) : undefined,
          q
            ? or(
                like(customers.name, `%${q}%`),
                like(customers.channelCode, `%${q}%`),
                like(customers.city, `%${q}%`)
              )
            : undefined
        )
      )
      .orderBy(desc(sql`COALESCE(${customers.lastOrderAt}, ${customers.updatedAt})`), desc(customers.id))
      .limit(200);

    return Response.json({ customers: rows });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    const payload = (await request.json()) as Record<string, unknown>;
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    if (!name) return Response.json({ error: "请填写客户姓名" }, { status: 400 });
    const value = (key: string) => typeof payload[key] === "string" ? payload[key] as string : "";
    const now = new Date().toISOString();
    const [customer] = await db.insert(customers).values({
      ownerId: user?.id ?? 0, name,
      height: value("height"), weight: value("weight"), channelCode: value("channelCode"),
      avatarUrl: value("avatarUrl") || null,
      country: value("country"), region: value("region"), city: value("city"), street: value("street"), postalCode: value("postalCode"),
      measurements: value("measurements") || "{}", measurementsSavedAt: now, createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ customer }, { status: 201 });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
