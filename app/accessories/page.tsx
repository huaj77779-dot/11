"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "../_components/Shell";
import { BrandLogo } from "../_components/BrandLogo";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";
import { apiFetch, clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { useLocale } from "../lib/i18n";

type PriceTier = { minQuantity: number; unitPrice: number };
type Sku = { skuId: string; attributes?: Array<{ name: string; value: string }>; sourceColor?: string; colorGroup?: string; sourceMaterial?: string; materialGroup?: string; stockQuantity?: number | null; stockStatus?: string; priceTiers?: PriceTier[] };
type Product = { id: number; category: string; title: string; supplierName: string; sourceUrl: string; offerId: string; imageUrl?: string | null; sourceMaterial: string; materialGroup: string; sourceColor: string; colorGroup: string; moq?: number | null; priceTiers: PriceTier[]; skus: Sku[]; status: string; checkedAt?: string | null };
type CartLine = { productId: number; skuId: string; title: string; skuLabel: string; quantity: number; unitPrice: number | null; sourceUrl: string; checkedAt: string };

const CATEGORIES = [
  ["all", "全部配件", "All"],
  ["cufflinks", "袖扣", "Cufflinks"],
  ["tie", "领带", "Ties"],
  ["brooch", "胸针", "Brooches"],
  ["packaging_bag", "包装袋", "Packaging bags"],
  ["pocket_square", "口袋巾", "Pocket squares"],
  ["bow_tie", "领结", "Bow ties"],
  ["tie_pin", "领针", "Tie pins"],
] as const;
function effectivePrice(tiers: PriceTier[], quantity = 1) {
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity).filter((tier) => quantity >= tier.minQuantity).at(-1)?.unitPrice ?? tiers[0]?.unitPrice ?? null;
}

