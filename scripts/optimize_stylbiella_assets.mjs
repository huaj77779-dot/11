import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const assetDir = path.join(root, "public", "stylbiella");
const files = (await readdir(assetDir)).filter((name) => name.endsWith(".png"));

for (const name of files) {
  const source = path.join(assetDir, name);
  const target = path.join(assetDir, name.replace(/\.png$/, ".webp"));
  await sharp(source)
    .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(target);
  await rm(source);
}

for (const relative of ["app/lib/stylbiella-fabrics.ts", "docs/SITE-DETAILS.md", "docs/CONTENT-KB.md"]) {
  const file = path.join(root, relative);
  const content = await readFile(file, "utf8");
  await writeFile(file, content.replaceAll(/(\/stylbiella\/[^\s"')]+)\.png/g, "$1.webp"));
}

console.log(`Optimized ${files.length} STYLBIELLA swatches.`);
