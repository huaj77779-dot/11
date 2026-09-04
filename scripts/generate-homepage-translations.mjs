import fs from "node:fs/promises";

const sourcePath = new URL("../app/lib/i18n.ts", import.meta.url);
const outputPath = new URL("../app/lib/homepage-translations.ts", import.meta.url);
const source = await fs.readFile(sourcePath, "utf8");
const rows = [];
for (const match of source.matchAll(/"(landing\.[^"]+)"\s*:\s*\{([^\n]+)\}/g)) {
  const en = match[2].match(/\ben:\s*("(?:\\.|[^"\\])*")/);
  if (!en) continue;
  rows.push({ key: match[1], en: JSON.parse(en[1]), body: match[2] });
}

const targets = ["de", "ja", "fr", "it", "es", "pt", "nl", "pl", "sv", "da", "no", "cs"];
const googleCodes = { zh: "zh-CN", ja: "ja", cs: "cs" };
const result = Object.fromEntries(rows.map(({ key }) => [key, {}]));

async function translateBatch(texts, target) {
  const tagged = texts.map((text, index) => `[${index}] ${text}`).join("\n");
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", googleCodes[target] ?? target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", tagged);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0].map((part) => part[0]).join("");
  const found = [...translated.matchAll(/\[(\d+)\]\s*([\s\S]*?)(?=\n\[\d+\]|$)/g)];
  if (found.length !== texts.length) throw new Error(`Could not split ${target} batch (${found.length}/${texts.length})`);
  return found.map((item) => item[2].trim());
}

for (const target of targets) {
  const pending = rows.filter(({ body }) => {
    if (target !== "de" && target !== "ja") return true;
    const existing = body.match(new RegExp(`\\b${target}:\\s*("(?:\\\\.|[^"\\\\])*")`));
    return !existing || !JSON.parse(existing[1]).trim();
  });
  for (let start = 0; start < pending.length; start += 12) {
    const batch = pending.slice(start, start + 12);
    const translated = await translateBatch(batch.map((row) => row.en), target);
    batch.forEach((row, index) => { result[row.key][target] = translated[index]; });
  }
}

const lines = [
  'import type { Locale } from "./i18n";',
  "",
  "const homepageRows: Record<string, Partial<Record<Locale, string>>> = {",
  ...Object.entries(result).map(([key, values]) => `  ${JSON.stringify(key)}: ${JSON.stringify(values)},`),
  "};",
  "",
  "export function homepageTranslation(locale: Locale, key: string): string | undefined {",
  "  return homepageRows[key]?.[locale];",
  "}",
  "",
];
await fs.writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Generated ${rows.length} homepage keys for ${targets.length} languages.`);
