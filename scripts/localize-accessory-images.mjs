import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const catalogPath = path.resolve("app/data/cufflinks-catalog.json");
const outputDir = path.resolve("public/accessories/cufflinks");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));

const urls = new Set();
for (const product of catalog.products) {
  if (product.imageUrl?.startsWith("http")) urls.add(product.imageUrl);
  for (const sku of product.skus) {
    if (sku.imageUrl?.startsWith("http")) urls.add(sku.imageUrl);
  }
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const localized = new Map();
const failed = new Map();
const queue = [...urls];
let completed = 0;

async function download(url) {
  const digest = createHash("sha1").update(url).digest("hex");
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const filename = `${digest}.webp`;
  const optimized = await sharp(Buffer.from(await response.arrayBuffer()))
    .rotate()
    .resize(720, 720, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();
  await writeFile(path.join(outputDir, filename), optimized);
  localized.set(url, `/accessories/cufflinks/${filename}`);
  completed += 1;
  if (completed % 50 === 0 || completed === urls.size) console.log(`Downloaded ${completed}/${urls.size}`);
}

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    if (!url) continue;
    try {
      await download(url);
    } catch (error) {
      failed.set(url, error instanceof Error ? error.message : String(error));
    }
  }
}

await Promise.all(Array.from({ length: 8 }, worker));

for (const product of catalog.products) {
  const localProductImage = localized.get(product.imageUrl) || null;
  product.imageUrl = localProductImage;
  for (const sku of product.skus) {
    const localSkuImage = localized.get(sku.imageUrl);
    sku.imageUrl = localSkuImage || localProductImage;
    if (!localSkuImage && localProductImage) sku.imageFallback = true;
  }
}

catalog.imagesLocalizedAt = new Date().toISOString();
catalog.localizedImageCount = localized.size;
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Localized ${localized.size} unique images.`);
if (failed.size) {
  console.warn(`${failed.size} source images failed; affected styles use their product image.`);
  for (const message of failed.values()) console.warn(message);
}
