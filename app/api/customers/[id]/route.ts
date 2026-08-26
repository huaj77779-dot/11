import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { customers, orders } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";
import { getSession, scopeFor } from "../../../lib/auth";

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

/** 按账号归属校验后取客户（子账号不可访问他人数据） */
async function getOwnedCustomer(db: ReturnType<typeof getDb>, request: Request, idNum: number) {
  const user = await getSession(db, request);
  const scope = scopeFor(user);
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, idNum), scope != null ? eq(customers.ownerId, scope) : undefined))
    .limit(1);
  return customer;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const { id } = await params;
    const idNum = Number(id);

    const customer = await getOwnedCustomer(db, _request, idNum);
    if (!customer) {
      return Response.json({ error: "客户不存在" }, { status: 404 });
    }

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, idNum))
      .orderBy(desc(orders.createdAt), desc(orders.id));

    return Response.json({
      customer,
      orders: orderRows.map((order) => ({
        ...order,
        customerSnapshot: parseJson(order.customerSnapshot, {}),
        options: parseJson(order.options, []),
        measurements: parseJson(order.measurements, []),
        shippingAddress: parseJson(order.shippingAddress, {}),
      })),
    });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const { id } = await params;
    const idNum = Number(id);

    const customer = await getOwnedCustomer(db, _request, idNum);
    if (!customer) {
      return Response.json({ error: "客户不存在" }, { status: 404 });
    }

    // 级联删除该客户的全部订单，再删除客户档案
    await db.delete(orders).where(eq(orders.customerId, idNum));
    await db.delete(customers).where(eq(customers.id, idNum));

    return Response.json({ deleted: true, customerId: idNum });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    await ensureSchema(db);
    const { id } = await params;
    const idNum = Number(id);

    const existing = await getOwnedCustomer(db, request, idNum);
    if (!existing) {
      return Response.json({ error: "客户不存在" }, { status: 404 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();

    const patch: Record<string, unknown> = {};
    for (const key of [
      "name",
      "height",
      "weight",
      "channelCode",
      "avatarUrl",
      "country",
      "region",
      "city",
      "street",
      "postalCode",
      "notes",
      "measurements",
      "measurementsSavedAt",
    ] as const) {
      if (typeof payload[key] === "string") patch[key] = payload[key];
    }
    patch.updatedAt = now;

    const [updated] = await db
      .update(customers)
      .set(patch)
      .where(eq(customers.id, idNum))
      .returning();

    return Response.json({ customer: updated });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
