"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../lib/i18n";
import { useCurrency } from "../lib/currency";
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
import { downloadCsv } from "../lib/export-csv";

function paginationItems(totalPages: number, currentPage: number): Array<number | "…"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]);
  if (currentPage <= 5) [2, 3, 4, 5, 6, 7].forEach((page) => pages.add(page));
  if (currentPage >= totalPages - 4) [totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));
  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  return ordered.flatMap((page, index) => index > 0 && page - ordered[index - 1] > 1 ? ["…", page] : [page]);
}

export default function OrdersPage() {
  const { loc, t } = useLocale();
  const { money } = useCurrency();
  const { user, ready } = useAuthGuard();
  const [orders, setOrders] = useState<OrderDetailRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, totalAmount: 0, pending: 0, unpaidAmount: 0 });
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [payOrderId, setPayOrderId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const logout = async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ } clearAuth(); window.location.href = "/login"; };

  const load = useCallback(async (offset = 0, limit = pageSize) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ orders: OrderDetailRow[]; summary?: { total: number; totalAmount: number; pending: number; unpaidAmount: number } }>(`/api/orders?offset=${offset}&limit=${limit}`);
      setOrders(data.orders ?? []);
      setPageOffset(offset);
      setSummary(data.summary ?? { total: 0, totalAmount: 0, pending: 0, unpaidAmount: 0 });
    } catch (e) {
      if (e instanceof Error && e.message === "未登录") return;
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

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

  const exportOrders = async () => {
    setExporting(true);
    try {
      const all: OrderDetailRow[] = [];
      for (let offset = 0; ; offset += 200) {
        const data = await apiFetch<{ orders: OrderDetailRow[] }>(`/api/orders?offset=${offset}&limit=200`);
        const batch = data.orders ?? [];
        all.push(...batch);
        if (batch.length < 200) break;
      }
      downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, ["Order no.", "Customer", "Channel", "Product", "Fabric", "Amount", "Currency", "Order status", "Payment status", "Created"], all.map((order) => {
        const snapshot = (order.customerSnapshot ?? {}) as Record<string, string>;
        return [order.orderNo, snapshot.name, order.channelCode, order.garmentName, order.fabricName || order.fabricCode, order.totalPrice, order.currency, order.status, order.paymentStatus, order.createdAt];
      }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const previousLabel = loc === "zh" ? "上一页" : "Previous";
  const nextLabel = loc === "zh" ? "下一页" : "Next";
  const totalPages = Math.max(1, Math.ceil(summary.total / pageSize));
  const currentPage = Math.min(totalPages, Math.floor(pageOffset / pageSize) + 1);

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
            <button className="mgmt-refresh-btn" onClick={() => load(0)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
              </svg>
              {t("common.refresh")}
            </button>
            <button className="mgmt-refresh-btn" onClick={exportOrders} disabled={exporting}>
              {exporting ? "…" : loc === "zh" ? "导出表格" : "Export CSV"}
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
                {t("order.count")}<b>{summary.total}</b>
              </span>
              <span>
                {t("order.amount")}<b>{money(summary.totalAmount)}</b>
              </span>
              <span>
                {t("order.pending")}<b>{summary.pending}</b>
              </span>
              <span>
                {t("order.unpaid")}<b>{money(summary.unpaidAmount)}</b>
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
            {!loading && !q.trim() && summary.total > 0 && <div className="mgmt-empty" style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select aria-label="Rows per page" value={pageSize} onChange={(event) => { const size = Number(event.target.value); setPageSize(size); load(0, size); }} className="mgmt-refresh">
                <option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option>
              </select>
              <button className="mgmt-refresh" disabled={currentPage === 1} onClick={() => load((currentPage - 2) * pageSize)}>{previousLabel}</button>
              {paginationItems(totalPages, currentPage).map((item, index) => item === "…" ? <span key={`ellipsis-${index}`}>…</span> : <button key={item} className="mgmt-refresh" disabled={item === currentPage} onClick={() => load((item - 1) * pageSize)}>{item}</button>)}
              <button className="mgmt-refresh" disabled={currentPage === totalPages} onClick={() => load(currentPage * pageSize)}>{nextLabel}</button>
            </div>}
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
  const { money } = useCurrency();
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
        <td className="money">{money(Number(order.totalPrice ?? 0))}</td>
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