export default function AccessoriesPage() {
  const { user, ready } = useAuthGuard(true);
  const { loc } = useLocale();
  const zh = loc === "zh";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [color, setColor] = useState("all");
  const [material, setMaterial] = useState("all");
  const [sort, setSort] = useState("default");
  const [selectedSku, setSelectedSku] = useState<Record<number, string>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch<{ products: Product[] }>("/api/accessories");
      setProducts(data.products ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "加载失败"); }
    finally { setLoading(false); }
  }, []);

  // Loading is intentionally tied to the authenticated browser session.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (ready && user) void load(); }, [ready, user, load]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setCart(JSON.parse(localStorage.getItem("verosuits-accessory-cart") || "[]") as CartLine[]); } catch { setCart([]); }
  }, []);

  const customerProducts = useMemo(() => products.filter((product) => product.status === "ready" && product.title), [products]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = customerProducts.filter((product) =>
      (category === "all" || product.category === category) &&
      (color === "all" || product.colorGroup === color || product.skus.some((sku) => sku.colorGroup === color)) &&
      (material === "all" || product.materialGroup === material || product.skus.some((sku) => sku.materialGroup === material)) &&
      (!needle || product.title.toLowerCase().includes(needle))
    );
    if (sort !== "default") next.sort((a, b) => (effectivePrice(a.priceTiers) ?? Number.MAX_VALUE) - (effectivePrice(b.priceTiers) ?? Number.MAX_VALUE));
    return sort === "price_desc" ? next.reverse() : next;
  }, [customerProducts, category, query, color, material, sort]);

  const colors = [...new Set(customerProducts.flatMap((p) => [p.colorGroup, ...p.skus.map((s) => s.colorGroup ?? "unknown")]).filter((v) => v && v !== "unknown"))];
  const materials = [...new Set(customerProducts.flatMap((p) => [p.materialGroup, ...p.skus.map((s) => s.materialGroup ?? "unknown")]).filter((v) => v && v !== "unknown"))];

  const addToCart = async (product: Product) => {
    const skuId = selectedSku[product.id] || product.skus[0]?.skuId;
    if (!skuId) return alert(zh ? "该商品还没有可选规格" : "No selectable SKU yet");
    const quantity = Math.max(product.moq || 1, quantities[product.id] || product.moq || 1);
    setCheckingId(product.id);
    try {
      const check = await apiFetch<{ checkedAt: string; unitPrice: number | null }>("/api/accessories/check-stock", { method: "POST", body: JSON.stringify({ productId: product.id, skuId, quantity }) });
      const sku = product.skus.find((item) => String(item.skuId) === String(skuId));
      const line: CartLine = { productId: product.id, skuId, title: product.title, skuLabel: sku?.attributes?.map((a) => a.value).join(" / ") || sku?.sourceColor || skuId, quantity, unitPrice: check.unitPrice, sourceUrl: product.sourceUrl, checkedAt: check.checkedAt };
      const next = [...cart.filter((item) => !(item.productId === product.id && item.skuId === skuId)), line];
      setCart(next); localStorage.setItem("verosuits-accessory-cart", JSON.stringify(next));
    } catch (e) { alert(e instanceof Error ? e.message : "库存检查失败"); }
    finally { setCheckingId(null); }
  };

  const logout = async () => { try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* Local token is still cleared below. */ } clearAuth(); window.location.href = "/login"; };
  if (!ready || !user) return <main className="admin-page admin-loading">正在加载登录状态…</main>;

  return <main className="shell accessory-shell">
    <Shell active="accessories" />
    <section className="work">
      <header className="accessory-topbar">
        <div className="accessory-store"><BrandLogo compact /><span><small>PRIVATE MADE-TO-MEASURE SERVICE</small><strong>{user.storeName || "Baker Street Tailors"}</strong></span></div>
        <div className="actions"><LanguageSwitcher /><button onClick={logout}>{zh ? "切换账号" : "Switch account"}</button></div>
      </header>
      <div className="accessory-page">
        <section className="accessory-intro">
          <div><p className="eyebrow">CURATED ACCESSORIES</p><h1>{zh ? "精选配件" : "Curated accessories"}</h1><p>{zh ? "选择适合本次定制的配件，按颜色、成分与价格快速筛选。" : "Choose accessories for this order and filter by colour, material or price."}</p></div>
        </section>

        <section className="accessory-catalog">
          <div className="accessory-categories">{CATEGORIES.map(([key, cn, en]) => <button key={key} className={category === key ? "on" : ""} onClick={() => setCategory(key)}>{zh ? cn : en}<small>{key === "all" ? customerProducts.length : customerProducts.filter((p) => p.category === key).length}</small></button>)}</div>
          <div className="accessory-filters">
            <label><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={zh ? "搜索配件名称" : "Search accessories"} /></label>
            <select value={color} onChange={(e) => setColor(e.target.value)}><option value="all">{zh ? "全部颜色" : "All colours"}</option>{colors.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={material} onChange={(e) => setMaterial(e.target.value)}><option value="all">{zh ? "全部成分" : "All materials"}</option>{materials.map((v) => <option key={v}>{v}</option>)}</select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="default">{zh ? "默认排序" : "Default"}</option><option value="price_asc">{zh ? "价格从低到高" : "Price low to high"}</option><option value="price_desc">{zh ? "价格从高到低" : "Price high to low"}</option></select>
          </div>

          {loading && <div className="accessory-empty">正在加载…</div>}
          {error && <div className="accessory-empty error">{error}<button onClick={load}>{zh ? "重试" : "Retry"}</button></div>}
          {!loading && !error && filtered.length === 0 && <div className="accessory-empty"><i>◇</i><h2>{customerProducts.length ? (zh ? "没有匹配的配件" : "No matching accessories") : (zh ? "配件正在准备中" : "Accessories are being prepared")}</h2><p>{zh ? "请稍后再查看，或联系门店了解可选配件。" : "Please check again later or contact the store for available accessories."}</p></div>}
          <div className="accessory-grid">{filtered.map((product) => {
            const price = effectivePrice(product.priceTiers, quantities[product.id] || product.moq || 1);
            return <article key={product.id} className={`accessory-card status-${product.status}`}>
              <div className="accessory-photo">{product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <span>◇</span>}</div>
              <div className="accessory-card-body"><h3>{product.title}</h3>
                <div className="accessory-tags"><span>{product.sourceColor || product.colorGroup || "颜色待识别"}</span><span>{product.sourceMaterial || product.materialGroup || "成分待识别"}</span></div>
                <select value={selectedSku[product.id] || product.skus[0]?.skuId || ""} onChange={(e) => setSelectedSku((prev) => ({ ...prev, [product.id]: e.target.value }))}>{product.skus.map((sku) => <option key={sku.skuId} value={sku.skuId}>{sku.attributes?.map((a) => a.value).join(" / ") || sku.sourceColor || sku.skuId}</option>)}</select><div className="accessory-buy"><label>{zh ? "数量" : "Qty"}<input type="number" min={product.moq || 1} value={quantities[product.id] || product.moq || 1} onChange={(e) => setQuantities((prev) => ({ ...prev, [product.id]: Math.max(1, Number(e.target.value)) }))} /></label><strong>{price == null ? (zh ? "价格待确认" : "Price on request") : `¥${price.toFixed(2)}`}</strong></div><button className="accessory-add" disabled={checkingId === product.id} onClick={() => addToCart(product)}>{checkingId === product.id ? (zh ? "正在确认…" : "Confirming…") : (zh ? "加入选购单" : "Add to selection")}</button>
              </div>
            </article>;
          })}</div>
        </section>
      </div>
    </section>
  </main>;
}
