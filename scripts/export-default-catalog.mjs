import { readFile } from "node:fs/promises";
import ts from "typescript";

const root = new URL("..", import.meta.url);

async function source(relative) {
  return ts.createSourceFile(
    relative,
    await readFile(new URL(relative, root), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    relative.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function initializer(file, name) {
  let result;
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name && declaration.initializer) {
        result = declaration.initializer.getText(file);
      }
    }
  }
  if (!result) throw new Error(`Could not find ${name} in ${file.fileName}`);
  return result;
}

function evaluate(expression, names = [], values = []) {
  return Function(...names, `return (${expression});`)(...values);
}

const tailoring = await source("app/tailoring-app.tsx");
const stylbiella = await source("app/lib/stylbiella-fabrics.ts");
const colors = await source("app/lib/stylbiella-fabric-colors.ts");
const articles = await source("app/lib/articles.ts");

const stylbiellaFabrics = evaluate(initializer(stylbiella, "STYLBIELLA_FABRICS"));
const stylbiellaShirts = evaluate(initializer(stylbiella, "STYLBIELLA_SHIRT_FABRICS"));
const bookMeta = evaluate(initializer(stylbiella, "STYLBIELLA_BOOK_META"));
const fabricColors = evaluate(initializer(colors, "STYLBIELLA_FABRIC_COLORS"));
const rawFabrics = evaluate(
  initializer(tailoring, "fabricsByGarment"),
  ["STYLBIELLA_FABRICS", "STYLBIELLA_BOOK_META", "STYLBIELLA_SHIRT_FABRICS", "STYLBIELLA_FABRIC_COLORS"],
  [stylbiellaFabrics, bookMeta, stylbiellaShirts, fabricColors],
);
const optionsByGarment = evaluate(initializer(tailoring, "optionsByGarment"));
const shirtSurcharges = evaluate(initializer(tailoring, "SHIRT_OPTION_SURCHARGES"));
const seoArticles = evaluate(initializer(articles, "SEO_ARTICLES"));

const catalogFabrics = Object.entries(rawFabrics).flatMap(([garmentType, rows]) =>
  rows.map((row, index) => ({
    code: String(row.code).toUpperCase(), name: String(row.name), mill: String(row.mill ?? ""),
    book: String(row.book ?? ""), tone: String(row.tone ?? "custom"), meta: String(row.meta ?? ""),
    stock: String(row.stock ?? "现货"), price: Number(row.price ?? 0), imageUrl: row.imageUrl ?? null,
    garmentType, sortOrder: index, active: true,
  })),
);

function surcharge(garmentType, groupIndex, itemIndex, group, item) {
  if (garmentType === "shirt") return Number(shirtSurcharges[`${group}\u0000${item}`] ?? 0);
  const rules = {
    jacket: { 7: [0, 100, 1900], 8: [0, 200, 200, 200] },
    trousers: { 0: [0, 0, 0, 0, 0, 0], 1: [0, 0, 0, 0], 2: [0, 0, 0, 20], 3: [0, 0, 0, 0], 4: [0, 0] },
    waistcoat: { 0: [0, 0, 0, 80, 80, 80, 80, 80] },
  };
  return Number(rules[garmentType]?.[groupIndex]?.[itemIndex] ?? 0);
}

const catalogStyles = Object.entries(optionsByGarment).flatMap(([garmentType, groups]) =>
  groups.flatMap((group, groupIndex) => group.items.map((item, itemIndex) => ({
    garmentType, groupTitle: String(group.title), item: String(item),
    surcharge: surcharge(garmentType, groupIndex, itemIndex, group.title, item),
    imageUrl: null, sortOrder: groupIndex * 100 + itemIndex, active: true,
  }))),
);

const catalogNews = seoArticles.map((article) => ({
  slug: String(article.slug), locale: "en", title: String(article.title), excerpt: String(article.description ?? ""),
  body: "", category: String(article.category ?? "Company News"), coverImage: article.images?.[0]?.src ?? null,
  status: "published", publishedAt: `${article.published}T00:00:00.000Z`, authorId: 0,
}));

process.stdout.write(JSON.stringify({ fabrics: catalogFabrics, styles: catalogStyles, news: catalogNews }));
