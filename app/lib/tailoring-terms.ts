import type { Locale } from "./i18n";
import { shirtOptionImages } from "../shirt-option-images";
import { suitOptionImages } from "../suit-option-images";

type EuLocale = Exclude<Locale, "zh" | "en" | "de" | "ja">;

const garments: Record<string, Record<EuLocale, string>> = {
  西装上衣: { fr: "Veste", it: "Giacca", es: "Chaqueta", pt: "Casaco", nl: "Colbert", pl: "Marynarka", sv: "Kavaj", da: "Jakke", no: "Dressjakke", cs: "Sako" },
  西裤: { fr: "Pantalon", it: "Pantaloni", es: "Pantalón", pt: "Calças", nl: "Pantalon", pl: "Spodnie", sv: "Byxor", da: "Bukser", no: "Bukse", cs: "Kalhoty" },
  马甲: { fr: "Gilet", it: "Gilet", es: "Chaleco", pt: "Colete", nl: "Gilet", pl: "Kamizelka", sv: "Väst", da: "Vest", no: "Vest", cs: "Vesta" },
  衬衫: { fr: "Chemise", it: "Camicia", es: "Camisa", pt: "Camisa", nl: "Overhemd", pl: "Koszula", sv: "Skjorta", da: "Skjorte", no: "Skjorte", cs: "Košile" },
};

