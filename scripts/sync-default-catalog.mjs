import { execFileSync } from "node:child_process";

const apply = process.argv.includes("--apply");
const sectionIndex = process.argv.indexOf("--apply-section");
const applySection = sectionIndex === -1 ? null : process.argv[sectionIndex + 1];
const data = JSON.parse(execFileSync(process.execPath, ["scripts/export-default-catalog.mjs"], { encoding: "utf8" }));

function quote(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "0";
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function run(sql) {
  return execFileSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "atelier-os-mtm-supply", "--remote", "--command", sql], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function chunks(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function fabricSql(row) {
  return `INSERT INTO fabrics (code,name,mill,book,tone,meta,stock,price,image_url,garment_type,sort_order,active) VALUES (${[
    row.code, row.name, row.mill, row.book, row.tone, row.meta, row.stock, row.price, row.imageUrl,
    row.garmentType, row.sortOrder, row.active,
  ].map(quote).join(",")}) ON CONFLICT(code) DO NOTHING;`;
}

function styleSql(row) {
  const values = [row.garmentType, row.groupTitle, row.item, row.surcharge, row.imageUrl, row.sortOrder, row.active];
  const [garmentType, groupTitle, item] = values;
  return `INSERT INTO style_options (garment_type,group_title,item,surcharge,image_url,sort_order,active) SELECT ${values.map(quote).join(",")} WHERE NOT EXISTS (SELECT 1 FROM style_options WHERE garment_type=${quote(garmentType)} AND group_title=${quote(groupTitle)} AND item=${quote(item)});`;
}

function newsSql(row) {
  return `INSERT INTO news_articles (slug,locale,title,excerpt,body,category,cover_image,status,published_at,author_id) VALUES (${[
    row.slug, row.locale, row.title, row.excerpt, row.body, row.category, row.coverImage, row.status, row.publishedAt, row.authorId,
  ].map(quote).join(",")}) ON CONFLICT(slug) DO NOTHING;`;
}

const plans = [
  ["fabrics", data.fabrics, fabricSql],
  ["styles", data.styles, styleSql],
  ["news", data.news, newsSql],
];

const sqlIndex = process.argv.indexOf("--sql");
if (sqlIndex !== -1) {
  const name = process.argv[sqlIndex + 1];
  const offset = Number(process.argv[sqlIndex + 2] ?? 0);
  const limit = Number(process.argv[sqlIndex + 3] ?? 20);
  const plan = plans.find(([planName]) => planName === name);
  if (!plan) throw new Error(`Unknown catalog section: ${name}`);
  const [, rows, statement] = plan;
  process.stdout.write(rows.slice(offset, offset + limit).map(statement).join("\n"));
  process.exit(0);
}

const base64Index = process.argv.indexOf("--sql-base64");
if (base64Index !== -1) {
  const name = process.argv[base64Index + 1];
  const offset = Number(process.argv[base64Index + 2] ?? 0);
  const limit = Number(process.argv[base64Index + 3] ?? 20);
  const plan = plans.find(([planName]) => planName === name);
  if (!plan) throw new Error(`Unknown catalog section: ${name}`);
  const [, rows, statement] = plan;
  process.stdout.write(Buffer.from(rows.slice(offset, offset + limit).map(statement).join("\n"), "utf8").toString("base64"));
  process.exit(0);
}

console.log(JSON.stringify(Object.fromEntries(plans.map(([name, rows]) => [name, rows.length])), null, 2));
if (!apply && !applySection) {
  console.log("Dry run only. Pass --apply to import these missing records.");
  process.exit(0);
}

for (const [name, rows, statement] of plans) {
  if (applySection && name !== applySection) continue;
  let completed = 0;
  for (const batch of chunks(rows, 40)) {
    run(batch.map(statement).join("\n"));
    completed += batch.length;
    console.log(`${name}: ${completed}/${rows.length}`);
  }
}
console.log("Cloudflare D1 catalog import completed.");
