import { and, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb } from "../../../../../db";
import { orders } from "../../../../../db/schema";
import { ensureSchema } from "../../../../../db/init";
import { getSession, scopeFor } from "../../../../lib/auth";

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return `${message}${detail ? `\n${detail}` : ""}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    await ensureSchema(db);
    if (!await getSession(db, _request)) {
      return Response.json({ error: "登录后才能查看收款状态" }, { status: 401 });
    }
    const { id } = await params;
    const idNum = Number(id);

    const user = await getSession(db, _request);
    const scope = scopeFor(user);
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, idNum), scope != null ? eq(orders.ownerId, scope) : undefined))
      .limit(1);
    if (!order) {
      return Response.json({ error: "订单不存在" }, { status: 404 });
    }

    // ============================================================
    // 支付状态确认接入点
    // ------------------------------------------------------------
    // 目前为占位实现：直接返回数据库中的 payment_status。
    // 接入真实支付渠道后，请在此处调用外部支付 API 查询该订单的
    // 实际支付结果，例如：
    //   const paymentResult = await payApi.query({ orderNo: order.orderNo });
    //   const paymentStatus = paymentResult.paid ? "paid" : "unpaid";
    // 前端弹窗会每 5 秒轮询本端点，一旦返回 paid 即自动完成收款。
    // ============================================================
    const paymentStatus = order.paymentStatus;

    // 收款二维码内容（占位）。接入真实收款渠道后替换为收款链接/二维码串，
    // 例如支付宝当面付、微信 Native 支付生成的 code_url。
    const qrPayload =
      paymentStatus === "paid"
        ? null
        : `ORDER:${order.orderNo};AMOUNT:${Number(order.totalPrice).toFixed(0)};CURRENCY:${order.currency || "CNY"};CHANNEL:${order.channelCode || "CH"}`;

    const qrDataUrl =
      paymentStatus === "paid" || !qrPayload
        ? null
        : await QRCode.toDataURL(qrPayload, {
            width: 240,
            margin: 1,
            errorCorrectionLevel: "M",
          });

    return Response.json({
      orderId: order.id,
      orderNo: order.orderNo,
      paymentStatus,
      amount: order.totalPrice,
      currency: order.currency ?? "CNY",
      qrPayload,
      qrDataUrl,
    });
  } catch (error) {
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
