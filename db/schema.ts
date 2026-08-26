import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 账号表：master=主账号 / store=门店子账号 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("store"),
  storeName: text("store_name").notNull().default(""),
  token: text("token"),
  tokenExpiresAt: text("token_expires_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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
