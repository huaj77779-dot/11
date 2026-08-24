import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customers as schemaCustomers, orders as schemaOrders, users } from "../../../../db/schema";
import { ensureSchema, hashPassword } from "../../../../db/init";
import { getSession } from "../../../lib/auth";

async function requireMaster(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user || user.role !== "master") {
    return { db, error: Response.json({ error: "仅主账号可操作" }, { status: 403 }) };
  }
  return { db, error: null };
}

/** 子账号列表（含各账号的客户数 / 订单数 / 消费额） */
export async function GET(request: Request) {
  const guard = await requireMaster(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      storeName: users.storeName,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.id));
  const accounts: Array<Record<string, unknown>> = [];
  for (const u of rows) {
    const [cust] = await db
      .select({ n: sql<number>`COUNT(*)` })
      .from(schemaCustomers)
      .where(eq(schemaCustomers.ownerId, u.id));
    const [ord] = await db
      .select({ n: sql<number>`COUNT(*)`, s: sql<number>`COALESCE(SUM(total_price),0)` })
      .from(schemaOrders)
      .where(eq(schemaOrders.ownerId, u.id));
    accounts.push({
      ...u,
      customerCount: cust?.n ?? 0,
      orderCount: ord?.n ?? 0,
      totalSpent: ord?.s ?? 0,
    });
  }
  return Response.json({ users: accounts });
}

/** 创建门店子账号 */
export async function POST(request: Request) {
  const guard = await requireMaster(request);
  if (guard.error) return guard.error;
  const db = guard.db;
  const payload = (await request.json()) as { username?: string; password?: string; storeName?: string };
  const username = (payload.username ?? "").trim();
  const password = String(payload.password ?? "");
  if (!username || password.length < 6) {
    return Response.json({ error: "账号必填，密码至少 6 位" }, { status: 400 });
  }
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (exists[0]) {
    return Response.json({ error: "账号已存在" }, { status: 409 });
  }
  const [created] = await db
    .insert(users)
    .values({
      username,
      passwordHash: await hashPassword(password),
      role: "store",
      storeName: payload.storeName ?? username,
    })
    .returning();
  return Response.json({
    user: { id: created.id, username: created.username, role: created.role, storeName: created.storeName },
  }, { status: 201 });
}