const groups: Record<string, Record<EuLocale, string>> = {
  正面款式: { fr: "Boutonnage", it: "Abbottonatura", es: "Abotonadura", pt: "Abotoamento", nl: "Sluiting", pl: "Zapięcie", sv: "Knäppning", da: "Lukning", no: "Knapping", cs: "Zapínání" },
  胸兜款式: { fr: "Poche poitrine", it: "Taschino", es: "Bolsillo de pecho", pt: "Bolso de peito", nl: "Borstzak", pl: "Kieszeń piersiowa", sv: "Bröstficka", da: "Brystlomme", no: "Brystlomme", cs: "Náprsní kapsa" },
  肩膀样式: { fr: "Épaule", it: "Spalla", es: "Hombro", pt: "Ombro", nl: "Schouder", pl: "Ramię", sv: "Axel", da: "Skulder", no: "Skulder", cs: "Rameno" },
  驳头款式: { fr: "Revers", it: "Rever", es: "Solapa", pt: "Lapela", nl: "Revers", pl: "Klapy", sv: "Slag", da: "Revers", no: "Slag", cs: "Klopy" },
  口袋款式: { fr: "Poches", it: "Tasche", es: "Bolsillos", pt: "Bolsos", nl: "Zakken", pl: "Kieszenie", sv: "Fickor", da: "Lommer", no: "Lommer", cs: "Kapsy" },
  开衩位置选择: { fr: "Fentes", it: "Spacchi", es: "Aberturas", pt: "Aberturas", nl: "Splitten", pl: "Rozcięcia", sv: "Slitsar", da: "Slidser", no: "Splitter", cs: "Rozparky" },
  毛衬: { fr: "Entoilage", it: "Intelatura", es: "Entretela", pt: "Entretela", nl: "Binnenwerk", pl: "Konstrukcja wkładu", sv: "Mellanfoder", da: "Indlæg", no: "Innlegg", cs: "Výztuha" },
  里布位置: { fr: "Doublure", it: "Fodera", es: "Forro", pt: "Forro", nl: "Voering", pl: "Podszewka", sv: "Foder", da: "For", no: "Fôr", cs: "Podšívka" },
  裤腰: { fr: "Ceinture", it: "Cinturino", es: "Pretina", pt: "Cós", nl: "Tailleband", pl: "Pas", sv: "Linning", da: "Linning", no: "Linning", cs: "Pas" },
  裤褶: { fr: "Pinces", it: "Pinces", es: "Pliegues", pt: "Pregas", nl: "Plooien", pl: "Zakładki", sv: "Veck", da: "Læg", no: "Legg", cs: "Záhyby" },
  裤脚: { fr: "Bas", it: "Fondo", es: "Bajo", pt: "Bainha", nl: "Zoom", pl: "Dół nogawki", sv: "Byxavslut", da: "Bukseafslutning", no: "Bukseavslutning", cs: "Zakončení nohavice" },
  裤型: { fr: "Coupe", it: "Vestibilità", es: "Corte", pt: "Corte", nl: "Pasvorm", pl: "Krój", sv: "Passform", da: "Pasform", no: "Passform", cs: "Střih" },
  裤脚口: { fr: "Ouverture du bas", it: "Fondo gamba", es: "Boca del pantalón", pt: "Abertura da perna", nl: "Pijpopening", pl: "Obwód nogawki", sv: "Fotvidd", da: "Benåbning", no: "Benåpning", cs: "Šířka nohavice" },
  领型: { fr: "Col", it: "Colletto", es: "Cuello", pt: "Colarinho", nl: "Boord", pl: "Kołnierzyk", sv: "Krage", da: "Krave", no: "Krage", cs: "Límec" },
  领插片: { fr: "Baleines de col", it: "Stecche del colletto", es: "Ballenas del cuello", pt: "Barbatanas do colarinho", nl: "Boordstaafjes", pl: "Fiszbiny kołnierzyka", sv: "Kraglattor", da: "Kraveafstivere", no: "Krageavstivere", cs: "Výztuhy límce" },
  领硬度: { fr: "Rigidité du col", it: "Rigidità del colletto", es: "Rigidez del cuello", pt: "Rigidez do colarinho", nl: "Boordstijfheid", pl: "Sztywność kołnierzyka", sv: "Kragstyvhet", da: "Kravefasthed", no: "Kragestivhet", cs: "Tuhost límce" },
  袖口: { fr: "Poignets", it: "Polsini", es: "Puños", pt: "Punhos", nl: "Manchetten", pl: "Mankiety", sv: "Manschetter", da: "Manchetter", no: "Mansjetter", cs: "Manžety" },
  前幅门襟: { fr: "Gorge", it: "Finta anteriore", es: "Tapeta delantera", pt: "Carcela frontal", nl: "Voorbies", pl: "Plisa przednia", sv: "Knappslå", da: "Knapstolpe", no: "Knappestolpe", cs: "Přední léga" },
  下摆: { fr: "Bas", it: "Fondo", es: "Bajo", pt: "Bainha", nl: "Zoom", pl: "Dół", sv: "Nederkant", da: "Søm", no: "Nederkant", cs: "Spodní lem" },
  后担干: { fr: "Empiècement dos", it: "Carré posteriore", es: "Canesú trasero", pt: "Canga traseira", nl: "Rugpas", pl: "Karczek tylny", sv: "Ryggok", da: "Rygbærestykke", no: "Ryggstykke", cs: "Zadní sedlo" },
  体态登记: { fr: "Posture", it: "Postura", es: "Postura", pt: "Postura", nl: "Houding", pl: "Sylwetka", sv: "Hållning", da: "Kropsholdning", no: "Holdning", cs: "Držení těla" },
};

