import fs from "node:fs";
import path from "node:path";

const [sourceDir, outputFile = "app/data/cufflinks-catalog.json", category = "cufflinks", expectedProductsArg = "55", expectedSkusArg = "1037", expectedImagesArg = "1035", idOffsetArg = "0"] = process.argv.slice(2);
if (!sourceDir) {
  console.error("Usage: node scripts/import-1688-cufflinks.mjs <source-dir> [output-file] [category] [expected-products] [expected-skus] [expected-images] [id-offset]");
  process.exit(1);
}

const readJsonl = (file) => fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const offers = readJsonl(path.join(sourceDir, "offers.jsonl"));
const details = readJsonl(path.join(sourceDir, "sku_details.jsonl"));
const offerById = new Map(offers.map((offer) => [String(offer.offer_id), offer]));

function parsePriceTiers(value) {
  const tiers = [];
  for (const part of String(value || "").split(";")) {
    const match = part.match(/≥\s*(\d+)\s*件\s*[¥￥]\s*([\d.]+)/);
    if (match) tiers.push({ minQuantity: Number(match[1]), unitPrice: Number((Number(match[2]) * 1.5).toFixed(2)) });
  }
  return tiers.sort((a, b) => a.minQuantity - b.minQuantity);
}

function colorGroup(value) {
  const text = String(value || "");
  if (/黑/.test(text)) return "black";
  if (/白|珍珠/.test(text)) return "white";
  if (/灰|枪/.test(text)) return "grey";
  if (/蓝|青/.test(text)) return "blue";
  if (/红|酒红/.test(text)) return "red";
  if (/绿|翡翠/.test(text)) return "green";
  if (/黄|金/.test(text)) return "gold";
  if (/银|铂|钢/.test(text)) return "silver";
  if (/紫/.test(text)) return "purple";
  if (/粉|玫瑰/.test(text)) return "pink";
  if (/棕|咖|木/.test(text)) return "brown";
  return "multicolor";
}

function materialGroup(value) {
  const text = String(value || "");
  if (/铜/.test(text)) return "copper";
  if (/合金/.test(text)) return "alloy";
  return "metal";
}

function styleGroup(value) {
  const text = String(value || "");
  if (/字母|英文|首字母|\b[A-Z]\b/i.test(text)) return "initial";
  if (/水晶|锆|钻|宝石/.test(text)) return "crystal";
  if (/珐琅|滴油|彩釉/.test(text)) return "enamel";
  if (/方|矩形/.test(text)) return "square";
  if (/圆|球/.test(text)) return "round";
  if (/礼盒|套装|领带夹/.test(text)) return "set";
  if (/动物|汽车|飞机|扑克|骷髅|乐器|运动|卡通/.test(text)) return "novelty";
  return "classic";
}

const products = details.map((detail, index) => {
  const offerId = String(detail.offer_id);
  const offer = offerById.get(offerId) || {};
  const tiers = parsePriceTiers(detail.price_ranges);
  const skus = Array.isArray(detail.skus) ? detail.skus : [];
  const firstSku = skus[0] || {};
  const fallbackImage = offer.image || null;
  return {
    id: -(Number(idOffsetArg) + index + 1),
    ownerId: 0,
    category,
    title: String(offer.title || detail.title || "袖扣").trim(),
    supplierName: "",
    sourceUrl: offer.url || `https://detail.1688.com/offer/${offerId}.html`,
    offerId,
    imageUrl: fallbackImage,
    sourceMaterial: detail.material || firstSku.material || "金属",
    materialGroup: materialGroup(detail.material || firstSku.material),
    sourceColor: firstSku.color || "多色",
    colorGroup: "multicolor",
    moq: tiers[0]?.minQuantity || 1,
    priceTiers: tiers,
    skus: skus.map((sku) => ({
      skuId: String(sku.sku_id),
      attributes: [{ name: "款式", value: String(sku.sku_name || sku.color || sku.sku_id) }],
      imageUrl: sku.image || fallbackImage,
      imageFallback: !sku.image,
      sourceColor: sku.color || "多色",
      colorGroup: colorGroup(sku.color || sku.sku_name),
      sourceMaterial: sku.material || detail.material || "金属",
      materialGroup: materialGroup(sku.material || detail.material),
      styleGroup: styleGroup(`${offer.title || detail.title} ${sku.sku_name || ""}`),
      stockQuantity: /^\d+$/.test(String(sku.stock || "")) ? Number(sku.stock) : null,
      stockStatus: Number(sku.stock) > 0 ? "in_stock" : "unknown",
      priceTiers: tiers,
    })),
    status: "ready",
    checkedAt: detail.collect_time || "2026-09-20T00:00:00.000Z",
    active: true,
  };
});

const skuCount = products.reduce((sum, product) => sum + product.skus.length, 0);
const imageCount = products.reduce((sum, product) => sum + product.skus.filter((sku) => !sku.imageFallback).length, 0);
const expectedProducts = Number(expectedProductsArg);
const expectedSkus = Number(expectedSkusArg);
const expectedImages = Number(expectedImagesArg);
if (products.length !== expectedProducts || skuCount !== expectedSkus || imageCount !== expectedImages) {
  throw new Error(`Integrity check failed: offers=${products.length}, skus=${skuCount}, images=${imageCount}`);
}
if (products.some((product) => product.priceTiers.length === 0)) throw new Error("One or more products are missing price tiers");

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), markup: 1.5, products })}\n`, "utf8");
console.log(`Imported ${products.length} products / ${skuCount} SKU styles / ${imageCount} style images`);
