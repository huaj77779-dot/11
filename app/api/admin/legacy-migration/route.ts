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

function nullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
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
    try {
      const owners = await targetOwnerMap(db);
      const values = rows.map((row) => {
        const ownerId = owners.get(numberValue(row.owner_id));
        if (!ownerId) throw new Error(`Missing target owner for legacy owner ${row.owner_id}`);
        return {
          id: numberValue(row.id), ownerId, name: textValue(row.name), height: textValue(row.height),
          weight: textValue(row.weight), channelCode: textValue(row.channel_code),
          avatarUrl: nullableText(row.avatar_url), country: textValue(row.country), region: textValue(row.region),
          city: textValue(row.city), street: textValue(row.street), postalCode: textValue(row.postal_code),
          notes: textValue(row.notes), measurements: textValue(row.measurements, "{}"),
          measurementsSavedAt: nullableText(row.measurements_saved_at), totalOrders: numberValue(row.total_orders),
          totalSpent: numberValue(row.total_spent), lastOrderAt: nullableText(row.last_order_at),
          createdAt: textValue(row.created_at), updatedAt: textValue(row.updated_at),
        };
      });
      if (values.length) await db.insert(customers).values(values).onConflictDoNothing();
      return Response.json({ ok: true, inserted: values.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Customer migration failed";
      console.error("Legacy customer migration failed", error);
      return Response.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  }

  if (phase === "orders") {
    if (rows.length > 100) return Response.json({ error: "Too many orders" }, { status: 400 });
    try {
      const owners = await targetOwnerMap(db);
      const values = rows.map((row) => {
        const ownerId = owners.get(numberValue(row.owner_id));
        if (!ownerId) throw new Error(`Missing target owner for legacy owner ${row.owner_id}`);
        return {
          id: numberValue(row.id), ownerId, orderNo: textValue(row.order_no),
          customerId: numberValue(row.customer_id), customerSnapshot: textValue(row.customer_snapshot, "{}"),
          status: textValue(row.status, "pending"), paymentStatus: textValue(row.payment_status, "unpaid"),
          garmentType: textValue(row.garment_type), garmentName: textValue(row.garment_name),
          fabricCode: nullableText(row.fabric_code), fabricName: nullableText(row.fabric_name),
          fabricMill: nullableText(row.fabric_mill), basePrice: numberValue(row.base_price),
          fabricPrice: numberValue(row.fabric_price), optionExtra: numberValue(row.option_extra),
          shippingFee: numberValue(row.shipping_fee), totalPrice: numberValue(row.total_price),
          currency: textValue(row.currency, "CNY"), weightKg: numberValue(row.weight_kg),
          options: textValue(row.options, "[]"), measurements: textValue(row.measurements, "[]"),
          shippingAddress: textValue(row.shipping_address, "{}"), channelCode: textValue(row.channel_code),
          createdAt: textValue(row.created_at), updatedAt: textValue(row.updated_at),
        };
      });
      if (values.length) await db.insert(orders).values(values).onConflictDoNothing();
      return Response.json({ ok: true, inserted: values.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order migration failed";
      console.error("Legacy order migration failed", error);
      return Response.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  }

  return Response.json({ error: "Unknown phase" }, { status: 400 });
}
