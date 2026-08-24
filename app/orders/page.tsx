"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../lib/i18n";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";
import { apiFetch, clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { Shell } from "../_components/Shell";
import {
  OrderDetailBlock,
  formatDateTime,
  paymentPill,
  statusPill,
  type OrderDetailRow,
} from "../_components/OrderDetail";
import { PaymentModal } from "../_components/PaymentModal";

export default function OrdersPage() {
  const { t } = useLocale();
  const { user, ready } = useAuthGuard();
  const [orders, setOrders] = useState<OrderDetailRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [payOrderId, setPayOrderId] = useState<number | null>(null);

  const logout = async () => { try { await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` } }); } catch { /* ignore */ } clearAuth(); window.location.href = "/login"; };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ orders: OrderDetailRow[] }>("/api/orders");
      setOrders(data.orders ?? []);
    } catch (e) {
      if (e instanceof Error && e.message === "未登录") return;
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [load, ready]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => {
      const name = (order.customerSnapshot as Record<string, string> | undefined)?.name ?? "";
      return (
        order.orderNo.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        (order.garmentName ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, q]);

  const removeOrder = async (id: number, orderNo: string) => {
    if (!confirm(`${t("order.deleteConfirm")} ${orderNo}？`)) return;
    setDeleting(id);
    try {
      await apiFetch(`/api/orders/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeleting(null);
    }
  };

  const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalPrice ?? 0), 0);
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const unpaidAmount = orders
    .filter((order) => order.paymentStatus !== "paid")
    .reduce((sum, order) => sum + Number(order.totalPrice ?? 0), 0);

  return (
    <main className="shell">
      <Shell active="orders" />
      <section className="work">
        <header>
          <div>
            <p className="eyebrow">{t("order.eyebrow")}</p>
            <h1>{t("order.title")}</h1>
          </div>
          <div className="actions">
            <LanguageSwitcher />
            <button className="mgmt-refresh-btn" onClick={load}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
              </svg>
              {t("common.refresh")}
            </button>
            <a className="mgmt-new-order" href="/customize">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t("home.newOrder")}
            </a>
          </div>
        </header>
        <div className="mgmt">
          <div className="mgmt-head">
            <div>
              <h2>{t("order.all")}</h2>
              <p>{t("order.subtitle")}</p>
            </div>
            <div className="mgmt-stats">
              <span>
                {t("order.count")}<b>{orders.length}</b>
              </span>
              <span>
                {t("order.amount")}<b>¥{totalAmount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</b>
              </span>
              <span>
                {t("order.pending")}<b>{pendingCount}</b>
              </span>
              <span>
                {t("order.unpaid")}<b>¥{unpaidAmount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</b>
              </span>
            </div>
          </div>
          <div className="mgmt-bar">
            <label>
              <span>⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("order.placeholder")}
              />
            </label>
          </div>
          <div className="mgmt-card">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>{t("order.orderNo")}</th>
                  <th>{t("pi.customer")}</th>
                  <th>{t("pi.product")}</th>
                  <th>{t("pi.fabric")}</th>
                  <th>{t("pi.price")}</th>
                  <th>{t("order.status")}</th>
                  <th>{t("order.payment")}</th>
                  <th>{t("order.time")}</th>
                  <th>{t("order.action")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const snapshot = (order.customerSnapshot ?? {}) as Record<string, string>;
                  const isOpen = expanded === order.id;
                  return (
                    <OrderRow
                      key={order.id}
                      order={order}
                      snapshot={snapshot}
                      isOpen={isOpen}
                      onToggle={() => setExpanded(isOpen ? null : order.id)}
                      onDelete={removeOrder}
                      deleting={deleting === order.id}
                      onCollect={() => setPayOrderId(order.id)}
                    />
                  );
                })}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="mgmt-empty">
                {q.trim() ? t("order.noMatch") : t("order.empty")}
              </div>
            )}
            {loading && <div className="mgmt-empty">…</div>}
            {error && <div className="mgmt-empty" style={{ color: "#a33b3b" }}>{error}</div>}
          </div>
        </div>
      </section>
      {payOrderId != null && (
        <PaymentModal
          order={orders.find((o) => o.id === payOrderId) ?? orders[0]}
          onClose={() => setPayOrderId(null)}
          onPaid={() => {
            setPayOrderId(null);
            load();
          }}
        />
      )}
    </main>
  );
}

function OrderRow({
  order,
  snapshot,
  isOpen,
  onToggle,
  onDelete,
  deleting,
  onCollect,
}: {
  order: OrderDetailRow;
  snapshot: Record<string, string>;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (id: number, orderNo: string) => void;
  deleting: boolean;
  onCollect: (id: number) => void;
}) {
  const { t } = useLocale();
  const isPaid = order.paymentStatus === "paid";
  return (
    <>
      <tr onClick={onToggle}>
        <td>
          <b style={{ fontSize: 12.5 }}>{order.orderNo}</b>
        </td>
        <td>
          <b>{snapshot.name || "—"}</b>
          <small className="muted" style={{ display: "block", marginTop: 2 }}>
            {order.channelCode || "—"}
          </small>
        </td>
        <td>{order.garmentName || "—"}</td>
        <td className="muted">{order.fabricName || order.fabricCode || "—"}</td>
        <td className="money">¥{Number(order.totalPrice ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</td>
        <td>
          <span className={`status-pill status-${order.status}`}>{statusPill(order.status)}</span>
        </td>
        <td>
          <span className={`pay-pill pay-${isPaid ? "paid" : "unpaid"}`}>{paymentPill(order.paymentStatus)}</span>
        </td>
        <td className="muted">{formatDateTime(order.createdAt)}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {!isPaid && (
              <button className="order-pay" onClick={() => onCollect(order.id)} title={t("order.collect")}>
                {t("order.collect")}
              </button>
            )}
            <button
              className="order-delete"
              disabled={deleting}
              onClick={() => onDelete(order.id, order.orderNo)}
              title={t("common.delete")}
            >
              {deleting ? "…" : t("common.delete")}
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr onClick={onToggle}>
          <td colSpan={9} style={{ padding: "4px 16px 14px", background: "#fbfcfb" }}>
            <OrderDetailBlock order={order} />
          </td>
        </tr>
      )}
    </>
  );
}
