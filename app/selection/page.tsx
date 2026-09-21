"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "../_components/Shell";
import { apiFetch } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { useCurrency } from "../lib/currency";
import { useLocale } from "../lib/i18n";

type OrderItem = { garmentType: string; garmentName: string; fabricCode?: string; fabricName?: string; totalPrice: number; currency: string; options?: Array<{ group: string; item: string; price?: number }> };
type OrderDraft = { customer: Record<string, string>; order: { items: OrderItem[] }; profilePatch?: Record<string, unknown> };
type AccessoryLine = { productId: number; offerId?: string; skuId: string; title: string; skuLabel: string; imageUrl?: string | null; quantity: number; unitPrice: number | null; sourceUrl: string };

export default function SelectionPage() {
  const { user, ready } = useAuthGuard(true);
  const { loc } = useLocale();
  const { money } = useCurrency();
  const zh = loc === "zh";
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [accessories, setAccessories] = useState<AccessoryLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setDraft(JSON.parse(localStorage.getItem("verosuits-order-draft") || "null") as OrderDraft | null); } catch { setDraft(null); }
    try { setAccessories(JSON.parse(localStorage.getItem("verosuits-accessory-cart") || "[]") as AccessoryLine[]); } catch { setAccessories([]); }
    setLoaded(true);
  }, []);

  const garmentItems = draft?.order.items ?? [];
  const total = useMemo(() => garmentItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0) + accessories.reduce((sum, item) => sum + Number(item.unitPrice || 0) * item.quantity, 0), [garmentItems, accessories]);

  const removeAccessory = (productId: number, skuId: string) => {
    const next = accessories.filter((item) => !(item.productId === productId && item.skuId === skuId));
    setAccessories(next);
    localStorage.setItem("verosuits-accessory-cart", JSON.stringify(next));
  };

  const submit = async () => {
    if (!draft?.customer?.name) { window.location.href = "/customize"; return; }
    setSubmitting(true);
    try {
      await Promise.all(accessories.map((line) => apiFetch("/api/accessories/check-stock", { method: "POST", body: JSON.stringify({ productId: line.productId, skuId: line.skuId, quantity: line.quantity }) })));
      const accessoryItems = accessories.map((line) => ({
        garmentType: "accessory", garmentName: line.title, basePrice: (line.unitPrice ?? 0) * line.quantity, fabricPrice: 0, optionExtra: 0, shippingFee: 0, totalPrice: (line.unitPrice ?? 0) * line.quantity, currency: "CNY", weightKg: 0,
        options: [
          { group: "采购款式", item: line.skuLabel, price: 0 }, { group: "采购数量", item: String(line.quantity), price: 0 },
          { group: "1688 Offer ID", item: line.offerId || line.sourceUrl.match(/offer\/(\d+)/)?.[1] || "—", price: 0 }, { group: "1688 SKU ID", item: line.skuId, price: 0 },
          { group: "1688采购链接", item: line.sourceUrl, price: 0 }, ...(line.imageUrl ? [{ group: "配件图片", item: line.imageUrl, price: 0 }] : []),
        ], measurements: [], shippingAddress: { country: draft.customer.country, region: draft.customer.region, city: draft.customer.city, street: draft.customer.street, postalCode: draft.customer.postalCode },
      }));
      const result = await apiFetch<{ customer?: { id: number } }>(`/api/orders?t=${Date.now()}`, { method: "POST", body: JSON.stringify({ customer: draft.customer, order: { items: [...garmentItems, ...accessoryItems] } }) });
      if (result.customer?.id && draft.profilePatch) await apiFetch(`/api/customers/${result.customer.id}`, { method: "PATCH", body: JSON.stringify(draft.profilePatch) });
      localStorage.removeItem("verosuits-order-draft");
      localStorage.removeItem("verosuits-accessory-cart");
      window.location.href = "/orders";
    } catch (error) {
      alert(error instanceof Error ? error.message : (zh ? "提交失败，请稍后再试" : "Submission failed"));
      setSubmitting(false);
    }
  };

  if (!ready || !user || !loaded) return <main className="admin-page admin-loading">{zh ? "正在加载选购单…" : "Loading selection…"}</main>;
  const empty = !garmentItems.length && !accessories.length;
  return <main className="shell selection-shell"><Shell active="selection" /><section className="work"><div className="selection-page">
    <header><p className="eyebrow">ORDER SELECTION</p><h1>{zh ? "选购单" : "Selection"}</h1><p>{zh ? "统一核对成衣定制与配件，确认后再生成正式订单。" : "Review garments and accessories before creating the order."}</p></header>
    {empty ? <section className="selection-empty"><h2>{zh ? "选购单还是空的" : "Your selection is empty"}</h2><p>{zh ? "先选择成衣或配件，再回到这里统一提交。" : "Choose garments or accessories first."}</p><div><a href="/customize">{zh ? "成衣定制" : "Customise garments"}</a><a href="/accessories">{zh ? "配件采购" : "Accessories"}</a></div></section> : <>
      {garmentItems.length > 0 && <section className="selection-group"><div className="selection-group-head"><h2>{zh ? "成衣定制" : "Garments"}</h2><a href="/customize">{zh ? "返回修改" : "Edit"}</a></div>{garmentItems.map((item, index) => <article key={`${item.garmentType}:${index}`}><div className="selection-placeholder">衣</div><div><small>{item.garmentType}</small><h3>{item.garmentName}</h3><p>{[item.fabricName, item.fabricCode].filter(Boolean).join(" · ")}</p></div><strong>{money(item.totalPrice)}</strong></article>)}</section>}
      {accessories.length > 0 && <section className="selection-group"><div className="selection-group-head"><h2>{zh ? "配件采购" : "Accessories"}</h2><a href="/accessories">{zh ? "继续选购" : "Add more"}</a></div>{accessories.map((item) => <article key={`${item.productId}:${item.skuId}`}>{item.imageUrl ? <img src={item.imageUrl} alt={item.skuLabel} /> : <div className="selection-placeholder">◇</div>}<div><small>{item.title}</small><h3>{item.skuLabel}</h3><p>{zh ? `数量 ${item.quantity}` : `Qty ${item.quantity}`}</p></div><strong>{money(Number(item.unitPrice || 0) * item.quantity)}</strong><button onClick={() => removeAccessory(item.productId, item.skuId)}>{zh ? "移除" : "Remove"}</button></article>)}</section>}
      <footer><div><span>{zh ? "合计" : "Total"}</span><strong>{money(total)}</strong></div>{!draft?.customer?.name && <p>{zh ? "提交前请先在成衣定制中填写客户资料。" : "Add customer details in garment customisation before submitting."}</p>}<button disabled={submitting} onClick={submit}>{submitting ? (zh ? "正在提交…" : "Submitting…") : draft?.customer?.name ? (zh ? "确认并提交订单" : "Confirm order") : (zh ? "填写客户资料" : "Add customer details")}</button></footer>
    </>}
  </div></section></main>;
}
