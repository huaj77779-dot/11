import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customers, orders, users } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";

type LegacyRow = Record<string, unknown>;

const LEGACY_USERNAMES = new Map<number, string>([
  [1, "admin"],
  [2, "verosuits"],
  [3, "huaj77779@gmail.com"],
  [4, "1429153653@qq.com"],
]);

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isAuthorized(request: Request): boolean {
  const configured = (env as unknown as Record<string, unknown>).LEGACY_MIGRATION_SECRET;
  const supplied = request.headers.get("X-Legacy-Migration-Key");
  return typeof configured === "string" && configured.length >= 32 && supplied === configured;
}

async function targetOwnerMap(db: ReturnType<typeof getDb>): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  for (const [legacyId, username] of LEGACY_USERNAMES) {
    const [account] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
    if (account) result.set(legacyId, account.id);
  }
  return result;
}

async function counts(db: ReturnType<typeof getDb>) {
  const [customerCount] = await db.select({ value: sql<number>`COUNT(*)` }).from(customers);
  const [orderCount] = await db.select({ value: sql<number>`COUNT(*)` }).from(orders);
  const accountRows = await db.select({ id: users.id, username: users.username }).from(users);
  return {
    users: accountRows,
    customers: Number(customerCount?.value ?? 0),
    orders: Number(orderCount?.value ?? 0),
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const db = getDb();
  await ensureSchema(db);
  const payload = (await request.json()) as { phase?: string; rows?: LegacyRow[] };
  const phase = textValue(payload.phase);
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const binding = (env as unknown as { DB: D1Database }).DB;

  if (phase === "preflight" || phase === "verify") {
    return Response.json(await counts(db), { headers: { "Cache-Control": "no-store" } });
  }

  if (phase === "users") {
    if (rows.length > 20) return Response.json({ error: "Too many users" }, { status: 400 });
    for (const row of rows) {
      const username = textValue(row.username).trim();
      if (!username) continue;
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
      if (existing[0]) continue;
      await db.insert(users).values({
        username,
        passwordHash: textValue(row.password_hash),
        role: textValue(row.role, "store"),
        storeName: textValue(row.store_name, username),
        displayName: textValue(row.display_name),
        email: textValue(row.email),
        whatsapp: textValue(row.whatsapp),
        permissions: textValue(row.permissions, "[]"),
        active: numberValue(row.active, 1) !== 0,
        token: null,
        tokenExpiresAt: null,
        createdAt: textValue(row.created_at, new Date().toISOString()),
      });
    }
    return Response.json({ ok: true, ownerMap: Object.fromEntries(await targetOwnerMap(db)) });
  }

  if (phase === "customers") {
    if (rows.length > 100) return Response.json({ error: "Too many customers" }, { status: 400 });
    const owners = await targetOwnerMap(db);
    const statements = rows.map((row) => {
      const ownerId = owners.get(numberValue(row.owner_id));
      if (!ownerId) throw new Error(`Missing target owner for legacy owner ${row.owner_id}`);
      return binding.prepare(`INSERT OR IGNORE INTO customers (
        id, owner_id, name, height, weight, channel_code, avatar_url, country, region, city,
        street, postal_code, notes, measurements, measurements_saved_at, total_orders,
        total_spent, last_order_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          numberValue(row.id), ownerId, textValue(row.name), textValue(row.height), textValue(row.weight),
          textValue(row.channel_code), row.avatar_url ?? null, textValue(row.country), textValue(row.region),
          textValue(row.city), textValue(row.street), textValue(row.postal_code), textValue(row.notes),
          textValue(row.measurements, "{}"), row.measurements_saved_at ?? null, numberValue(row.total_orders),
          numberValue(row.total_spent), row.last_order_at ?? null, textValue(row.created_at), textValue(row.updated_at)
        );
    });
    if (statements.length) await binding.batch(statements);
    return Response.json({ ok: true, inserted: statements.length });
  }

  if (phase === "orders") {
    if (rows.length > 100) return Response.json({ error: "Too many orders" }, { status: 400 });
    const owners = await targetOwnerMap(db);
    const statements = rows.map((row) => {
      const ownerId = owners.get(numberValue(row.owner_id));
      if (!ownerId) throw new Error(`Missing target owner for legacy owner ${row.owner_id}`);
      return binding.prepare(`INSERT OR IGNORE INTO orders (
        id, owner_id, order_no, customer_id, customer_snapshot, status, payment_status,
        garment_type, garment_name, fabric_code, fabric_name, fabric_mill, base_price,
        fabric_price, option_extra, shipping_fee, total_price, currency, weight_kg,
        options, measurements, shipping_address, channel_code, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          numberValue(row.id), ownerId, textValue(row.order_no), numberValue(row.customer_id),
          textValue(row.customer_snapshot, "{}"), textValue(row.status, "pending"),
          textValue(row.payment_status, "unpaid"), textValue(row.garment_type), textValue(row.garment_name),
          row.fabric_code ?? null, row.fabric_name ?? null, row.fabric_mill ?? null,
          numberValue(row.base_price), numberValue(row.fabric_price), numberValue(row.option_extra),
          numberValue(row.shipping_fee), numberValue(row.total_price), textValue(row.currency, "CNY"),
          numberValue(row.weight_kg), textValue(row.options, "[]"), textValue(row.measurements, "[]"),
          textValue(row.shipping_address, "{}"), textValue(row.channel_code), textValue(row.created_at),
          textValue(row.updated_at)
        );
    });
    if (statements.length) await binding.batch(statements);
    return Response.json({ ok: true, inserted: statements.length });
  }

  return Response.json({ error: "Unknown phase" }, { status: 400 });
}
