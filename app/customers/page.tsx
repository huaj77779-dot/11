"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../lib/i18n";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";
import { apiFetch, clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { Shell } from "../_components/Shell";
import { tailoringTerm } from "../lib/tailoring-terms";
import {
  OrderDetailBlock,
  formatDateTime,
  paymentPill,
  statusPill,
  type OrderDetailRow,
} from "../_components/OrderDetail";

type CustomerRow = {
  id: number;
  name: string;
  height: string;
  weight: string;
  channelCode: string;
  avatarUrl: string | null;
  country: string;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  notes: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
  updatedAt: string;
  measurements: string;
  measurementsSavedAt: string | null;
};

type CustomerDetail = {
  customer: CustomerRow;
  orders: OrderDetailRow[];
};

type MeasurementGarment = "jacket" | "trousers" | "waistcoat" | "shirt";
type MeasurementTab = MeasurementGarment | "posture";
const CUSTOMER_MEASUREMENT_GROUPS: Record<MeasurementGarment, { name: string; fields: string[] }> = {
  jacket: { name: "西装上衣", fields: ["肩宽", "臂围", "袖长", "胸围", "中腰", "腰围", "下摆", "前长", "后长"] },
  trousers: { name: "西裤", fields: ["裤腰", "臀围", "横裆", "腿围", "全长", "内长", "脚口"] },
  waistcoat: { name: "马甲", fields: ["胸围", "腰围", "前长", "后长"] },
  shirt: { name: "衬衫", fields: ["领围", "肩宽", "胸围", "肚围", "摆围", "袖肥", "腕围", "长袖长", "前衣长", "后衣长"] },
};
const CUSTOMER_POSTURE_GROUPS = [
  { title: "驼背", options: ["正常背", "背长加长 1cm", "背长加长 1.5cm", "背长加长 2cm", "背长加长 2.5cm"] },
  { title: "凸肚", options: ["正常肚", "前肚围加大 1cm", "前肚围加大 2cm", "前肚围加大 3cm", "前肚围加大 4cm"] },
  { title: "挺胸", options: ["正常胸", "前腰节长加 1cm", "前腰节长加 1.5cm", "前腰节长加 2cm", "前腰节长加 2.5cm"] },
  { title: "左平溜肩", options: ["平肩上提 2cm", "平肩上提 1.5cm", "平肩上提 1cm", "平肩上提 0.5cm", "正常肩", "微溜肩下调 0.5cm", "中溜肩下调 0.8cm", "重溜肩下调 1.2cm"] },
  { title: "右平溜肩", options: ["平肩上提 2cm", "平肩上提 1.5cm", "平肩上提 1cm", "平肩上提 0.5cm", "正常肩", "微溜肩下调 0.5cm", "中溜肩下调 0.8cm", "重溜肩下调 1.2cm"] },
] as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function countryName(code: string): string {
  const map: Record<string, string> = {
    UK: "英国",
    US: "美国",
    EU: "欧盟",
    CA: "加拿大",
    AU: "澳大利亚",
    OTHER: "其他",
  };
  return map[code] ?? code;
}

export default function CustomersPage() {
  const { loc, t } = useLocale();
  const { user, ready } = useAuthGuard();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const logout = async () => { try { await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` } }); } catch { /* ignore */ } clearAuth(); window.location.href = "/login"; };

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ customers: CustomerRow[] }>(`/api/customers?q=${encodeURIComponent(query)}`);
      setRows(data.customers ?? []);
    } catch (e) {
      if (e instanceof Error && e.message === "未登录") return;
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) load("");
  }, [load, ready]);

  const loadDetail = useCallback(async (id: number): Promise<CustomerDetail | null> => {
    try {
      const data = await apiFetch<CustomerDetail>(`/api/customers/${id}`);
      setSelected(data);
      return data;
    } catch (e) {
      alert(e instanceof Error ? e.message : "加载失败");
      return null;
    }
  }, []);

  const openDetail = async (id: number) => {
    await loadDetail(id);
  };

  const handleDeleted = async () => {
    if (selected) {
      await loadDetail(selected.customer.id);
      load(q);
    }
  };

  const removeCustomer = async (id: number, name: string, orderCount: number) => {
    const hint = orderCount > 0 ? `该客户的 ${orderCount} 笔订单也会一并删除。` : "";
    if (!confirm(`确认删除客户「${name}」？\n${hint}删除后不可恢复。`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/customers/${id}`, { method: "DELETE" });
      if (selected?.customer.id === id) setSelected(null);
      await load(q);
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const totalSpent = rows.reduce((sum, row) => sum + (row.totalSpent ?? 0), 0);
  const totalOrders = rows.reduce((sum, row) => sum + (row.totalOrders ?? 0), 0);

  return (
    <main className="shell">
      <Shell active="customers" />
      <section className="work">
        <header>
          <div>
            <p className="eyebrow">{t("cust.eyebrow")}</p>
            <h1>{t("cust.title")}</h1>
          </div>
          <div className="actions">
            <LanguageSwitcher />
            <button className="mgmt-refresh-btn" onClick={() => load(q)}>
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
              <h2>{t("cust.all")}</h2>
              <p>{t("cust.subtitle")}</p>
            </div>
            <div className="mgmt-stats">
              <span>
                {t("cust.count")}<b>{rows.length}</b>
              </span>
              <span>
                {t("cust.orders")}<b>{totalOrders}</b>
              </span>
              <span>
                {t("cust.spent")}<b>¥{totalSpent.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</b>
              </span>
            </div>
          </div>
          <div className="mgmt-bar">
            <label>
              <span>⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load(q);
                }}
                placeholder={t("cust.placeholder")}
              />
            </label>
            <button className="mgmt-refresh" onClick={() => load(q)}>
              {t("common.search")}
            </button>
          </div>
          <div className="mgmt-card">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>客户</th>
                  <th>{t("cust.region")}</th>
                  <th>{t("cust.hw")}</th>
                  <th>{t("cust.orders")}</th>
                  <th>{t("cust.spent")}</th>
                  <th>{t("cust.lastOrder")}</th>
                  <th>{t("order.action")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => openDetail(row.id)}>
                    <td>
                      <div className="cust-cell">
                        <span className="cust-avatar">
                          {row.avatarUrl ? <img src={row.avatarUrl} alt={row.name} /> : initials(row.name)}
                        </span>
                        <div>
                          <b>{row.name}</b>
                          <small style={{ marginTop: 3 }}>
                            {row.channelCode ? <span className="channel-tag">{row.channelCode}</span> : null}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="muted">
                      {[countryName(row.country), row.city].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="muted">
                      {row.height || row.weight ? `${row.height || "—"} cm / ${row.weight || "—"} kg` : "—"}
                    </td>
                    <td>
                      <b>{row.totalOrders}</b>
                      <small className="muted"> 单</small>
                    </td>
                    <td className="money">¥{Number(row.totalSpent ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</td>
                    <td className="muted">{formatDateTime(row.lastOrderAt ?? row.updatedAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="customer-delete"
                        disabled={deletingId === row.id}
                        onClick={() => removeCustomer(row.id, row.name, row.totalOrders)}
                        title="删除客户及其订单"
                      >
                        {deletingId === row.id ? "…" : t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && rows.length === 0 && (
              <div className="mgmt-empty">
                {t("cust.empty")}
              </div>
            )}
            {loading && <div className="mgmt-empty">…</div>}
            {error && <div className="mgmt-empty" style={{ color: "#a33b3b" }}>{error}</div>}
          </div>
        </div>
      </section>
      {selected && (
        <CustomerDrawer
          detail={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setSelected((prev) => (prev ? { ...prev, customer: updated } : prev));
            load(q);
          }}
          onDeleted={handleDeleted}
          onDeleteCustomer={() =>
            removeCustomer(selected.customer.id, selected.customer.name, selected.customer.totalOrders)
          }
          deletingCustomer={deletingId === selected.customer.id}
        />
      )}
    </main>
  );
}

function CustomerMeasurementsEditor({ customer, onSaved }: { customer: CustomerRow; onSaved: (customer: CustomerRow) => void }) {
  const { loc, t } = useLocale();
  const parseAll = () => { try { return JSON.parse(customer.measurements || "{}") as Record<string, unknown>; } catch { return {}; } };
  const parse = () => { const { __posture, ...sizes } = parseAll(); return sizes as Record<string, [string, string]>; };
  const parsePostures = () => { const value = parseAll().__posture; return value && typeof value === "object" ? value as Record<string, string> : {}; };
  const [tab, setTab] = useState<MeasurementTab>("jacket");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [values, setValues] = useState<Record<string, [string, string]>>(parse);
  const [postures, setPostures] = useState<Record<string, string>>(parsePostures);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const group = tab === "posture" ? null : CUSTOMER_MEASUREMENT_GROUPS[tab];
  const display = (value: string) => unit === "cm" || !value ? value : (Number(value) / 2.54).toFixed(2).replace(/\.00$/, "");
  const store = (value: string) => unit === "cm" || !value ? value : (Number(value) * 2.54).toFixed(2).replace(/\.00$/, "");
  const setMeasurement = (field: string, slot: 0 | 1, value: string) => { if (tab === "posture") return; setValues(prev => { const key = `${tab}:${field}`; const current = prev[key] || ["", ""]; const next: [string, string] = [current[0], current[1]]; next[slot] = store(value); return { ...prev, [key]: next }; }); };
  const saveMeasurements = async () => {
    setSaving(true); setSaved(false);
    try {
      const savedAt = new Date().toISOString();
      const data = await apiFetch<{ customer: CustomerRow }>(`/api/customers/${customer.id}`, { method: "PATCH", body: JSON.stringify({ measurements: JSON.stringify({ ...values, __posture: postures }), measurementsSavedAt: savedAt }) });
      onSaved(data.customer); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (error) { alert(error instanceof Error ? error.message : "保存失败"); }
    finally { setSaving(false); }
  };
  const cancel = () => { setValues(parse()); setPostures(parsePostures()); setEditing(false); };
  return <section className="profile-measure-editor">
    <div className="profile-measure-toolbar">
      <div><b>{t("cust.measureProfile")}</b><small>{customer.measurementsSavedAt ? `${t("cust.savedAt")}：${formatDateTime(customer.measurementsSavedAt)}` : t("cust.notSaved")}</small></div>
      <div className="profile-measure-controls"><div className="profile-unit"><button className={unit === "cm" ? "on" : ""} onClick={() => setUnit("cm")}>{t("cust.metric")}</button><button className={unit === "in" ? "on" : ""} onClick={() => setUnit("in")}>{t("cust.imperial")}</button></div>{(Object.keys(CUSTOMER_MEASUREMENT_GROUPS) as MeasurementGarment[]).map(key => <button key={key} className={`profile-measure-tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>{tailoringTerm(CUSTOMER_MEASUREMENT_GROUPS[key].name, loc)}</button>)}<button className={`profile-measure-tab ${tab === "posture" ? "on" : ""}`} onClick={() => setTab("posture")}>{t("cust.posture")}</button></div>
    </div>
    {tab === "posture" ? (
      <div className="profile-posture-grid">
        {CUSTOMER_POSTURE_GROUPS.map(group => <section key={group.title}><b>{tailoringTerm(group.title, loc)}</b><select disabled={!editing} value={postures[group.title] || ""} onChange={event => setPostures(current => ({ ...current, [group.title]: event.target.value }))}><option value="">{t("cust.choose")}</option>{group.options.map(option => <option key={option} value={option}>{tailoringTerm(option, loc, group.title)}</option>)}</select></section>)}
      </div>
    ) : group ? (
      <><p className="profile-measure-hint">{t("cust.measureHint")}</p><div className="profile-measure-table-wrap"><div className="profile-measure-table" style={{ gridTemplateColumns: `68px repeat(${group.fields.length}, 54px)` }}>
        <div className="profile-measure-row head"><b>{tailoringTerm(group.name, loc)}</b>{group.fields.map(field => <span key={field}>{tailoringTerm(field, loc)}</span>)}</div>
        <div className="profile-measure-row"><b>{t("cust.body")}</b>{group.fields.map(field => { const value = values[`${tab}:${field}`]?.[0] || ""; return <label key={field}><input disabled={!editing} inputMode="decimal" value={display(value)} onChange={e => setMeasurement(field, 0, e.target.value.replace(/[^0-9.]/g, ""))} /><em>{unit}</em></label>; })}</div>
        <div className="profile-measure-row"><b>{t("cust.finished")}</b>{group.fields.map(field => { const value = values[`${tab}:${field}`]?.[1] || ""; return <label key={field}><input disabled={!editing} inputMode="decimal" value={display(value)} onChange={e => setMeasurement(field, 1, e.target.value.replace(/[^0-9.]/g, ""))} /><em>{unit}</em></label>; })}</div>
      </div></div></>
    ) : null}
    <div className="profile-measure-actions">{editing ? <><button onClick={saveMeasurements} disabled={saving}>{saving ? t("cust.saving") : t("cust.saveMeasurements")}</button><button className="ghost" onClick={cancel}>{t("common.cancel")}</button></> : <button onClick={() => setEditing(true)}>{t("cust.editMeasurements")}</button>}{saved && <strong>{t("cust.saved")}</strong>}</div>
  </section>;
}

function CustomerDrawer({
  detail,
  onClose,
  onSaved,
  onDeleted,
  onDeleteCustomer,
  deletingCustomer,
}: {
  detail: CustomerDetail;
  onClose: () => void;
  onSaved: (customer: CustomerRow) => void;
  onDeleted: () => void;
  onDeleteCustomer: () => void;
  deletingCustomer: boolean;
}) {
  const { t } = useLocale();
  const { customer, orders } = detail;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    name: customer.name,
    height: customer.height,
    weight: customer.weight,
    channelCode: customer.channelCode,
    country: customer.country,
    region: customer.region,
    city: customer.city,
    street: customer.street,
    postalCode: customer.postalCode,
    notes: customer.notes,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const removeOrder = async (id: number, orderNo: string) => {
    if (!confirm(`${t("order.deleteConfirm")} ${orderNo}？`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/orders/${id}`, { method: "DELETE" });
      onDeleted();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data = await apiFetch<{ customer: CustomerRow }>(`/api/customers/${customer.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onSaved(data.customer);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mgmt-drawer-backdrop" onMouseDown={onClose}>
      <div className="mgmt-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mgmt-drawer-head">
          <div>
            <p className="eyebrow">CUSTOMER PROFILE</p>
            <h3>{customer.name}</h3>
            {customer.channelCode ? (
              <span className="channel-tag" style={{ marginTop: 6 }}>
                {customer.channelCode}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="customer-delete"
              disabled={deletingCustomer}
              onClick={onDeleteCustomer}
              title="删除客户及其全部订单"
            >
              {deletingCustomer ? "…" : t("cust.delCustomer")}
            </button>
            <button className="mgmt-close" onClick={onClose} aria-label={t("common.close")}>
              ×
            </button>
          </div>
        </div>
        <div className="mgmt-drawer-body">
          <p className="mgmt-section-title">{t("cust.profile")}</p>
          {editing ? (
            <div className="mgmt-profile">
              <label>
                <span>{t("home.customerName")} *</span>
                <input value={form.name} onChange={set("name")} />
              </label>
              <label>
                <span>{t("home.channel")}</span>
                <input value={form.channelCode} onChange={set("channelCode")} />
              </label>
              <label>
                <span>{t("home.height")}</span>
                <input value={form.height} onChange={set("height")} />
              </label>
              <label>
                <span>{t("home.weight")}</span>
                <input value={form.weight} onChange={set("weight")} />
              </label>
              <label>
                <span>{t("home.country")}</span>
                <input value={form.country} onChange={set("country")} />
              </label>
              <label>
                <span>{t("home.region")}</span>
                <input value={form.region} onChange={set("region")} />
              </label>
              <label>
                <span>{t("home.city")}</span>
                <input value={form.city} onChange={set("city")} />
              </label>
              <label>
                <span>{t("home.postal")}</span>
                <input value={form.postalCode} onChange={set("postalCode")} />
              </label>
              <label className="full">
                <span>{t("home.street")}</span>
                <input value={form.street} onChange={set("street")} />
              </label>
              <label className="full">
                <span>{t("cust.notes")}</span>
                <textarea value={form.notes} onChange={set("notes")} placeholder={t("cust.notes")} />
              </label>
            </div>
          ) : (
            <div className="order-detail">
              <div className="grid2">
                <span>
                  <i>{t("cust.hw")}</i>
                  <b>
                    {customer.height || "—"} cm / {customer.weight || "—"} kg
                  </b>
                </span>
                <span>
                  <i>{t("cust.created")}</i>
                  <b>{formatDateTime(customer.createdAt)}</b>
                </span>
                <span>
                  <i>{t("cust.orders")}</i>
                  <b>{customer.totalOrders}</b>
                </span>
                <span>
                  <i>{t("cust.spent")}</i>
                  <b>¥{Number(customer.totalSpent ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</b>
                </span>
                <span className="full">
                  <i>{t("pi.address")}</i>
                  <b>
                    {[countryName(customer.country), customer.region, customer.city, customer.street, customer.postalCode]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </b>
                </span>
                {customer.notes ? (
                  <span className="full">
                    <i>{t("cust.notes")}</i>
                    <b>{customer.notes}</b>
                  </span>
                ) : null}
              </div>
              <div className="profile-edit-button-row"><button onClick={() => setEditing(true)}>{t("cust.edit")}</button></div>
            </div>
          )}
          {!editing && <CustomerMeasurementsEditor customer={customer} onSaved={onSaved} />}
          {editing && <div className="mgmt-save">
              <>
                <button onClick={save} disabled={saving}>
                  {saving ? "…" : t("cust.saveProfile")}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{ background: "white", color: "var(--ink)" }}
                >
                  {t("common.cancel")}
                </button>
                {saved && <small className="saved">{t("cust.saved")}</small>}
              </>
          </div>}

          <p className="mgmt-section-title">{t("cust.history")}（{orders.length}）</p>
          {orders.length === 0 && <p className="muted" style={{ fontSize: 12 }}>{t("cust.noOrders")}</p>}
          {orders.map((order) => (
            <div key={order.id} className="mgmt-order">
              <div className="mgmt-order-top" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <b>{order.orderNo}</b>
                <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`status-pill status-${order.status}`}>{statusPill(order.status)}</span>
                  <span className={`pay-pill pay-${order.paymentStatus === "paid" ? "paid" : "unpaid"}`}>
                    {paymentPill(order.paymentStatus)}
                  </span>
                  <button
                    className="order-delete"
                    disabled={deletingId === order.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOrder(order.id, order.orderNo);
                    }}
                    title="删除订单"
                  >
                    {deletingId === order.id ? "删除中…" : "删除"}
                  </button>
                </div>
              </div>
              <div className="mgmt-order-meta">
                {order.garmentName} · {order.fabricName || order.fabricCode || "面料未记录"}
                <br />
                <em>¥{Number(order.totalPrice).toFixed(0)}</em> · {formatDateTime(order.createdAt)}
                <span style={{ float: "right", color: "#2c6a58", cursor: "pointer" }}>
                  {expandedOrder === order.id ? "收起 ▲" : "明细 ▼"}
                </span>
              </div>
              {expandedOrder === order.id && <OrderDetailBlock order={order} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
