"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "../_components/Shell";
import { BrandLogo } from "../_components/BrandLogo";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";
import { apiFetch, clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { useLocale } from "../lib/i18n";
import { useCurrency } from "../lib/currency";

type PriceTier = { minQuantity: number; unitPrice: number };
type Sku = { skuId: string; attributes?: Array<{ name: string; value: string }>; imageUrl?: string | null; imageFallback?: boolean; sourceColor?: string; colorGroup?: string; sourceMaterial?: string; materialGroup?: string; styleGroup?: string; stockQuantity?: number | null; stockStatus?: string; priceTiers?: PriceTier[] };
type Product = { id: number; category: string; title: string; supplierName: string; sourceUrl: string; offerId: string; imageUrl?: string | null; sourceMaterial: string; materialGroup: string; sourceColor: string; colorGroup: string; moq?: number | null; priceTiers: PriceTier[]; skus: Sku[]; status: string; checkedAt?: string | null };
type CartLine = { productId: number; skuId: string; title: string; skuLabel: string; quantity: number; unitPrice: number | null; sourceUrl: string; checkedAt: string };
type StyleCard = { key: string; product: Product; sku: Sku };

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
const COLOR_LABELS: Record<string, [string, string]> = { black: ["黑色", "Black"], white: ["白色", "White"], grey: ["灰色", "Grey"], blue: ["蓝色", "Blue"], red: ["红色", "Red"], green: ["绿色", "Green"], gold: ["金色", "Gold"], silver: ["银色", "Silver"], purple: ["紫色", "Purple"], pink: ["粉色", "Pink"], brown: ["棕色", "Brown"], multicolor: ["多色", "Multicolour"] };
const MATERIAL_LABELS: Record<string, [string, string]> = { copper: ["铜", "Copper"], alloy: ["合金", "Alloy"], metal: ["金属", "Metal"] };
const STYLE_LABELS: Record<string, [string, string]> = { classic: ["经典", "Classic"], initial: ["字母", "Initial"], crystal: ["水晶/锆石", "Crystal"], enamel: ["珐琅", "Enamel"], square: ["方形", "Square"], round: ["圆形", "Round"], set: ["礼盒套装", "Gift set"], novelty: ["趣味造型", "Novelty"] };
const PAGE_SIZE = 48;
function effectivePrice(tiers: PriceTier[], quantity = 1) {
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity).filter((tier) => quantity >= tier.minQuantity).at(-1)?.unitPrice ?? tiers[0]?.unitPrice ?? null;
}

