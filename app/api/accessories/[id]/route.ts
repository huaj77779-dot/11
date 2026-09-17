import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { accessoryProducts } from "../../../../db/schema";
import { ensureSchema } from "../../../../db/init";
import { getSession, scopeFor } from "../../../lib/auth";

type PriceTier = { minQuantity: number; unitPrice: number };
type Sku = {
  skuId: string;
  attributes?: Array<{ name: string; value: string }>;
  sourceColor?: string;
  colorGroup?: string;
  sourceMaterial?: string;
  materialGroup?: string;
  stockQuantity?: number | null;
  stockStatus?: "in_stock" | "out_of_stock" | "unknown";
  priceTiers?: PriceTier[];
};

const GROUPS = new Set(["black", "white", "grey", "blue", "red", "green", "yellow", "brown", "purple", "pink", "orange", "metallic", "multicolor", "unknown"]);

function cleanGroup(value: unknown) {
  const next = String(value ?? "unknown").trim().toLowerCase();
  return GROUPS.has(next) ? next : "unknown";
}

/** Receives the normalized result produced by the local 1688 browser collector. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const db = getDb();
  await ensureSchema(db);
  const user = await getSession(db, request);
  if (!user) return Response.json({ error: "登录后才能同步采集结果" }, { status: 401 });

  const { id } = await context.params;
  const scope = scopeFor(user);
  const [existing] = await db.select().from(accessoryProducts).where(and(
    eq(accessoryProducts.id, Number(id)),
    scope == null ? undefined : eq(accessoryProducts.ownerId, scope),
  )).limit(1);
  if (!existing) return Response.json({ error: "配件记录不存在" }, { status: 404 });

  const payload = await request.json() as {
    title?: string;
    supplierName?: string;
    imageUrl?: string | null;
    sourceMaterial?: string;
    materialGroup?: string;
    sourceColor?: string;
    colorGroup?: string;
    moq?: number | null;
    priceTiers?: PriceTier[];
    skus?: Sku[];
    status?: "collecting" | "ready" | "error";
  };
  if (!Array.isArray(payload.skus) || !payload.skus.length) {
    return Response.json({ error: "采集结果必须包含至少一个SKU" }, { status: 400 });
  }
  const skus = payload.skus.map((sku) => ({
    ...sku,
    skuId: String(sku.skuId ?? "").trim(),
    colorGroup: cleanGroup(sku.colorGroup),
    materialGroup: String(sku.materialGroup ?? "unknown").trim().toLowerCase() || "unknown",
    stockQuantity: typeof sku.stockQuantity === "number" ? Math.max(0, sku.stockQuantity) : null,
    stockStatus: sku.stockStatus ?? "unknown",
  })).filter((sku) => sku.skuId);
  if (!skus.length) return Response.json({ error: "没有有效的SKU编号" }, { status: 400 });

  const now = new Date().toISOString();
  const [updated] = await db.update(accessoryProducts).set({
    title: String(payload.title ?? existing.title).trim(),
    supplierName: String(payload.supplierName ?? existing.supplierName).trim(),
    imageUrl: payload.imageUrl === undefined ? existing.imageUrl : payload.imageUrl,
    sourceMaterial: String(payload.sourceMaterial ?? existing.sourceMaterial).trim(),
    materialGroup: String(payload.materialGroup ?? existing.materialGroup ?? "unknown").trim().toLowerCase(),
    sourceColor: String(payload.sourceColor ?? existing.sourceColor).trim(),
    colorGroup: cleanGroup(payload.colorGroup ?? existing.colorGroup),
    moq: payload.moq == null ? existing.moq : Math.max(1, Number(payload.moq) || 1),
    priceTiers: JSON.stringify(Array.isArray(payload.priceTiers) ? payload.priceTiers : []),
    skus: JSON.stringify(skus),
    status: payload.status ?? "ready",
    checkedAt: now,
    updatedAt: now,
  }).where(eq(accessoryProducts.id, existing.id)).returning();

  return Response.json({ product: { ...updated, priceTiers: JSON.parse(updated.priceTiers), skus: JSON.parse(updated.skus) } });
}
