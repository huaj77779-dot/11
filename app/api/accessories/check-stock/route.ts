import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { accessoryProducts } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";
import { getSession, scopeFor } from "../../../lib/auth";
import { getCufflinkProduct } from "../../../lib/cufflinks-catalog";

type Sku = { skuId?: string; stockQuantity?: number | null; stockStatus?: string; priceTiers?: Array<{ minQuantity: number; unitPrice: number }> };

export async function POST(request: Request) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user) return Response.json({ error: "登录后才能检查库存" }, { status: 401 });
  const payload = await request.json() as { productId?: number; skuId?: string; quantity?: number };
  const catalogProduct = getCufflinkProduct(Number(payload.productId));
  if (catalogProduct) {
    const sku = catalogProduct.skus.find((item) => String(item.skuId) === String(payload.skuId));
    if (!sku) return Response.json({ error: "该款式已不存在，请重新选择", code: "SKU_MISSING" }, { status: 409 });
    const quantity = Math.max(1, Number(payload.quantity) || 1);
    if (sku.stockStatus === "out_of_stock" || (typeof sku.stockQuantity === "number" && sku.stockQuantity < quantity)) {
      return Response.json({ error: "该款式库存不足", code: "OUT_OF_STOCK" }, { status: 409 });
    }
    const tiers = [...sku.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
    const effective = tiers.filter((tier) => quantity >= tier.minQuantity).at(-1) ?? tiers[0];
    return Response.json({ ok: true, checkedAt: catalogProduct.checkedAt, stockQuantity: sku.stockQuantity, stockStatus: sku.stockStatus, unitPrice: effective?.unitPrice ?? null });
  }
  const scope = scopeFor(user);
  const [product] = await db.select().from(accessoryProducts).where(and(
    eq(accessoryProducts.id, Number(payload.productId)),
    scope == null ? undefined : eq(accessoryProducts.ownerId, scope),
  )).limit(1);
  if (!product) return Response.json({ error: "配件不存在" }, { status: 404 });
  if (product.status !== "ready") {
    return Response.json({ error: "商品仍在等待本地采集器处理", code: "COLLECTION_PENDING", sourceUrl: product.sourceUrl }, { status: 409 });
  }
  const checkedAt = product.checkedAt ? new Date(product.checkedAt).getTime() : 0;
  if (!checkedAt || Date.now() - checkedAt > 15 * 60 * 1000) {
    return Response.json({ error: "库存信息已超过15分钟，请先用本地采集器复查", code: "REFRESH_REQUIRED", sourceUrl: product.sourceUrl }, { status: 409 });
  }
  let skus: Sku[] = [];
  try { skus = JSON.parse(product.skus || "[]") as Sku[]; } catch { skus = []; }
  const sku = skus.find((item) => String(item.skuId) === String(payload.skuId));
  if (!sku) return Response.json({ error: "该规格已不存在，请重新选择", code: "SKU_MISSING", sourceUrl: product.sourceUrl }, { status: 409 });
  const quantity = Math.max(1, Number(payload.quantity) || 1);
  if (sku.stockStatus === "out_of_stock" || (typeof sku.stockQuantity === "number" && sku.stockQuantity < quantity)) {
    return Response.json({ error: "该规格库存不足", code: "OUT_OF_STOCK", sourceUrl: product.sourceUrl }, { status: 409 });
  }
  const tiers = [...(sku.priceTiers ?? [])].sort((a, b) => a.minQuantity - b.minQuantity);
  const effective = tiers.filter((tier) => quantity >= tier.minQuantity).at(-1);
  return Response.json({ ok: true, checkedAt: product.checkedAt, stockQuantity: sku.stockQuantity ?? null, stockStatus: sku.stockStatus ?? "unknown", unitPrice: effective?.unitPrice ?? null });
}
