import fs from "node:fs";
import path from "node:path";

const [sourceDir, outputFile, category, expectedProductsArg, expectedSkusArg, expectedImagesArg, idOffsetArg = "0"] = process.argv.slice(2);
if (!sourceDir || !outputFile || !category) {
  console.error("Usage: node scripts/import-1688-accessories.mjs <source-dir> <output-file> <category> <expected-products> <expected-skus> <expected-images> [id-offset]");
  process.exit(1);
}

const readJsonl = (file) => fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const offers = readJsonl(path.join(sourceDir, "offers.jsonl"));
const details = readJsonl(path.join(sourceDir, "sku_details.jsonl"));
const offerById = new Map(offers.map((offer) => [String(offer.offer_id), offer]));

function parsePriceTiers(value) {
  const tiers = [];
  const pattern = /(?:≥\s*)?(\d+)(?:\s*-\s*\d+)?\s*(?:件|个)\s*(?:[¥￥]\s*([\d.]+)|([\d.]+)\s*元)/g;
  for (const match of String(value || "").matchAll(pattern)) {
    const sourcePrice = Number(match[2] || match[3]);
    if (Number.isFinite(sourcePrice)) tiers.push({ minQuantity: Number(match[1]), unitPrice: Number((sourcePrice * 1.5).toFixed(2)) });
  }
  return tiers.sort((a, b) => a.minQuantity - b.minQuantity);
}

function colorGroup(value) {
  const text = String(value || "");
  if (/黑/.test(text)) return "black";
  if (/白|米白|象牙/.test(text)) return "white";
  if (/灰|银灰|枪色/.test(text)) return "grey";
  if (/藏青|海军蓝|深蓝/.test(text)) return "navy";
  if (/蓝|青/.test(text)) return "blue";
  if (/酒红|枣红/.test(text)) return "burgundy";
  if (/红|朱/.test(text)) return "red";
  if (/绿|翡翠/.test(text)) return "green";
  if (/金|香槟/.test(text)) return "gold";
  if (/银|铬|铂/.test(text)) return "silver";
  if (/紫/.test(text)) return "purple";
  if (/粉|玫瑰/.test(text)) return "pink";
  if (/棕|咖|褐|木/.test(text)) return "brown";
  if (/橙/.test(text)) return "orange";
  if (/黄/.test(text)) return "yellow";
  return "multicolor";
}

function materialGroup(value) {
  const text = String(value || "");
  if (/桑蚕丝|真丝|蚕丝/.test(text)) return "silk";
  if (/涤纶|聚酯|涤丝/.test(text)) return "polyester";
  if (/不锈钢/.test(text)) return "stainless_steel";
  if (/黄铜/.test(text)) return "brass";
  if (/铜/.test(text)) return "copper";
  if (/合金/.test(text)) return "alloy";
  if (/金属|铁/.test(text)) return "metal";
  return "other";
}

function styleGroup(value) {
  const text = String(value || "");
  if (/条纹/.test(text)) return "stripe";
  if (/波点|圆点/.test(text)) return "dot";
  if (/格纹|格子/.test(text)) return "check";
  if (/花|佩斯利/.test(text)) return "pattern";
  if (/水晶|钻|锆石/.test(text)) return "crystal";
  if (/字母|英文|首字母|\b[A-Z]\d*\b/i.test(text)) return "initial";
  if (/礼盒|套装|盒装/.test(text)) return "set";
  if (/简约|商务/.test(text)) return "classic";
  return "other";
}

const products = details.map((detail, index) => {
  const offerId = String(detail.offer_id);
  const offer = offerById.get(offerId) || {};
  const tiers = parsePriceTiers(detail.price_ranges);
  const skus = Array.isArray(detail.skus) ? detail.skus : [];
  const firstSku = skus[0] || {};
  const fallbackImage = offer.image || null;
  const material = detail.material || firstSku.material || "";
  return {
    id: -(Number(idOffsetArg) + index + 1),
    ownerId: 0,
    category,
    title: String(offer.title || detail.title || "配件").trim(),
    supplierName: "",
    sourceUrl: offer.url || `https://detail.1688.com/offer/${offerId}.html`,
    offerId,
    imageUrl: fallbackImage,
    sourceMaterial: material,
    materialGroup: materialGroup(material),
    sourceColor: firstSku.color || "",
    colorGroup: "multicolor",
    moq: tiers[0]?.minQuantity || (/^\d+$/.test(String(detail.moq || "")) ? Number(detail.moq) : 1),
    priceTiers: tiers,
    skus: skus.map((sku) => {
      const sourceColor = sku.color || sku.sku_name || "";
      const sourceMaterial = sku.material || material;
      return {
        skuId: String(sku.sku_id),
        attributes: [{ name: "款式", value: String(sku.sku_name || sourceColor || sku.sku_id) }],
        imageUrl: sku.image || fallbackImage,
        imageFallback: !sku.image,
        sourceColor,
        colorGroup: colorGroup(sourceColor),
        sourceMaterial,
        materialGroup: materialGroup(sourceMaterial),
        styleGroup: styleGroup(`${offer.title || detail.title || ""} ${sku.sku_name || ""}`),
        stockQuantity: /^\d+$/.test(String(sku.stock || "")) ? Number(sku.stock) : null,
        stockStatus: Number(sku.stock) > 0 ? "in_stock" : "unknown",
        priceTiers: tiers,
      };
    }),
    status: "ready",
    checkedAt: detail.collect_time || new Date().toISOString(),
    active: true,
  };
});

const skuCount = products.reduce((sum, product) => sum + product.skus.length, 0);
const imageCount = products.reduce((sum, product) => sum + product.skus.filter((sku) => !sku.imageFallback).length, 0);
if (products.length !== Number(expectedProductsArg) || skuCount !== Number(expectedSkusArg) || imageCount !== Number(expectedImagesArg)) {
  throw new Error(`Integrity check failed: products=${products.length}, skus=${skuCount}, images=${imageCount}`);
}
if (products.some((product) => product.priceTiers.length === 0)) throw new Error("One or more products are missing price tiers");
if (products.some((product) => !product.offerId || !product.sourceUrl)) throw new Error("One or more products are missing procurement identifiers");

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), markup: 1.5, products }, null, 2)}\n`, "utf8");
console.log(`Imported ${products.length} products / ${skuCount} SKU styles / ${imageCount} style images`);
