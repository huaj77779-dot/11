import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [catalogArg = "app/data/cufflinks-catalog.json", outputArg = "public/accessories/cufflinks", publicPrefixArg = "/accessories/cufflinks", maxSizeArg = "480", qualityArg = "68"] = process.argv.slice(2);
const catalogPath = path.resolve(catalogArg);
const outputDir = path.resolve(outputArg);
const publicPrefix = publicPrefixArg.replace(/\/$/, "");
const maxSize = Math.max(240, Number(maxSizeArg) || 480);
const quality = Math.min(90, Math.max(45, Number(qualityArg) || 68));
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
  let response;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (response.ok || response.status === 404) break;
      lastError = new Error(`${response.status} ${url}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  if (!response) throw lastError || new Error(`Download failed ${url}`);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const filename = `${digest}.webp`;
  const optimized = await sharp(Buffer.from(await response.arrayBuffer()))
    .rotate()
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  await writeFile(path.join(outputDir, filename), optimized);
  localized.set(url, `${publicPrefix}/${filename}`);
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

await Promise.all(Array.from({ length: 4 }, worker));

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
