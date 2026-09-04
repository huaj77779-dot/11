import { desc, eq } from "drizzle-orm";
import { customers, orders } from "../../../../db/schema";
import { requireAdmin } from "../../../lib/admin";

export async function GET(request: Request) {
  const guard = await requireAdmin(request, "business");
  if (guard.error) return guard.error;
  const [customerRows, orderRows] = await Promise.all([
    guard.db.select().from(customers).orderBy(desc(customers.updatedAt), desc(customers.id)).limit(300),
    guard.db.select({ id: orders.id, orderNo: orders.orderNo, customerId: orders.customerId, status: orders.status, paymentStatus: orders.paymentStatus, garmentName: orders.garmentName, totalPrice: orders.totalPrice, currency: orders.currency, createdAt: orders.createdAt }).from(orders).orderBy(desc(orders.createdAt), desc(orders.id)).limit(300),
  ]);
  return Response.json({ customers: customerRows, orders: orderRows }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request, "business");
  if (guard.error) return guard.error;
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: "无效订单" }, { status: 400 });
  const orderStatuses = new Set(["pending", "confirmed", "production", "shipped", "completed", "cancelled"]);
  const paymentStatuses = new Set(["unpaid", "paid", "refunded"]);
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (orderStatuses.has(String(body.status))) patch.status = String(body.status);
  if (paymentStatuses.has(String(body.paymentStatus))) patch.paymentStatus = String(body.paymentStatus);
  if (Object.keys(patch).length === 1) return Response.json({ error: "无有效更新" }, { status: 400 });
  const [order] = await guard.db.update(orders).set(patch).where(eq(orders.id, id)).returning();
  return order ? Response.json({ order }) : Response.json({ error: "订单不存在" }, { status: 404 });
}