const englishTerms: Record<string, string> = {
  西装上衣: "Jacket",
  西裤: "Trousers",
  马甲: "Waistcoat",
  衬衫: "Shirt",
  正面款式: "Front fastening",
  胸兜款式: "Breast pocket",
  下摆开角大小: "Front quarters",
  肩膀样式: "Shoulder construction",
  口袋款式: "Pocket style",
  后幅款式与工艺: "Back style",
  开衩位置选择: "Vents",
  毛衬: "Canvas construction",
  里布位置: "Lining",
  驳头款式: "Lapel style",
  驳头扣眼位置: "Lapel buttonhole",
  袖扣款式: "Sleeve buttonholes",
  袖叉款式: "Sleeve buttonholes",
  西服背面款式: "Jacket back style",
  西服开衩选择: "Jacket vents",
  裤腰: "Waistband",
  裤褶: "Pleats",
  裤脚: "Trouser hem",
  裤型: "Trouser cut",
  裤脚口: "Hem opening",
  马甲款式: "Waistcoat style",
  马甲口袋数量: "Breast pockets",
  马甲口袋款式: "Pocket style",
  马甲下摆: "Waistcoat hem",
  领型: "Collar style",
  领插片: "Collar stays",
  领硬度: "Collar stiffness",
  袖口折: "Cuff pleats",
  口袋: "Pocket",
  袖口: "Cuff style",
  前幅门襟: "Front placket",
  下摆: "Shirt hem",
  后担干: "Back yoke",
  后幅: "Shirt back",
  侧缝工艺: "Side-seam finish",
  袖山意式碎折: "Spalla camicia gathers",
  错位上袖: "Offset sleeve setting",
  鸡爪扣钉: "Crow-foot button stitching",
  礼服打条: "Tuxedo front pleats",
  字体: "Monogram font",
  刺绣位置: "Monogram position",
  体态登记: "Posture",
  驼背: "Stooped posture",
  凸肚: "Prominent abdomen",
  挺胸: "Erect posture",
  左平溜肩: "Left shoulder slope",
  右平溜肩: "Right shoulder slope",
};

