import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
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
    display_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    permissions TEXT NOT NULL DEFAULT '[]',
    active INTEGER NOT NULL DEFAULT 1,
    token TEXT,
    token_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    purpose TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    payload TEXT NOT NULL DEFAULT '{}',
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_auth_tokens_email_purpose_created ON auth_tokens(email, purpose, created_at)`,
  `CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    content_key TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'en',
    value TEXT NOT NULL DEFAULT '',
    value_type TEXT NOT NULL DEFAULT 'text',
    updated_by INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_site_content_key_locale ON site_content(content_key, locale)`,
  `CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    locale TEXT NOT NULL DEFAULT 'en',
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Company News',
    cover_image TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TEXT,
    author_id INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_news_status_published ON news_articles(status, published_at)`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    contact TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'new',
    assignee_id INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at)`,
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

/** Password hashing and legacy verification (server-side, no external dependency). */
const PASSWORD_ITERATIONS = 100_000;
const PASSWORD_PREFIX = "pbkdf2-sha256";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string): Uint8Array {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) throw new Error("Invalid hex");
  return new Uint8Array(value.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a[i] ^ b[i];
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS }, key, 256);
  return `${PASSWORD_PREFIX}$${PASSWORD_ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

async function legacyHashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`atelier::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

export async function verifyPassword(password: string, stored: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (!stored.startsWith(`${PASSWORD_PREFIX}$`)) {
    return { valid: timingSafeEqual(fromHex(await legacyHashPassword(password)), fromHex(stored)), needsUpgrade: true };
  }
  const [, iterationsRaw, saltHex, expectedHex] = stored.split("$");
  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000) return { valid: false, needsUpgrade: false };
  const saltBytes = fromHex(saltHex);
  const salt = new ArrayBuffer(saltBytes.length);
  new Uint8Array(salt).set(saltBytes);
  const expected = fromHex(expectedHex);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, expected.length * 8);
  return { valid: timingSafeEqual(new Uint8Array(bits), expected), needsUpgrade: iterations < PASSWORD_ITERATIONS };
}

/**
 * 确保数据表存在。幂等，可在每次请求开头安全调用。
 *
 * 性能：DDL 检查只需执行一次（建表/补列/初始化账号均为幂等操作）。
 * dev 模式下 D1 每查询约 100ms，ensureSchema 全量 13+ 次查询约 1.3s，
 * 且 vinext dev 用隔离上下文执行路由（内存缓存跨请求不可靠）。
 * 因此用「meta 表落库标记」做持久化快速路径：
 * 已初始化后每次请求只查 1 次标记（≈100ms），跳过全部 DDL。
 *
 * SCHEMA_VERSION：修改 DDL_STATEMENTS / ensureColumn 清单后必须 +1，
 * 否则已有库会因标记命中而跳过新迁移。
 */
const SCHEMA_VERSION = 6;
const SCHEMA_META = "schema_meta";
const SCHEMA_FLAG_KEY = "schema_initialized_v" + SCHEMA_VERSION;
const SCHEMA_KEY = "__tailorsupply_schema_ready_v" + SCHEMA_VERSION;
const STORE_ACCOUNTS_KEY = "__tailorsupply_store_accounts_ready";
type G = typeof globalThis & {
  [SCHEMA_KEY]?: boolean;
  [STORE_ACCOUNTS_KEY]?: boolean;
};

export async function ensureSchema(db: Db): Promise<void> {
  const g = globalThis as G;
  if (g[SCHEMA_KEY]) {
    if (!g[STORE_ACCOUNTS_KEY]) {
      await ensureStoreAccounts(db);
      g[STORE_ACCOUNTS_KEY] = true;
    }
    return;
  }

  // 持久化快速路径：meta 表存在性 + 标记（2 次查询；比全量 13+ 次便宜得多）
  await db.run(sql.raw(`CREATE TABLE IF NOT EXISTS ${SCHEMA_META} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`));
  const rows = await db.all<{ value: string }>(
    sql`SELECT value FROM ${sql.raw(SCHEMA_META)} WHERE key = ${SCHEMA_FLAG_KEY}`
  );
  if (rows.length === 0) {
    await doEnsureSchema(db);
    await db.run(sql.raw(`INSERT OR REPLACE INTO ${SCHEMA_META} (key, value) VALUES ('${SCHEMA_FLAG_KEY}', '1')`));
  }
  g[SCHEMA_KEY] = true;
  await ensureStoreAccounts(db);
  g[STORE_ACCOUNTS_KEY] = true;
}

async function doEnsureSchema(db: Db): Promise<void> {
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
  await ensureColumn(db, "users", "display_name", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, "users", "email", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, "users", "whatsapp", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, "users", "permissions", "TEXT NOT NULL DEFAULT '[]'");
  await ensureColumn(db, "users", "active", "INTEGER NOT NULL DEFAULT 1");
  // Bootstrap or secure the master account from a deployment secret.
  const [master] = await db
    .select()
    .from(schema.users)
    .where(sql`role = 'master'`)
    .limit(1);
  const initialPassword = (env as Record<string, string | undefined>).INITIAL_ADMIN_PASSWORD;
  if (!master && initialPassword && initialPassword.length >= 12) {
    await db.insert(schema.users).values({
      username: "admin",
      passwordHash: await hashPassword(initialPassword),
      role: "master",
      storeName: "总部管理账号",
    });
  } else if (master && initialPassword && initialPassword.length >= 12 && master.username === "admin" && master.passwordHash === await legacyHashPassword("admin123")) {
    await db.update(schema.users)
      .set({ passwordHash: await hashPassword(initialPassword), token: null, tokenExpiresAt: null })
      .where(sql`id = ${master.id}`);
  }
}

async function ensureStoreAccounts(db: Db): Promise<void> {
  const runtimeEnv = env as Record<string, string | undefined>;
  const seeds = [
    { username: "store01", password: runtimeEnv.INITIAL_STORE01_PASSWORD, storeName: "门店 01" },
    { username: "store02", password: runtimeEnv.INITIAL_STORE02_PASSWORD, storeName: "门店 02" },
    { username: "store03", password: runtimeEnv.INITIAL_STORE03_PASSWORD, storeName: "门店 03" },
  ];

  for (const seed of seeds) {
    if (!seed.password || seed.password.length < 12) continue;
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`username = ${seed.username}`)
      .limit(1);
    if (existing) continue;
    await db.insert(schema.users).values({
      username: seed.username,
      passwordHash: await hashPassword(seed.password),
      role: "store",
      storeName: seed.storeName,
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
