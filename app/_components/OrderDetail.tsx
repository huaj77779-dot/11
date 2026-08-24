"use client";

import { getLocale, useLocale, type Locale } from "../lib/i18n";

export type OrderDetailRow = {
  id: number;
  orderNo: string;
  customerId: number;
  customerSnapshot?: Record<string, string>;
  status: string;
  paymentStatus?: string;
  garmentType: string;
  garmentName: string;
  fabricCode?: string | null;
  fabricName?: string | null;
  fabricMill?: string | null;
  basePrice?: number;
  fabricPrice?: number;
  optionExtra?: number;
  shippingFee?: number;
  totalPrice: number;
  currency?: string;
  weightKg?: number;
  options?: Array<{ group: string; item: string; price?: number }>;
  measurements?: Array<{ field: string; net?: string; finished?: string }>;
  shippingAddress?: Record<string, string>;
  channelCode?: string;
  createdAt?: string;
};

const STATUS_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  pending: { zh: "待确认", en: "Pending", de: "Offen", ja: "未確認" },
  confirmed: { zh: "已确认", en: "Confirmed", de: "Bestätigt", ja: "確認済み" },
  in_production: { zh: "生产中", en: "In Production", de: "In Produktion", ja: "生産中" },
  shipped: { zh: "已发货", en: "Shipped", de: "Versendet", ja: "発送済み" },
  completed: { zh: "已完成", en: "Completed", de: "Abgeschlossen", ja: "完了" },
  cancelled: { zh: "已取消", en: "Cancelled", de: "Storniert", ja: "キャンセル" },
};

const PAYMENT_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  unpaid: { zh: "未付款", en: "Unpaid", de: "Unbezahlt", ja: "未払い" },
  paid: { zh: "已付款", en: "Paid", de: "Bezahlt", ja: "支払済み" },
};

export function statusPill(status: string): string {
  return STATUS_LABELS[status]?.[getLocale()] ?? status;
}

export function paymentPill(paymentStatus?: string): string {
  const key = paymentStatus ?? "unpaid";
  return PAYMENT_LABELS[key]?.[getLocale()] ?? key;
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  // D1 CURRENT_TIMESTAMP 为 UTC "YYYY-MM-DD HH:MM:SS"
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(" ", "T") + "Z"
    : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function OrderDetailBlock({ order }: { order: OrderDetailRow }) {
  const { t } = useLocale();
  const snapshot = order.customerSnapshot ?? {};
  const address = order.shippingAddress ?? {};
  const options = order.options ?? [];
  const measurements = order.measurements ?? [];

  return (
    <div className="order-detail">
      <div className="grid2">
        <span>
          <i>{t("pi.customer")}</i>
          <b>{snapshot.name || "—"}</b>
        </span>
        <span>
          <i>{t("home.channel")}</i>
          <b>{snapshot.channelCode || order.channelCode || "—"}</b>
        </span>
        {snapshot.height || snapshot.weight ? (
          <span>
            <i>{t("cust.hw")}</i>
            <b>
              {snapshot.height || "—"} cm / {snapshot.weight || "—"} kg
            </b>
          </span>
        ) : null}
        <span>
          <i>{t("order.time")}</i>
          <b>{formatDateTime(order.createdAt)}</b>
        </span>
      </div>
      {order.fabricCode || order.fabricName ? (
        <span style={{ marginTop: 8 }}>
          <i>{t("pi.fabric")}</i>
          <b>
            {order.fabricName || "—"} · {order.fabricCode || ""}
            {order.fabricMill ? ` · ${order.fabricMill}` : ""}
          </b>
        </span>
      ) : null}
      {options.length ? (
        <div>
          <span>
            <i>{t("order.styleOptions")}</i>
          </span>
          <div className="order-options">
            {options.map((option) => (
              <em key={`${option.group}:${option.item}`}>
                {option.group}：{option.item}
              </em>
            ))}
          </div>
        </div>
      ) : null}
      {measurements.length ? (
        <div className="full" style={{ marginTop: 8 }}>
          <h4>{t("order.measurements")}（{t("home.netSize")} / {t("home.finishedSize")}）</h4>
          <div className="grid2">
            {measurements.map((m) => (
              <span key={m.field}>
                <i>{m.field}</i>
                <b>
                  {m.net ?? "—"} / {m.finished ?? "—"} cm
                </b>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {address && Object.keys(address).length ? (
        <div className="full" style={{ marginTop: 8 }}>
          <h4>{t("order.shipAddr")}</h4>
          <span>
            <i>{t("pi.address")}</i>
            <b>
              {[address.country, address.region, address.city, address.street, address.postalCode]
                .filter(Boolean)
                .join(" · ") || "—"}
            </b>
          </span>
        </div>
      ) : null}
      <div className="full order-price-lines">
        <span>
          <i>{t("order.itemAmount")}</i>
          <b>
            ¥{((order.basePrice ?? 0) + (order.fabricPrice ?? 0) + (order.optionExtra ?? 0)).toFixed(0)}
          </b>
        </span>
        <span>
          <i>{t("pi.shipping")}</i>
          <b>¥{(order.shippingFee ?? 0).toFixed(0)}</b>
        </span>
        <span className="total">
          <i>{t("order.madeTotal")}</i>
          <b>¥{Number(order.totalPrice).toFixed(0)}</b>
        </span>
      </div>
    </div>
  );
}
