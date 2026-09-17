import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 账号表：master=主账号 / store=门店子账号 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("store"),
  storeName: text("store_name").notNull().default(""),
  displayName: text("display_name").notNull().default(""),
  email: text("email").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  permissions: text("permissions").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  token: text("token"),
  tokenExpiresAt: text("token_expires_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** Single-use, time-limited tokens for account verification and password resets. */
export const authTokens = sqliteTable("auth_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  purpose: text("purpose").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  payload: text("payload").notNull().default("{}"),
  expiresAt: text("expires_at").notNull(),
  consumedAt: text("consumed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 可由后台维护的网站文案、图片和多语言字段。 */
export const siteContent = sqliteTable("site_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  contentKey: text("content_key").notNull(),
  locale: text("locale").notNull().default("en"),
  value: text("value").notNull().default(""),
  valueType: text("value_type").notNull().default("text"),
  updatedBy: integer("updated_by").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 后台发布的新闻文章。 */
export const newsArticles = sqliteTable("news_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  locale: text("locale").notNull().default("en"),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  category: text("category").notNull().default("Company News"),
  coverImage: text("cover_image"),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  authorId: integer("author_id").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 官网询盘；先入库，再尝试发送外部通知。 */
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  contact: text("contact").notNull(),
  message: text("message").notNull().default(""),
  source: text("source").notNull().default("website"),
  status: text("status").notNull().default("new"),
  assigneeId: integer("assignee_id").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 面料库（后台批量上架管理） */
export const fabrics = sqliteTable("fabrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  mill: text("mill").notNull().default(""),
  /** 面料本编号（同一品牌下的分册，如 6410 / 6411） */
  book: text("book").notNull().default(""),
  tone: text("tone").notNull().default("navy"),
  meta: text("meta").notNull().default(""),
  stock: text("stock").notNull().default("现货"),
  price: real("price").notNull().default(0),
  imageUrl: text("image_url"),
  garmentType: text("garment_type").notNull().default("jacket"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 款式选项库（后台管理：分组/选项/加价/图片） */
export const styleOptions = sqliteTable("style_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  garmentType: text("garment_type").notNull(),
  groupTitle: text("group_title").notNull(),
  item: text("item").notNull(),
  surcharge: real("surcharge").notNull().default(0),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** Curated 1688 accessories collected by the local browser workflow. */
export const accessoryProducts = sqliteTable("accessory_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().default(0),
  category: text("category").notNull(),
  title: text("title").notNull().default(""),
  supplierName: text("supplier_name").notNull().default(""),
  sourceUrl: text("source_url").notNull(),
  offerId: text("offer_id").notNull().default(""),
  imageUrl: text("image_url"),
  sourceMaterial: text("source_material").notNull().default(""),
  materialGroup: text("material_group").notNull().default("unknown"),
  sourceColor: text("source_color").notNull().default(""),
  colorGroup: text("color_group").notNull().default("unknown"),
  moq: integer("moq"),
  priceTiers: text("price_tiers").notNull().default("[]"),
  skus: text("skus").notNull().default("[]"),
  status: text("status").notNull().default("pending"),
  checkedAt: text("checked_at"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 客户档案表 */
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().default(0),
  name: text("name").notNull(),
  height: text("height").notNull().default(""),
  weight: text("weight").notNull().default(""),
  channelCode: text("channel_code").notNull().default(""),
  avatarUrl: text("avatar_url"),
  country: text("country").notNull().default(""),
  region: text("region").notNull().default(""),
  city: text("city").notNull().default(""),
  street: text("street").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  notes: text("notes").notNull().default(""),
  /** 客户历史尺寸（JSON 字符串：{ "jacket:胸围": ["净体","成衣"], ... }） */
  measurements: text("measurements").notNull().default("{}"),
  measurementsSavedAt: text("measurements_saved_at"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  lastOrderAt: text("last_order_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** 历史订单表 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().default(0),
  orderNo: text("order_no").notNull().unique(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  /** 下单时客户信息快照（JSON 字符串） */
  customerSnapshot: text("customer_snapshot").notNull().default("{}"),
  status: text("status").notNull().default("pending"),
  /** 付款状态：unpaid 未付款 / paid 已付款 */
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  garmentType: text("garment_type").notNull(),
  garmentName: text("garment_name").notNull(),
  fabricCode: text("fabric_code"),
  fabricName: text("fabric_name"),
  fabricMill: text("fabric_mill"),
  basePrice: real("base_price").notNull().default(0),
  fabricPrice: real("fabric_price").notNull().default(0),
  optionExtra: real("option_extra").notNull().default(0),
  shippingFee: real("shipping_fee").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
  currency: text("currency").notNull().default("CNY"),
  weightKg: real("weight_kg").notNull().default(0),
  /** 款式选项数组（JSON 字符串） */
  options: text("options").notNull().default("[]"),
  /** 尺寸明细数组（JSON 字符串） */
  measurements: text("measurements").notNull().default("[]"),
  /** 收货地址快照（JSON 字符串） */
  shippingAddress: text("shipping_address").notNull().default("{}"),
  channelCode: text("channel_code").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Fabric = typeof fabrics.$inferSelect;
export type NewFabric = typeof fabrics.$inferInsert;
export type StyleOption = typeof styleOptions.$inferSelect;
export type NewStyleOption = typeof styleOptions.$inferInsert;
export type AccessoryProduct = typeof accessoryProducts.$inferSelect;
export type NewAccessoryProduct = typeof accessoryProducts.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
