import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { customers, orders, type NewCustomer } from "../../../db/schema";
import { ensureSchema } from "../../../db/init";
import { getSession, scopeFor } from "../../lib/auth";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

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
    const customerId = url.searchParams.get("customerId");

    const rows = await db
      .select({
        id: orders.id,
        orderNo: orders.orderNo,
        customerId: orders.customerId,
        customerName: customers.name,
        customerSnapshot: orders.customerSnapshot,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        garmentType: orders.garmentType,
        garmentName: orders.garmentName,
        fabricCode: orders.fabricCode,
        fabricName: orders.fabricName,
        fabricMill: orders.fabricMill,
        totalPrice: orders.totalPrice,
        currency: orders.currency,
        weightKg: orders.weightKg,
        channelCode: orders.channelCode,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(
        customerId
          ? sql`${orders.customerId} = ${Number(customerId)}${scope != null ? sql` AND ${orders.ownerId} = ${scope}` : sql``}`
          : scope != null
            ? sql`${orders.ownerId} = ${scope}`
            : undefined
      )
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(200);

    // 将 customerSnapshot 解析为对象返回，供前端直接展示客户姓名
    return Response.json({
      orders: rows.map((row) => ({
        ...row,
        customerSnapshot: parseJson(row.customerSnapshot, {}),
      })),
    });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

type OrderItem = {
  garmentType?: string;
  garmentName?: string;
  fabricCode?: string;
  fabricName?: string;
  fabricMill?: string;
  basePrice?: number;
  fabricPrice?: number;
  optionExtra?: number;
  shippingFee?: number;
  totalPrice?: number;
  currency?: string;
  weightKg?: number;
  options?: Array<{ group: string; item: string; price?: number }>;
  measurements?: Array<{ field: string; net?: string; finished?: string }>;
  shippingAddress?: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const user = await getSession(db, request);
    const ownerId = user?.id ?? 0;

    const payload = (await request.json()) as {
      customer?: Partial<NewCustomer> & { name?: string };
      order?: OrderItem & { items?: OrderItem[] };
    };

    const customerInput = payload.customer ?? {};
    const orderInput = payload.order ?? {};

    const name = customerInput.name?.trim() ?? "";
    if (!name) {
      return Response.json({ error: "客户姓名不能为空" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const channelCode = (customerInput.channelCode ?? "").trim().toUpperCase();

    // 支持一次提交多件产品（items），每件产品独立生成一张订单
    const items: OrderItem[] =
      orderInput.items && orderInput.items.length ? orderInput.items : [orderInput];
    if (items.length === 0) {
      return Response.json({ error: "订单产品不能为空" }, { status: 400 });
    }
    const sumTotal = items.reduce(
      (sum, item) => sum + (Number(item.totalPrice) || 0),
      0
    );

    // 1) 按 姓名 + 渠道 + 归属账号 匹配已有客户，无则创建（upsert）
    const existing = await db
      .select()
      .from(customers)
      .where(
        sql`${customers.name} = ${name} AND ${customers.channelCode} = ${channelCode} AND ${customers.ownerId} = ${ownerId}`
      )
      .limit(1);

    let customer: NewCustomer & { id: number };
    if (existing[0]) {
      const base = existing[0];
      const [updated] = await db
        .update(customers)
        .set({
          height: customerInput.height ?? base.height,
          weight: customerInput.weight ?? base.weight,
          avatarUrl: customerInput.avatarUrl ?? base.avatarUrl,
          country: customerInput.country ?? base.country,
          region: customerInput.region ?? base.region,
          city: customerInput.city ?? base.city,
          street: customerInput.street ?? base.street,
          postalCode: customerInput.postalCode ?? base.postalCode,
          totalOrders: (base.totalOrders ?? 0) + items.length,
          totalSpent: (base.totalSpent ?? 0) + sumTotal,
          lastOrderAt: now,
          updatedAt: now,
        })
        .where(eq(customers.id, base.id))
        .returning();
      customer = updated;
    } else {
      const [created] = await db
        .insert(customers)
        .values({
          ownerId,
          name,
          height: customerInput.height ?? "",
          weight: customerInput.weight ?? "",
          channelCode,
          avatarUrl: customerInput.avatarUrl ?? null,
          country: customerInput.country ?? "",
          region: customerInput.region ?? "",
          city: customerInput.city ?? "",
          street: customerInput.street ?? "",
          postalCode: customerInput.postalCode ?? "",
          notes: customerInput.notes ?? "",
          totalOrders: items.length,
          totalSpent: sumTotal,
          lastOrderAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      customer = created;
    }

    // 2) 生成订单号：{渠道}-{YYYYMMDD}-{当天最大序号+1}，多件依次递增
    //    用 MAX 而非 COUNT，避免删除订单后序号重复导致唯一约束冲突
    const datePart = now.slice(0, 10).replace(/-/g, "");
    const prefix = `${channelCode || "CH"}-${datePart}-`;
    const [maxRow] = await db
      .select({ m: sql<number>`COALESCE(MAX(CAST(substr(order_no, -2) AS INTEGER)), 0)` })
      .from(orders)
      .where(sql`order_no LIKE ${prefix + "%"}`);
    let seq = (maxRow?.m ?? 0) + 1;

    const customerSnapshot = {
      name,
      height: customer.height,
      weight: customer.weight,
      channelCode,
    };

    // 3) 逐件写入订单
    const createdOrders = [];
    for (const item of items) {
      const orderNo = `${prefix}${String(seq).padStart(2, "0")}`;
      seq += 1;
      const [order] = await db
        .insert(orders)
        .values({
          ownerId,
          orderNo,
          customerId: customer.id,
          customerSnapshot: JSON.stringify(customerSnapshot),
          status: "pending",
          garmentType: item.garmentType ?? "",
          garmentName: item.garmentName ?? "",
          fabricCode: item.fabricCode ?? null,
          fabricName: item.fabricName ?? null,
          fabricMill: item.fabricMill ?? null,
          basePrice: Number(item.basePrice) || 0,
          fabricPrice: Number(item.fabricPrice) || 0,
          optionExtra: Number(item.optionExtra) || 0,
          shippingFee: Number(item.shippingFee) || 0,
          totalPrice: Number(item.totalPrice) || 0,
          currency: item.currency ?? "CNY",
          weightKg: Number(item.weightKg) || 0,
          options: JSON.stringify(item.options ?? []),
          measurements: JSON.stringify(item.measurements ?? []),
          shippingAddress: JSON.stringify(item.shippingAddress ?? {}),
          channelCode,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      createdOrders.push({
        ...order,
        options: parseJson(order.options, []),
        measurements: parseJson(order.measurements, []),
        shippingAddress: parseJson(order.shippingAddress, {}),
      });
    }

    return Response.json(
      {
        orders: createdOrders,
        order: createdOrders[0],
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