export default function AccessoriesPage() {
  const { user, ready } = useAuthGuard(true);
  const { loc } = useLocale();
  const { money, currency } = useCurrency();
  const zh = loc === "zh";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [color, setColor] = useState("all");
  const [material, setMaterial] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState("default");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkingKey, setCheckingKey] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
  const styles = useMemo<StyleCard[]>(() => customerProducts.flatMap((product) => product.skus.map((sku) => ({ key: `${product.id}:${sku.skuId}`, product, sku }))), [customerProducts]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = styles.filter(({ product, sku }) =>
      (category === "all" || product.category === category) &&
      (color === "all" || sku.colorGroup === color) &&
      (material === "all" || sku.materialGroup === material) &&
      (style === "all" || sku.styleGroup === style) &&
      (!needle || `${product.title} ${sku.attributes?.map((item) => item.value).join(" ") || ""}`.toLowerCase().includes(needle))
    );
    if (sort !== "default") next.sort((a, b) => (effectivePrice(a.sku.priceTiers ?? a.product.priceTiers) ?? Number.MAX_VALUE) - (effectivePrice(b.sku.priceTiers ?? b.product.priceTiers) ?? Number.MAX_VALUE));
    return sort === "price_desc" ? next.reverse() : next;
  }, [styles, category, query, color, material, style, sort]);

  const colors = [...new Set(styles.map(({ sku }) => sku.colorGroup).filter((v): v is string => Boolean(v && v !== "unknown")))];
  const materials = [...new Set(styles.map(({ sku }) => sku.materialGroup).filter((v): v is string => Boolean(v && v !== "unknown")))];
  const styleGroups = [...new Set(styles.map(({ sku }) => sku.styleGroup).filter((v): v is string => Boolean(v)))];
  const visibleStyles = filtered.slice(0, visibleCount);

  const addToCart = async (product: Product, sku: Sku, key: string) => {
    const skuId = sku.skuId;
    const quantity = Math.max(product.moq || 1, quantities[key] || product.moq || 1);
    setCheckingKey(key);
    try {
      const check = await apiFetch<{ checkedAt: string; unitPrice: number | null }>("/api/accessories/check-stock", { method: "POST", body: JSON.stringify({ productId: product.id, skuId, quantity }) });
      const line: CartLine = { productId: product.id, skuId, title: product.title, skuLabel: sku?.attributes?.map((a) => a.value).join(" / ") || sku?.sourceColor || skuId, quantity, unitPrice: check.unitPrice, sourceUrl: product.sourceUrl, checkedAt: check.checkedAt };
      const next = [...cart.filter((item) => !(item.productId === product.id && item.skuId === skuId)), line];
      setCart(next); localStorage.setItem("verosuits-accessory-cart", JSON.stringify(next));
    } catch (e) { alert(e instanceof Error ? e.message : "库存检查失败"); }
    finally { setCheckingKey(null); }
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
          <div className="accessory-categories">{CATEGORIES.map(([key, cn, en]) => <button key={key} className={category === key ? "on" : ""} onClick={() => { setCategory(key); setVisibleCount(PAGE_SIZE); }}>{zh ? cn : en}<small>{key === "all" ? styles.length : styles.filter(({ product }) => product.category === key).length}</small></button>)}</div>
          <div className="accessory-filters">
            <label><span>⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }} placeholder={zh ? "搜索配件名称" : "Search accessories"} /></label>
            <select value={color} onChange={(e) => { setColor(e.target.value); setVisibleCount(PAGE_SIZE); }}><option value="all">{zh ? "全部颜色" : "All colours"}</option>{colors.map((v) => <option key={v} value={v}>{COLOR_LABELS[v]?.[zh ? 0 : 1] ?? v}</option>)}</select>
            <select value={material} onChange={(e) => { setMaterial(e.target.value); setVisibleCount(PAGE_SIZE); }}><option value="all">{zh ? "全部材质" : "All materials"}</option>{materials.map((v) => <option key={v} value={v}>{MATERIAL_LABELS[v]?.[zh ? 0 : 1] ?? v}</option>)}</select>
            <select value={style} onChange={(e) => { setStyle(e.target.value); setVisibleCount(PAGE_SIZE); }}><option value="all">{zh ? "全部款式" : "All styles"}</option>{styleGroups.map((v) => <option key={v} value={v}>{STYLE_LABELS[v]?.[zh ? 0 : 1] ?? v}</option>)}</select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setVisibleCount(PAGE_SIZE); }}><option value="default">{zh ? "默认排序" : "Default"}</option><option value="price_asc">{zh ? "价格从低到高" : "Price low to high"}</option><option value="price_desc">{zh ? "价格从高到低" : "Price high to low"}</option></select>
          </div>

          {loading && <div className="accessory-empty">正在加载…</div>}
          {error && <div className="accessory-empty error">{error}<button onClick={load}>{zh ? "重试" : "Retry"}</button></div>}
          {!loading && !error && filtered.length === 0 && <div className="accessory-empty"><i>◇</i><h2>{styles.length ? (zh ? "没有匹配的配件" : "No matching accessories") : (zh ? "配件正在准备中" : "Accessories are being prepared")}</h2><p>{zh ? "请调整筛选条件，或联系门店了解更多可选配件。" : "Adjust the filters or contact the store for more options."}</p></div>}
          {!loading && !error && filtered.length > 0 && <div className="accessory-results"><span>{zh ? `共 ${filtered.length} 个具体款式` : `${filtered.length} individual styles`}</span><small>{zh ? `售价已按成本系数计算，当前显示 ${currency}` : `Retail pricing · ${currency}`}</small></div>}
          <div className="accessory-grid">{visibleStyles.map(({ key, product, sku }) => {
            const quantity = quantities[key] || product.moq || 1;
            const price = effectivePrice(sku.priceTiers?.length ? sku.priceTiers : product.priceTiers, quantity);
            const skuName = sku.attributes?.map((a) => a.value).join(" / ") || sku.sourceColor || sku.skuId;
            return <article key={key} className="accessory-card">
              <div className="accessory-photo">{sku.imageUrl || product.imageUrl ? <img src={sku.imageUrl || product.imageUrl || ""} alt={`${product.title} ${skuName}`} loading="lazy" /> : <span>◇</span>}{sku.imageFallback && <em>{zh ? "商品主图" : "Product image"}</em>}</div>
              <div className="accessory-card-body"><small>{product.title}</small><h3>{skuName}</h3>
                <div className="accessory-tags"><span>{sku.sourceColor || COLOR_LABELS[sku.colorGroup || ""]?.[zh ? 0 : 1] || "多色"}</span><span>{sku.sourceMaterial || MATERIAL_LABELS[sku.materialGroup || ""]?.[zh ? 0 : 1] || "金属"}</span><span>{STYLE_LABELS[sku.styleGroup || "classic"]?.[zh ? 0 : 1]}</span></div>
                <div className="accessory-buy"><label>{zh ? "数量" : "Qty"}<input type="number" min={product.moq || 1} value={quantity} onChange={(e) => setQuantities((prev) => ({ ...prev, [key]: Math.max(1, Number(e.target.value)) }))} /></label><strong>{price == null ? (zh ? "价格待确认" : "Price on request") : money(price)}</strong></div><button className="accessory-add" disabled={checkingKey === key} onClick={() => addToCart(product, sku, key)}>{checkingKey === key ? (zh ? "正在确认…" : "Confirming…") : (zh ? "加入选购单" : "Add to selection")}</button>
              </div>
            </article>;
          })}</div>
          {visibleCount < filtered.length && <div className="accessory-load-more"><button onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>{zh ? `加载更多（剩余 ${filtered.length - visibleCount}）` : `Load more (${filtered.length - visibleCount} remaining)`}</button></div>}
        </section>
      </div>
    </section>
  </main>;
}
