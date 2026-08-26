import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const targetRoot = path.join(publicDir, "garment-options");

function safeSegment(value) {
  return value.replace(/[<>:"/\\|?*]/g, "-").trim();
}

function organizeMapping(mappingFile, sourceFolder, categoryForOffset) {
  const filePath = path.join(root, "app", mappingFile);
  let source = fs.readFileSync(filePath, "utf8");
  let offset = 0;
  source = source.replace(/^(\s*)"([^"]+):([^"]+)":\s*"([^"]+)",/gm, (line, indent, group, item, file, matchOffset) => {
    const category = categoryForOffset(matchOffset);
    const extension = path.extname(file);
    const destinationParts = [category, safeSegment(group), `${safeSegment(item)}${extension}`];
    const destination = path.join(targetRoot, ...destinationParts);
    const original = path.join(publicDir, sourceFolder, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!fs.existsSync(original)) throw new Error(`Missing image: ${original}`);
    fs.copyFileSync(original, destination);
    const mapped = destinationParts.join("/");
    offset += 1;
    return `${indent}"${group}:${item}": "${mapped}",`;
  });
  fs.writeFileSync(filePath, source, "utf8");
  return offset;
}

const suitFile = path.join(root, "app", "suit-option-images.ts");
const suitSource = fs.readFileSync(suitFile, "utf8");
const trousersMarker = suitSource.indexOf("Trousers");
const waistcoatMarker = suitSource.indexOf("Waistcoat");
const suitCount = organizeMapping("suit-option-images.ts", "suit-options", (offset) => {
  if (offset > waistcoatMarker) return "马甲";
  if (offset > trousersMarker) return "西裤";
  return "西装上衣";
});

const shirtCount = organizeMapping("shirt-option-images.ts", "shirt-options", () => "衬衫");

for (const mappingFile of ["suit-option-images.ts", "shirt-option-images.ts"]) {
  const filePath = path.join(root, "app", mappingFile);
  let source = fs.readFileSync(filePath, "utf8");
  source = source.replace(
    /return `\/(?:suit-options|shirt-options)\/\$\{encodeURIComponent\(file\)\}`;/,
    'return `/garment-options/${file.split("/").map(encodeURIComponent).join("/")}`;',
  );
  fs.writeFileSync(filePath, source, "utf8");
}

console.log(`organized suit=${suitCount} shirt=${shirtCount}`);
