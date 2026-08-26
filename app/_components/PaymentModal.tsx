"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
import { apiFetch } from "../lib/api";
import type { OrderDetailRow } from "./OrderDetail";

type PaymentStatusResp = {
  orderId: number;
  orderNo: string;
  paymentStatus: "unpaid" | "paid";
  amount: number;
  currency: string;
  qrPayload: string | null;
  qrDataUrl: string | null;
};

export function PaymentModal({
  order,
  onClose,
  onPaid,
}: {
  order: OrderDetailRow;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t } = useLocale();
  const { money } = useCurrency();
  const [status, setStatus] = useState<PaymentStatusResp | null>(null);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const check = useCallback(async () => {
    try {
      const data = await apiFetch<PaymentStatusResp>(`/api/orders/${order.id}/payment-status`);
      setStatus(data);
      setError("");
      if (data.paymentStatus === "paid" && !closedRef.current) {
        stopPolling();
        setPaid(true);
        setTimeout(() => {
          if (!closedRef.current) {
            closedRef.current = true;
            onPaid();
          }
        }, 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "查询失败");
    }
  }, [order.id, onPaid, stopPolling]);

  useEffect(() => {
    void check();
    timerRef.current = setInterval(() => void check(), 5000);
    return () => {
      stopPolling();
      closedRef.current = true;
    };
  }, [check, stopPolling]);

  const close = () => {
    closedRef.current = true;
    stopPolling();
    onClose();
  };

  const amount = status ? Number(status.amount) : Number(order.totalPrice ?? 0);

  return (
    <div className="pay-modal-backdrop" onMouseDown={close}>
      <div className="pay-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="pay-modal-head">
          <div>
            <p className="eyebrow">PAYMENT QR CODE</p>
            <h3>{t("pay.title")}</h3>
          </div>
          <button className="mgmt-close" onClick={close} aria-label={t("common.close")}>
            ×
          </button>
        </div>
        <div className="pay-modal-body">
          <div className="pay-modal-order">
            <span>
              {t("order.orderNo")} <b>{order.orderNo}</b>
            </span>
            <span>
              {t("pay.amount")} <b>{money(amount)}</b>
            </span>
          </div>

          {paid ? (
            <div className="pay-modal-paid">
              <span className="pay-check">✓</span>
              <b>{t("pay.received")}</b>
              <p>{t("pay.receivedSub")}</p>
            </div>
          ) : (
            <>
              <div className="pay-qr">
                {status?.qrDataUrl ? (
                  <img src={status.qrDataUrl} alt={`QR ${order.orderNo}`} />
                ) : (
                  <span className="pay-qr-loading">{t("pay.loading")}</span>
                )}
              </div>
              <p className="pay-hint">
                {t("pay.hint")}
              </p>
              {error && <p className="pay-error">{t("pay.error")}：{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
