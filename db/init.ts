import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Db = DrizzleD1Database<typeof schema>;

/** 与 db/schema.ts 保持一致的建表 SQL（幂等）。 */
const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'store',
    store_name TEXT NOT NULL DEFAULT '',
    token TEXT,
    token_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS fabrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mill TEXT NOT NULL DEFAULT '',
    book TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'navy',
    meta TEXT NOT NULL DEFAULT '',
    stock TEXT NOT NULL DEFAULT '现货',
    price REAL NOT NULL DEFAULT 0,
    image_url TEXT,
    garment_type TEXT NOT NULL DEFAULT 'jacket',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS style_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garment_type TEXT NOT NULL,
    group_title TEXT NOT NULL,
    item TEXT NOT NULL,
    surcharge REAL NOT NULL DEFAULT 0,
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    height TEXT NOT NULL DEFAULT '',
    weight TEXT NOT NULL DEFAULT '',
    channel_code TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    country TEXT NOT NULL DEFAULT '',
    region TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    street TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    measurements TEXT NOT NULL DEFAULT '{}',
    measurements_saved_at TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent REAL NOT NULL DEFAULT 0,
    last_order_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    customer_snapshot TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    garment_type TEXT NOT NULL,
    garment_name TEXT NOT NULL,
    fabric_code TEXT,
    fabric_name TEXT,
    fabric_mill TEXT,
    base_price REAL NOT NULL DEFAULT 0,
    fabric_price REAL NOT NULL DEFAULT 0,
    option_extra REAL NOT NULL DEFAULT 0,
    shipping_fee REAL NOT NULL DEFAULT 0,
    total_price REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'CNY',
    weight_kg REAL NOT NULL DEFAULT 0,
    options TEXT NOT NULL DEFAULT '[]',
    measurements TEXT NOT NULL DEFAULT '[]',
    shipping_address TEXT NOT NULL DEFAULT '{}',
    channel_code TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

/** SHA-256 密码哈希（服务端用，无外部依赖） */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`atelier::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 确保数据表存在。幂等，可在每次请求开头安全调用。 */
export async function ensureSchema(db: Db): Promise<void> {
  for (const ddl of DDL_STATEMENTS) {
    await db.run(sql.raw(ddl));
  }
  // 兼容旧库：为已存在的表补充新增列（CREATE TABLE IF NOT EXISTS 不会修改已有表）
  await ensureColumn(db, "orders", "payment_status", "TEXT NOT NULL DEFAULT 'unpaid'");
  await ensureColumn(db, "customers", "owner_id", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "customers", "measurements", "TEXT NOT NULL DEFAULT '{}'");
  await ensureColumn(db, "customers", "measurements_saved_at", "TEXT");
  await ensureColumn(db, "orders", "owner_id", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(db, "fabrics", "book", "TEXT NOT NULL DEFAULT ''");
  // 初始化默认主账号 admin / admin123
  const [master] = await db
    .select({ id: sql<number>`id` })
    .from(schema.users)
    .where(sql`role = 'master'`)
    .limit(1);
  if (!master) {
    await db.insert(schema.users).values({
      username: "admin",
      passwordHash: await hashPassword("admin123"),
      role: "master",
      storeName: "总部管理账号",
    });
  }
}

async function ensureColumn(
  db: Db,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const rows = await db.all<{ name: string }>(
    sql`SELECT name FROM pragma_table_info(${table})`
  );
  if (!rows.some((row) => row.name === column)) {
    await db.run(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
  }
}
