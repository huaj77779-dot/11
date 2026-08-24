"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";

type AdminFabric = {
  id: number; code: string; name: string; mill: string; tone: string; meta: string;
  stock: string; price: number; imageUrl: string | null; garmentType: string;
  sortOrder: number; active: boolean;
};
type AdminStyle = {
  id: number; garmentType: string; groupTitle: string; item: string;
  surcharge: number; imageUrl: string | null; sortOrder: number; active: boolean;
};
type AdminUser = {
  id: number; username: string; role: string; storeName: string;
  customerCount: number; orderCount: number; totalSpent: number;
};

const GARMENTS = [
  { key: "jacket", label: "西装上衣" },
  { key: "trousers", label: "西裤" },
  { key: "waistcoat", label: "马甲" },
  { key: "shirt", label: "衬衫" },
];

export default function AdminPage() {
  const { user, ready } = useAuthGuard();
  const [tab, setTab] = useState<"fabrics" | "styles" | "accounts">("fabrics");

  if (!ready) return <div className="admin-page admin-loading">加载中…</div>;
  if (!user) return <div className="admin-page admin-loading">正在跳转登录…</div>;
  if (user.role !== "master") {
    return (
      <div className="admin-page admin-loading">
        <p>无权限：仅主账号可访问后台</p>
        <button onClick={() => (window.location.href = "/")}>返回首页</button>
      </div>
    );
  }

  const logout = () => { void fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` } }); clearAuth(); window.location.href = "/login"; };

  return (
    <main className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1>主账号后台管理</h1>
          <p>面料上架 · 款式与图片 · 门店子账号</p>
        </div>
        <div className="actions">
          <a className="mgmt-new-order" href="/" style={{ fontSize: 12 }}>返回下单</a>
          <button className="admin-logout" onClick={logout}>退出登录</button>
        </div>
      </header>
      <div className="admin-tabs">
        <button className={tab === "fabrics" ? "on" : ""} onClick={() => setTab("fabrics")}>面料管理</button>
        <button className={tab === "styles" ? "on" : ""} onClick={() => setTab("styles")}>款式与图片</button>
        <button className={tab === "accounts" ? "on" : ""} onClick={() => setTab("accounts")}>门店账号</button>
      </div>
      {tab === "fabrics" && <FabricsPanel />}
      {tab === "styles" && <StylesPanel />}
      {tab === "accounts" && <AccountsPanel />}
    </main>
  );
}

function FabricsPanel() {
  const [list, setList] = useState<AdminFabric[]>([]);
  const [garmentType, setGarmentType] = useState("all");
  const [batch, setBatch] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async (gt: string) => {
    try {
      const data = await apiFetch<{ fabrics: AdminFabric[] }>(`/api/admin/fabrics?garmentType=${gt}`);
      setList(data.fabrics);
    } catch { /* 401 已跳转 */ }
  }, []);
  useEffect(() => { load(garmentType); }, [load, garmentType]);

  const importBatch = async () => {
    if (!batch.trim()) { setMsg("请输入面料 JSON"); return; }
    try {
      const parsed = JSON.parse(batch);
      const data = await apiFetch<{ created: number; skipped: string[] }>("/api/admin/fabrics", { method: "POST", body: JSON.stringify(parsed) });
      setMsg(`已上架 ${data.created} 条${data.skipped.length ? `，跳过重复：${data.skipped.join(",")}` : ""}`);
      setBatch("");
      load(garmentType);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "JSON 格式错误");
    }
  };

  const patchFabric = async (f: AdminFabric, patch: Partial<AdminFabric>) => {
    await apiFetch(`/api/admin/fabrics/${f.id}`, { method: "PATCH", body: JSON.stringify(patch) });
    load(garmentType);
  };
  const removeFabric = async (f: AdminFabric) => {
    if (!confirm(`确认删除面料 ${f.code}？`)) return;
    await apiFetch(`/api/admin/fabrics/${f.id}`, { method: "DELETE" });
    load(garmentType);
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <select value={garmentType} onChange={(e) => setGarmentType(e.target.value)}>
          <option value="all">全部产品</option>
          {GARMENTS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
        </select>
        <span className="admin-count">共 {list.length} 款</span>
      </div>
      <div className="admin-batch">
        <p>批量上架（JSON 数组，字段：code / name / mill / tone / price / garmentType / imageUrl）</p>
        <textarea value={batch} onChange={(e) => setBatch(e.target.value)} rows={4}
          placeholder={JSON.stringify([{ code: "VBC-110-NV", name: "深海军蓝精纺", mill: "Vitale Barberis Canonico", tone: "navy", price: 680, garmentType: "jacket" }])} />
        <div className="admin-batch-actions">
          <button onClick={importBatch}>批量上架</button>
          {msg && <small className="admin-msg">{msg}</small>}
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>编码</th><th>名称</th><th>产地</th><th>色系</th><th>基础价格 CNY</th>
              <th>产品</th><th>状态</th><th>图片</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td><b>{f.code}</b></td>
                <td><input defaultValue={f.name} onBlur={(e) => e.target.value !== f.name && patchFabric(f, { name: e.target.value })} /></td>
                <td><input defaultValue={f.mill} onBlur={(e) => e.target.value !== f.mill && patchFabric(f, { mill: e.target.value })} /></td>
                <td>{f.tone}</td>
                <td><input type="number" defaultValue={f.price} onBlur={(e) => Number(e.target.value) !== f.price && patchFabric(f, { price: Number(e.target.value) })} /></td>
                <td>{GARMENTS.find((g) => g.key === f.garmentType)?.label ?? f.garmentType}</td>
                <td>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={f.active} onChange={(e) => patchFabric(f, { active: e.target.checked })} />
                    {f.active ? "上架" : "下架"}
                  </label>
                </td>
                <td>{f.imageUrl ? "有图" : "—"}</td>
                <td><button className="admin-del" onClick={() => removeFabric(f)}>删除</button></td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={9} className="admin-empty">暂无面料，使用上方批量上架添加</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StylesPanel() {
  const [garmentType, setGarmentType] = useState("jacket");
  const [list, setList] = useState<AdminStyle[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async (gt: string) => {
    try {
      const data = await apiFetch<{ styles: AdminStyle[] }>(`/api/admin/styles?garmentType=${gt}`);
      setList(data.styles);
    } catch { /* 401 */ }
  }, []);
  useEffect(() => { load(garmentType); }, [load, garmentType]);

  const groups = list.reduce<Record<string, AdminStyle[]>>((acc, s) => {
    (acc[s.groupTitle] ??= []).push(s);
    return acc;
  }, {});

  const patch = async (s: AdminStyle, p: Partial<AdminStyle>) => {
    await apiFetch(`/api/admin/styles/${s.id}`, { method: "PATCH", body: JSON.stringify(p) });
    load(garmentType);
  };
  const remove = async (s: AdminStyle) => {
    if (!confirm(`确认删除选项「${s.groupTitle}：${s.item}」？`)) return;
    await apiFetch(`/api/admin/styles/${s.id}`, { method: "DELETE" });
    load(garmentType);
  };
  const addOption = async () => {
    const groupTitle = prompt("配置组名称（如：领型）");
    if (!groupTitle) return;
    const item = prompt("选项名称（如：标准领）");
    if (!item) return;
    const surcharge = Number(prompt("加价（CNY，无则 0）") ?? 0) || 0;
    await apiFetch("/api/admin/styles", { method: "POST", body: JSON.stringify([{ garmentType, groupTitle, item, surcharge }]) });
    load(garmentType);
    setMsg(`已添加 ${groupTitle}：${item}`);
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        {GARMENTS.map((g) => (
          <button key={g.key} className={garmentType === g.key ? "on" : ""} onClick={() => setGarmentType(g.key)}>{g.label}</button>
        ))}
        <button className="admin-add" onClick={addOption}>+ 新增选项</button>
        {msg && <small className="admin-msg">{msg}</small>}
      </div>
      {Object.entries(groups).map(([group, items]) => (
        <div className="admin-group" key={group}>
          <h3>{group} <span>{items.length} 项</span></h3>
          <div className="admin-options">
            {items.map((s) => (
              <div className="admin-option" key={s.id}>
                <label className="admin-toggle">
                  <input type="checkbox" checked={s.active} onChange={(e) => patch(s, { active: e.target.checked })} />
                </label>
                <input className="admin-item-name" defaultValue={s.item} onBlur={(e) => e.target.value !== s.item && patch(s, { item: e.target.value })} />
                <input type="number" className="admin-price" defaultValue={s.surcharge} onBlur={(e) => Number(e.target.value) !== s.surcharge && patch(s, { surcharge: Number(e.target.value) })} title="加价 CNY" />
                <input className="admin-img" defaultValue={s.imageUrl ?? ""} placeholder="款式图片 URL（或 dataURL）" onBlur={(e) => e.target.value !== (s.imageUrl ?? "") && patch(s, { imageUrl: e.target.value || null })} />
                {s.imageUrl && <img className="admin-opt-img" src={s.imageUrl} alt={s.item} />}
                <button className="admin-del" onClick={() => remove(s)}>删除</button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {Object.keys(groups).length === 0 && <p className="admin-empty">该产品暂无款式选项，点击「新增选项」添加</p>}
    </div>
  );
}

function AccountsPanel() {
  const [list, setList] = useState<AdminUser[]>([]);
  const [form, setForm] = useState({ username: "", password: "", storeName: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ users: AdminUser[] }>("/api/admin/users");
      setList(data.users);
    } catch { /* 401 */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      setMsg("子账号已创建");
      setForm({ username: "", password: "", storeName: "" });
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "创建失败");
    }
  };
  const resetPwd = async (u: AdminUser) => {
    const pw = prompt(`重置 ${u.username} 的密码（至少 6 位）`);
    if (!pw) return;
    if (pw.length < 6) { alert("密码至少 6 位"); return; }
    await apiFetch(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ password: pw }) });
    setMsg("密码已重置");
  };
  const removeUser = async (u: AdminUser) => {
    if (u.role === "master") return alert("不能删除主账号");
    if (!confirm(`确认删除子账号 ${u.username}？其客户与订单数据仍在系统中（归属保留）。`)) return;
    await apiFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="admin-panel">
      <div className="admin-create-user">
        <h3>创建门店子账号</h3>
        <div className="admin-user-form">
          <input placeholder="账号（登录名）" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="初始密码（≥6 位）" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="门店名称（如 Baker Street Tailors）" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          <button onClick={create}>创建</button>
        </div>
        {msg && <small className="admin-msg">{msg}</small>}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>账号</th><th>类型</th><th>门店名称</th><th>客户数</th><th>订单数</th>
              <th>累计消费</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td><b>{u.username}</b></td>
                <td>{u.role === "master" ? "主账号" : "门店子账号"}</td>
                <td>{u.storeName}</td>
                <td>{u.customerCount}</td>
                <td>{u.orderCount}</td>
                <td>CNY {Number(u.totalSpent ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</td>
                <td>
                  {u.role === "store" && (
                    <>
                      <button className="admin-mini" onClick={() => resetPwd(u)}>重置密码</button>
                      <button className="admin-del" onClick={() => removeUser(u)}>删除</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
