import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orders } from "../../../../db/schema";
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

/** 按账号归属校验后取订单（子账号不可访问他人数据） */
async function getOwnedOrder(db: ReturnType<typeof getDb>, request: Request, idNum: number) {
  const user = await getSession(db, request);
  const scope = scopeFor(user);
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, idNum), scope != null ? eq(orders.ownerId, scope) : undefined))
    .limit(1);
  return order;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    await ensureSchema(db);
    if (!await getSession(db, _request)) {
      return Response.json({ error: "登录后才能查看订单" }, { status: 401 });
    }
    const { id } = await params;
    const order = await getOwnedOrder(db, _request, Number(id));

    if (!order) {
      return Response.json({ error: "订单不存在" }, { status: 404 });
    }

    return Response.json({
      order: {
        ...order,
        customerSnapshot: parseJson(order.customerSnapshot, {}),
        options: parseJson(order.options, []),
        measurements: parseJson(order.measurements, []),
        shippingAddress: parseJson(order.shippingAddress, {}),
      },
    });
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
    if (!await getSession(db, request)) {
      return Response.json({ error: "登录后才能修改订单" }, { status: 401 });
    }
    const { id } = await params;
    const idNum = Number(id);

    const order = await getOwnedOrder(db, request, idNum);
    if (!order) {
      return Response.json({ error: "订单不存在" }, { status: 404 });
    }

    const payload = (await request.json()) as {
      paymentStatus?: string;
      status?: string;
    };
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updatedAt: now };

    if (payload.paymentStatus === "paid" || payload.paymentStatus === "unpaid") {
      patch.paymentStatus = payload.paymentStatus;
    }
    if (typeof payload.status === "string" && payload.status.trim()) {
      patch.status = payload.status.trim();
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, idNum))
      .returning();

    return Response.json({
      order: {
        ...updated,
        customerSnapshot: parseJson(updated.customerSnapshot, {}),
        options: parseJson(updated.options, []),
        measurements: parseJson(updated.measurements, []),
        shippingAddress: parseJson(updated.shippingAddress, {}),
      },
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
    if (!await getSession(db, _request)) {
      return Response.json({ error: "登录后才能删除订单" }, { status: 401 });
    }
    const { id } = await params;
    const idNum = Number(id);

    const order = await getOwnedOrder(db, _request, idNum);
    if (!order) {
      return Response.json({ error: "订单不存在" }, { status: 404 });
    }

    // 删除订单（不影响客户档案的累计订单数 / 累计消费额 / 最近下单时间）
    await db.delete(orders).where(eq(orders.id, idNum));

    return Response.json({
      deleted: true,
      orderId: idNum,
      customerId: order.customerId,
    });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