function titleCaseSlug(file: string): string {
  const name = decodeURIComponent(file.split("/").pop() ?? "")
    .replace(/\.(jpeg|jpg|png|gif)$/i, "")
    .replace(/-(\d+)(mm)$/i, " $1 $2")
    .replace(/-/g, " ");
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function englishOption(group: string | undefined, value: string): string {
  const key = group ? `${group}:${value}` : "";
  const file = shirtOptionImages[key] ?? suitOptionImages[key];
  return file?.startsWith("style-options/") ? titleCaseSlug(file) : value;
}

const localizedTailoringTerms: Record<string, Partial<Record<Locale, string>>> = {
  "不需要": { en: "Not required", de: "Nicht erforderlich", ja: "不要", fr: "Non requis", it: "Non richiesto", es: "No necesario", pt: "Não necessário", nl: "Niet nodig", pl: "Nie wymagane", sv: "Behövs inte", da: "Ikke nødvendigt", no: "Ikke nødvendig", cs: "Není požadováno" },
  "图片": { en: "Image", de: "Bild", ja: "画像", fr: "Image", it: "Immagine", es: "Imagen", pt: "Imagem", nl: "Afbeelding", pl: "Obraz", sv: "Bild", da: "Billede", no: "Bilde", cs: "Obrázek" },
  "刺绣文字": { en: "Monogram text", de: "Monogrammtext", ja: "刺繍文字", fr: "Texte du monogramme", it: "Testo del monogramma", es: "Texto del monograma", pt: "Texto do monograma", nl: "Monogramtekst", pl: "Tekst monogramu", sv: "Monogramtext", da: "Monogramtekst", no: "Monogramtekst", cs: "Text monogramu" },
};

const japaneseTailoringTerms: Record<string, string> = {
  "西装上衣": "ジャケット", "西裤": "トラウザーズ", "马甲": "ウェストコート", "衬衫": "シャツ",
  "正面款式": "フロントボタン", "胸兜款式": "胸ポケット", "下摆开角大小": "フロントカット",
  "肩膀样式": "ショルダー仕様", "口袋款式": "腰ポケット", "西服背面款式": "バックスタイル",
  "西服开衩选择": "ベント", "毛衬": "芯地仕様", "里布位置": "裏地仕様", "驳头款式": "ラペル",
  "驳头眼位": "ラペルホール", "袖叉款式": "袖ボタンホール",
  "单排两粒扣": "シングル2つボタン", "单排一粒扣": "シングル1つボタン", "单排三粒扣": "シングル3つボタン",
  "单排四粒扣": "シングル4つボタン", "双排四扣四": "ダブル4つボタン・4つ掛け",
  "双排四扣二": "ダブル4つボタン・2つ掛け", "双排六扣四": "ダブル6つボタン・4つ掛け",
  "双排六扣二": "ダブル6つボタン・2つ掛け",
  "直兜": "バルカポケット", "双牙兜": "両玉縁胸ポケット", "弧形兜": "カーブ胸ポケット",
  "自然肩": "ナチュラルショルダー", "法式翘肩": "ロープドショルダー",
  "平驳头": "ノッチドラペル", "青果领": "ショールカラー", "戗驳头": "ピークドラペル",
  "标准兜": "フラップポケット", "标准兜票据兜": "フラップ＋チェンジポケット", "明贴兜": "パッチポケット",
  "双牙兜票据兜": "両玉縁＋チェンジポケット", "双牙斜兜票据兜": "スラント両玉縁＋チェンジポケット",
  "斜兜": "スラントポケット", "斜兜票据兜": "スラント＋チェンジポケット",
  "标准下摆": "標準フロントカット", "大开角下摆": "ワイドオープンクォーター", "小开角下摆": "ナローオープンクォーター",
  "常规后背": "プレーンバック", "T型后背": "Tシェイプバック", "后腰带捏褶": "プリーツ付きバックベルト",
  "后腰固定腰带": "固定バックベルト", "双开衩": "サイドベンツ", "不开衩": "ノーベント", "单开衩": "センターベント",
  "粘合衬": "接着芯", "半麻衬": "ハーフキャンバス", "全麻衬": "フルキャンバス",
  "全里布": "総裏", "二分之一里布": "半裏", "三分之一里布": "三分裏", "四分之一里布": "四分裏",
  "假扣眼": "飾り切羽", "无扣眼": "ボタンホールなし", "真扣眼": "本切羽"
};

export function tailoringTerm(value: string, locale: Locale, group?: string): string {
  if (locale === "zh") return value;
  if (localizedTailoringTerms[value]?.[locale]) return localizedTailoringTerms[value]![locale]!;
  if (locale === "ja" && japaneseTailoringTerms[value]) return japaneseTailoringTerms[value];
  const english = englishTerms[value] ?? englishOption(group, value);
  if (locale === "en" || locale === "de" || locale === "ja") return english;
  return garments[value]?.[locale] ?? groups[value]?.[locale] ?? english;
}

const fabricEnglish: Record<string, string> = {
  浅米褐: "Light beige brown",
  暖沙棕: "Warm sand brown",
  中深巧克力棕: "Medium-dark chocolate brown",
  深咖啡棕: "Dark coffee brown",
  橄榄绿: "Olive green",
  极淡薄荷绿: "Very pale mint green",
  浅海沫绿: "Light seafoam green",
  中灰蓝青: "Medium grey teal",
  棕色: "Brown", 橙色: "Orange", 灰色: "Grey", 白色: "White", "米色/卡其": "Beige / Khaki",
  粉色: "Pink", 紫色: "Purple", 红色: "Red", 绿色: "Green", 蓝色: "Blue", 黑色: "Black",
  米色: "Beige", 貂棕: "Mink brown", 坚果棕: "Walnut brown", 驼色: "Camel",
  深棕: "Dark brown", 橄榄: "Olive", 银灰: "Silver grey", 中灰: "Mid grey",
  深灰: "Dark grey", 靛蓝: "Indigo", 藏青: "Navy", 深绿: "Dark green",
  森林绿: "Forest green", 勃艮第: "Burgundy", 苔藓绿: "Moss green",
  深驼色: "Dark camel", 深藏青: "Dark navy",
  人字纹: "Herringbone", 圆点: "Dotted", 条纹: "Stripe", 格纹: "Check", 素色: "Plain",
};

const fibreEnglish: Array<[string, string]> = [
  ["羔羊马海毛", "kid mohair"], ["马海毛", "mohair"], ["羊绒", "cashmere"], ["羊驼", "alpaca"],
  ["羊毛", "wool"], ["锦纶", "polyamide"], ["亚麻", "linen"], ["氨纶", "elastane"], ["棉", "cotton"], ["丝", "silk"],
];

const materialLocale: Record<string, Partial<Record<Locale, string>>> = {
  "纯羊毛": { en: "pure wool", de: "reine Wolle", ja: "ピュアウール", fr: "pure laine", it: "pura lana", es: "lana pura", pt: "lã pura", nl: "zuivere wol", pl: "czysta wełna", sv: "ren ull", da: "ren uld", no: "ren ull", cs: "čistá vlna" },
  "羊毛": { en: "wool", de: "Wolle", ja: "ウール", fr: "laine", it: "lana", es: "lana", pt: "lã", nl: "wol", pl: "wełna", sv: "ull", da: "uld", no: "ull", cs: "vlna" },
  "羊绒": { en: "cashmere", de: "Kaschmir", ja: "カシミヤ", fr: "cachemire", it: "cashmere", es: "cachemira", pt: "caxemira", nl: "kasjmier", pl: "kaszmir", sv: "kashmir", da: "cashmere", no: "kasjmir", cs: "kašmír" },
  "羊驼": { en: "alpaca", de: "Alpaka", ja: "アルパカ", fr: "alpaga", it: "alpaca", es: "alpaca", pt: "alpaca", nl: "alpaca", pl: "alpaka", sv: "alpacka", da: "alpaka", no: "alpakka", cs: "alpaka" },
  "真丝": { en: "silk", de: "Seide", ja: "シルク", fr: "soie", it: "seta", es: "seda", pt: "seda", nl: "zijde", pl: "jedwab", sv: "siden", da: "silke", no: "silke", cs: "hedvábí" },
  "棉": { en: "cotton", de: "Baumwolle", ja: "コットン", fr: "coton", it: "cotone", es: "algodón", pt: "algodão", nl: "katoen", pl: "bawełna", sv: "bomull", da: "bomuld", no: "bomull", cs: "bavlna" },
  "亚麻": { en: "linen", de: "Leinen", ja: "リネン", fr: "lin", it: "lino", es: "lino", pt: "linho", nl: "linnen", pl: "len", sv: "linne", da: "hør", no: "lin", cs: "len" },
  "混纺": { en: "blend", de: "Mischgewebe", ja: "混紡", fr: "mélange", it: "misto", es: "mezcla", pt: "mistura", nl: "mix", pl: "mieszanka", sv: "blandning", da: "blanding", no: "blanding", cs: "směs" },
  "四季": { en: "All season", de: "Ganzjährig", ja: "オールシーズン", fr: "Toutes saisons", it: "Quattro stagioni", es: "Todo el año", pt: "Todas as estações", nl: "Alle seizoenen", pl: "Całoroczny", sv: "Året runt", da: "Helårs", no: "Helårs", cs: "Celoroční" },
  "春夏": { en: "Spring / Summer", de: "Frühjahr / Sommer", ja: "春夏", fr: "Printemps / Été", it: "Primavera / Estate", es: "Primavera / Verano", pt: "Primavera / Verão", nl: "Lente / Zomer", pl: "Wiosna / Lato", sv: "Vår / Sommar", da: "Forår / Sommer", no: "Vår / Sommer", cs: "Jaro / Léto" },
  "秋冬": { en: "Autumn / Winter", de: "Herbst / Winter", ja: "秋冬", fr: "Automne / Hiver", it: "Autunno / Inverno", es: "Otoño / Invierno", pt: "Outono / Inverno", nl: "Herfst / Winter", pl: "Jesień / Zima", sv: "Höst / Vinter", da: "Efterår / Vinter", no: "Høst / Vinter", cs: "Podzim / Zima" },
  "冬季": { en: "Winter", de: "Winter", ja: "冬", fr: "Hiver", it: "Inverno", es: "Invierno", pt: "Inverno", nl: "Winter", pl: "Zima", sv: "Vinter", da: "Vinter", no: "Vinter", cs: "Zima" },
};

export function fabricTerm(value: string, locale: Locale): string {
  if (locale === "zh") return value;
  if (fabricEnglish[value]) return fabricEnglish[value];
  if (/[\u3400-\u9fff]/.test(value)) {
    let localized = value;
    Object.entries(materialLocale)
      .sort(([a], [b]) => b.length - a.length)
      .forEach(([source, labels]) => {
        localized = localized.replaceAll(source, labels[locale] ?? labels.en ?? source);
      });
    if (!/[\u3400-\u9fff]/.test(localized)) return localized;
  }
  const fibres = fibreEnglish.reduce((label, [source, target]) => label.replaceAll(source, target), value);
  return fibres
    .replaceAll("四季", "All season")
    .replaceAll("春夏", "Spring / Summer")
    .replaceAll("秋冬", "Autumn / Winter")
    .replaceAll("冬季", "Winter")
    .replaceAll("纯色", "Plain")
    .replaceAll("混纺", "Blend");
}

const localizedFabricColors: Record<string, Partial<Record<Locale, string>>> = {
  "黑色": { en: "Black", de: "Schwarz", ja: "ブラック", fr: "Noir", it: "Nero", es: "Negro", pt: "Preto", nl: "Zwart", pl: "Czarny", sv: "Svart", da: "Sort", no: "Svart", cs: "Černá" },
  "灰色": { en: "Grey", de: "Grau", ja: "グレー", fr: "Gris", it: "Grigio", es: "Gris", pt: "Cinzento", nl: "Grijs", pl: "Szary", sv: "Grå", da: "Grå", no: "Grå", cs: "Šedá" },
  "蓝色": { en: "Blue", de: "Blau", ja: "ブルー", fr: "Bleu", it: "Blu", es: "Azul", pt: "Azul", nl: "Blauw", pl: "Niebieski", sv: "Blå", da: "Blå", no: "Blå", cs: "Modrá" },
  "棕色": { en: "Brown", de: "Braun", ja: "ブラウン", fr: "Brun", it: "Marrone", es: "Marrón", pt: "Castanho", nl: "Bruin", pl: "Brązowy", sv: "Brun", da: "Brun", no: "Brun", cs: "Hnědá" },
  "米色/卡其": { en: "Beige / khaki", de: "Beige / Khaki", ja: "ベージュ／カーキ", fr: "Beige / kaki", it: "Beige / kaki", es: "Beige / caqui", pt: "Bege / caqui", nl: "Beige / kaki", pl: "Beżowy / khaki", sv: "Beige / khaki", da: "Beige / khaki", no: "Beige / khaki", cs: "Béžová / khaki" },
  "绿色": { en: "Green", de: "Grün", ja: "グリーン", fr: "Vert", it: "Verde", es: "Verde", pt: "Verde", nl: "Groen", pl: "Zielony", sv: "Grön", da: "Grøn", no: "Grønn", cs: "Zelená" },
  "红色": { en: "Red", de: "Rot", ja: "レッド", fr: "Rouge", it: "Rosso", es: "Rojo", pt: "Vermelho", nl: "Rood", pl: "Czerwony", sv: "Röd", da: "Rød", no: "Rød", cs: "Červená" },
  "粉色": { en: "Pink", de: "Rosa", ja: "ピンク", fr: "Rose", it: "Rosa", es: "Rosa", pt: "Rosa", nl: "Roze", pl: "Różowy", sv: "Rosa", da: "Rosa", no: "Rosa", cs: "Růžová" },
  "紫色": { en: "Purple", de: "Violett", ja: "パープル", fr: "Violet", it: "Viola", es: "Violeta", pt: "Roxo", nl: "Paars", pl: "Fioletowy", sv: "Lila", da: "Lilla", no: "Lilla", cs: "Fialová" },
  "白色": { en: "White", de: "Weiß", ja: "ホワイト", fr: "Blanc", it: "Bianco", es: "Blanco", pt: "Branco", nl: "Wit", pl: "Biały", sv: "Vit", da: "Hvid", no: "Hvit", cs: "Bílá" },
  "橙色": { en: "Orange", de: "Orange", ja: "オレンジ", fr: "Orange", it: "Arancione", es: "Naranja", pt: "Laranja", nl: "Oranje", pl: "Pomarańczowy", sv: "Orange", da: "Orange", no: "Oransje", cs: "Oranžová" },
};

const localizedPatterns: Record<string, Partial<Record<Locale, string>>> = {
  houndstooth: { en: "houndstooth", de: "Hahnentritt", ja: "ハウンドトゥース", fr: "pied-de-poule", it: "pied-de-poule", es: "pata de gallo", pt: "pied-de-poule", nl: "pied-de-poule", pl: "pepitka", sv: "hundtand", da: "hanefjed", no: "pepita", cs: "kohoutí stopa" },
  windowpane: { en: "windowpane check", de: "Fensterkaro", ja: "ウィンドウペーン", fr: "carreaux fenêtre", it: "quadro finestra", es: "cuadro ventana", pt: "xadrez janela", nl: "windowpane-ruit", pl: "krata windowpane", sv: "windowpane-ruta", da: "windowpane-tern", no: "windowpane-rute", cs: "okenní káro" },
  glen: { en: "Glen check", de: "Glencheck", ja: "グレンチェック", fr: "Prince-de-Galles", it: "Principe di Galles", es: "Príncipe de Gales", pt: "Príncipe de Gales", nl: "Glencheck", pl: "krata księcia Walii", sv: "Glencheck", da: "Glencheck", no: "Glencheck", cs: "Glenček" },
  herringbone: { en: "herringbone", de: "Fischgrat", ja: "ヘリンボーン", fr: "chevrons", it: "spina di pesce", es: "espiga", pt: "espinha de peixe", nl: "visgraat", pl: "jodełka", sv: "fiskben", da: "sildeben", no: "fiskebein", cs: "rybí kost" },
  stripe: { en: "stripe", de: "Streifen", ja: "ストライプ", fr: "rayure", it: "riga", es: "raya", pt: "risca", nl: "streep", pl: "pasek", sv: "rand", da: "stribe", no: "stripe", cs: "proužek" },
  check: { en: "check", de: "Karo", ja: "チェック", fr: "carreaux", it: "quadro", es: "cuadro", pt: "xadrez", nl: "ruit", pl: "krata", sv: "ruta", da: "tern", no: "rute", cs: "káro" },
  plain: { en: "plain", de: "Uni", ja: "無地", fr: "uni", it: "tinta unita", es: "liso", pt: "liso", nl: "effen", pl: "gładki", sv: "enfärgad", da: "ensfarvet", no: "ensfarget", cs: "jednobarevná" },
};

export function fabricDisplayName(value: string, locale: Locale, fallbackColor = ""): string {
  if (locale === "zh") return value;
  const direct = fabricTerm(value, locale);
  if (locale === "en" && !/[\u3400-\u9fff]/.test(direct)) return direct;
  const colors = fallbackColor.split(/[+＋/]/).map((part) => part.trim()).filter(Boolean);
  const colorLabel = colors.map((color) => localizedFabricColors[color]?.[locale] ?? localizedFabricColors[color]?.en).filter(Boolean).join(" / ");
  const patternKey = value.includes("千鸟") ? "houndstooth" : value.includes("窗格") ? "windowpane" : value.includes("格伦") || value.includes("威尔士") ? "glen" : value.includes("人字") ? "herringbone" : value.includes("条") ? "stripe" : value.includes("格") ? "check" : "plain";
  const pattern = localizedPatterns[patternKey]?.[locale] ?? localizedPatterns[patternKey]?.en ?? "";
  return [colorLabel || localizedFabricColors["灰色"]?.[locale], pattern].filter(Boolean).join(" · ");
}
