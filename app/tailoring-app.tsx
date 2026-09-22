"use client";
import { useEffect, useRef, useState } from "react";
import { shirtOptionImageUrl } from "./shirt-option-images";
import { suitOptionImageUrl } from "./suit-option-images";
import { localizeStoreName, useLocale } from "./lib/i18n";
import { useCurrency } from "./lib/currency";
import { fabricDisplayName, fabricSpecification, fabricTerm, tailoringTerm } from "./lib/tailoring-terms";
import { LanguageSwitcher } from "./_components/LanguageSwitcher";
import { BrandLogo } from "./_components/BrandLogo";
import { apiFetch, clearAuth } from "./lib/api";
import { useAuthGuard } from "./lib/useAuthGuard";
import {
  STYLBIELLA_FABRICS,
  STYLBIELLA_BOOK_META,
  STYLBIELLA_SHIRT_FABRICS,
} from "./lib/stylbiella-fabrics";
import { STYLBIELLA_FABRIC_COLORS } from "./lib/stylbiella-fabric-colors";
import { Country, State } from "country-state-city";

const garments = {
  jacket: {
    name: "西装上衣",
    en: "Jacket",
    fields: [
      "前衣长",
      "后中长",
      "左袖长",
      "右袖长",
      "肩宽",
      "胸围",
      "中腰",
      "肚围",
      "下摆",
      "袖肥",
      "袖肘",
      "袖口",
      "领窝",
    ],
    values: [
      [74, 75],
      [71, 72],
      [61, 62],
      [61, 62],
      [45, 45.5],
      [98, 106],
      [88, 96],
      [90, 98],
      [100, 108],
      [34, 36],
      [29, 31],
      [14, 15],
      [42, 43],
    ],
  },
  trousers: {
    name: "西裤",
    en: "Trousers",
    fields: ["腰围", "臀围", "大腿围", "膝围", "小腿围", "裤口", "立裆", "全裆", "裤长 左", "裤长 右"],
    values: [
      [86, 88],
      [98, 102],
      [56, 58],
      [42, 44],
      [38, 40],
      [36, 37],
      [27, 29],
      [74, 76],
      [101, 102],
      [101, 102],
    ],
  },
  waistcoat: {
    name: "马甲",
    en: "Waistcoat",
    fields: ["前衣长", "后衣长", "胸围", "腰围", "下摆", "肩宽", "领窝"],
    values: [
      [61, 62],
      [55, 56],
      [98, 102],
      [90, 94],
      [96, 100],
      [36, 37],
      [40, 41],
    ],
  },
  shirt: {
    name: "衬衫",
    en: "Shirt",
    fields: [
      "领围",
      "肩宽",
      "胸围",
      "肚围",
      "摆围",
      "袖肥",
      "腕围",
      "长袖长",
      "前衣长",
      "后衣长",
    ],
    values: [
      [39, 40],
      [45, 46],
      [98, 110],
      [90, 102],
      [100, 110],
      [34, 37],
      [18, 20],
      [61, 62],
      [74, 75],
      [76, 77],
    ],
  },
};

const FABRIC_BOOK_DETAILS: Record<string, {
  pages: number;
  title: string;
  summary: string;
  positioning: string;
  products: string;
  season: string;
  weight: string;
}> = {
  "6401": { pages: 37, title: "SKYLINE", summary: "Super 110's 羊毛 · 270g · 四季", positioning: "经典西装系列，色彩覆盖全面，兼顾商务、通勤与正式场合；面料手感柔软、结构平衡，适合制作成套西装。", products: "西装、西装上衣、西裤、马甲", season: "四季", weight: "270g" },
  "6402": { pages: 23, title: "JACKETING", summary: "混纺面料 · 260-480g", positioning: "专为单西与休闲西装设计的花型系列，强调纹理、层次和搭配表现，适合希望突出个性与面料质感的客户。", products: "西装上衣、休闲单西", season: "多季节", weight: "260-480g" },
  "6403": { pages: 23, title: "OVERCOAT", summary: "羊毛、羊绒、羊驼 · 440-720g", positioning: "秋冬大衣系列，以羊毛、羊绒及羊驼等保暖纤维为主，强调丰厚手感、保暖性和高级垂坠感。", products: "大衣、外套", season: "秋冬", weight: "440-720g" },
  "6410": { pages: 12, title: "SKYLINE", summary: "Super 110's 纯羊毛 · 270g · 150cm · 四季", positioning: "色彩丰富的纯色西装系列，从柔和浅色、清新亮色到优雅混色均有覆盖。2×2 斜纹结构带来柔软、紧实且平衡的穿着表现。", products: "西装、西装上衣、西裤、马甲", season: "四季", weight: "270g" },
  "6411": { pages: 10, title: "KNIGHT", summary: "纯羊毛 · 360g", positioning: "偏厚实且具有稳定结构感的纯羊毛系列，适合强调挺括轮廓、耐穿性与秋冬商务风格的成衣。", products: "西装、西装上衣、西裤", season: "秋冬", weight: "360g" },
  "6412": { pages: 7, title: "HIGHLAND", summary: "Super 150's 羊毛与羊绒 · 300g", positioning: "高支羊毛与羊绒结合的高端系列，突出细腻触感、柔软度和精致光泽，适合高级定制及重要正式场合。", products: "高级西装、西装上衣", season: "秋冬及过渡季", weight: "300g" },
  "6413": { pages: 12, title: "ESSENTIAL", summary: "Super 110's 羊毛 · 270g", positioning: "面向日常商务衣橱的基础核心系列，颜色实用、适配面广，在舒适度、耐用度与正式感之间保持平衡。", products: "西装、西装上衣、西裤、马甲", season: "四季", weight: "270g" },
  "6414": { pages: 6, title: "JOURNEY", summary: "羊毛真丝 / Super 120's · 320/280g", positioning: "兼顾旅行与商务穿着的系列，强调回弹、舒适和易打理，并通过羊毛真丝或高支羊毛呈现精致质感。", products: "旅行西装、西装上衣、西裤", season: "多季节", weight: "320g / 280g" },
  "6415": { pages: 6, title: "MARBLE FLANNEL", summary: "羊毛、棉与羊绒 · 310g", positioning: "带有柔和绒面与混色层次的法兰绒系列，风格温暖自然，适合秋冬商务休闲和质感型定制。", products: "西装、西装上衣、西裤", season: "秋冬", weight: "310g" },
  "6416": { pages: 5, title: "OVERCOATS", summary: "纯羊绒 · 500g", positioning: "纯羊绒高端大衣系列，强调轻柔触感、保暖性和奢华外观，定位于高级冬季外套与精品定制。", products: "大衣、高级外套", season: "冬季", weight: "500g" },
};
const FABRIC_BOOK_DETAILS_EN: Record<string, Pick<(typeof FABRIC_BOOK_DETAILS)[string], "summary" | "positioning" | "products" | "season">> = {
  "6401": { summary: "Super 110's wool · 270g · All season", positioning: "A versatile suiting collection with a broad colour range, from business essentials to formal occasions. Its balanced structure and refined handle make it suitable for year-round tailoring.", products: "Suits, jackets, trousers and waistcoats", season: "All season" },
  "6402": { summary: "Wool blends · 260–480g", positioning: "A jacketing collection designed for separates, combining distinctive texture with an easy drape for clients seeking character and comfort.", products: "Jackets and casual tailoring", season: "Multi-season" },
  "6403": { summary: "Wool, cashmere and alpaca · 440–720g", positioning: "An autumn/winter overcoating collection focused on warmth, tactile depth and an elegant drape, using premium insulating fibres.", products: "Overcoats and outerwear", season: "Autumn / Winter" },
  "6410": { summary: "Super 110's pure wool · 270g · 150cm · All season", positioning: "A richly coloured plain suiting collection spanning soft neutrals, fresh brights and elegant deep tones. The 2×2 twill construction provides a supple, compact and well-balanced handle.", products: "Suits, jackets, trousers and waistcoats", season: "All season" },
  "6411": { summary: "Pure wool · 360g", positioning: "A substantial pure-wool collection with a stable structure, ideal for tailored garments requiring body, resilience and cold-season comfort.", products: "Suits, jackets and trousers", season: "Autumn / Winter" },
  "6412": { summary: "Super 150's wool and cashmere · 300g", positioning: "A premium fine-wool and cashmere collection distinguished by its soft hand, quiet sheen and refined appearance for luxury tailoring and formal wear.", products: "Luxury suits and formal tailoring", season: "Autumn / Winter / Transitional" },
  "6413": { summary: "Super 110's wool · 270g", positioning: "An essential business and everyday tailoring collection balancing practical colours, comfort, durability and a polished formal appearance.", products: "Suits, jackets, trousers and waistcoats", season: "All season" },
  "6414": { summary: "Wool and silk / Super 120's · 320/280g", positioning: "A travel-oriented collection that combines comfort, crease recovery and elegance through wool-silk and fine-wool constructions.", products: "Travel suits, jackets and trousers", season: "Multi-season" },
  "6415": { summary: "Wool, cotton and cashmere · 310g", positioning: "A flannel collection with soft marbled colour effects and a warm, natural handle for autumn/winter business, casual and bespoke garments.", products: "Suits, jackets and trousers", season: "Autumn / Winter" },
  "6416": { summary: "Pure cashmere · 500g", positioning: "A premium pure-cashmere overcoating collection offering exceptional softness, warmth and a luxurious appearance for high-end outerwear.", products: "Overcoats and luxury outerwear", season: "Winter" },
};
const emptyMeasurements = () => {
  const empty: Record<string, [string, string]> = {};
  (Object.keys(garments) as GarmentKey[]).forEach((key) =>
    garments[key].fields.forEach((field) => {
      empty[`${key}:${field}`] = ["", ""];
    }),
  );
  return empty;
};
const optionsByGarment = {
  jacket: [
    {
      title: "正面款式",
      items: [
        "单排两粒扣",
        "单排一粒扣",
        "单排三粒扣",
        "单排四粒扣",
        "双排四扣四",
        "双排四扣二",
        "双排六扣四",
        "双排六扣二",
      ],
    },
    { title: "胸兜款式", items: ["直兜", "双牙兜", "弧形兜"] },
    { title: "下摆开角大小", items: ["标准下摆", "大开角下摆", "小开角下摆"] },
    { title: "肩膀样式", items: ["自然肩", "法式翘肩"] },
    {
      title: "口袋款式",
      items: [
        "标准兜",
        "标准兜票据兜",
        "明贴兜",
        "双牙兜",
        "双牙兜票据兜",
        "双牙斜兜票据兜",
        "斜兜",
        "斜兜票据兜",
      ],
    },
    {
      title: "西服背面款式",
      items: ["常规后背", "T型后背", "后腰带捏褶", "后腰固定腰带"],
    },
    { title: "西服开衩选择", items: ["双开衩", "不开衩", "单开衩"] },
    { title: "毛衬", items: ["粘合衬", "半麻衬", "全麻衬"] },
    {
      title: "里布位置",
      items: ["全里布", "二分之一里布", "三分之一里布", "四分之一里布"],
    },
    { title: "驳头款式", items: ["平驳头", "青果领", "戗驳头"] },
    { title: "袖叉款式", items: ["假扣眼", "无扣眼", "真扣眼"] },
    { title: "纽扣钉法", items: ["平钉", "叠钉"] },
    { title: "纽扣选择", items: ["牛角扣", "金属扣", "果实扣", "木质扣", "尿素扣", "熟料扣", "树脂扣", "贝壳扣"] },
    { title: "纽扣数量", items: ["3", "4", "5", "6"] },
    { title: "扣眼方向", items: ["直扣眼", "斜扣眼"] },
    { title: "穿着习惯", items: ["紧身", "很修身", "修身", "合体偏瘦", "合体", "合体偏松", "宽松", "很宽松", "非常宽松"] },
    { title: "色丁位置", items: ["无", "过面", "过面+腰兜牙", "过面+胸兜+腰兜牙", "领面", "领面+腰兜牙", "领面+胸兜+腰兜牙", "可脱卸假驳头", "可脱卸假青果领", "过面+领面", "过面+领面+腰兜牙", "过面+领面+胸兜", "过面+领面+胸兜+腰兜牙"] },
    { title: "驳头宽", items: ["5.5cm", "6cm", "6.5cm", "7cm", "7.5cm", "8cm", "8.5cm", "9cm", "9.5cm", "10cm", "10.5cm", "11cm", "11.5cm", "12cm", "12.5cm", "13cm", "13.5cm", "14cm", "14.5cm", "15cm"] },
    { title: "里兜左", items: ["里大兜+笔兜+烟兜", "里大兜+烟兜", "里大兜+钻石兜+烟兜", "里大兜+票兜+笔兜+烟兜", "里大兜+票兜+烟兜", "里大兜+票兜+钻石兜+烟兜"] },
    { title: "里兜右", items: ["里大兜", "无"] },
    { title: "过面", items: ["A宝剑头过面", "B圆过面", "C弯过面", "D直过面", "E拼接耳皮"] },
    { title: "外珠边", items: ["0.15cm", "0.25cm", "0.6cm", "0.8cm"] },
    { title: "香水垫", items: ["半圆", "三角", "无"] },
  ],
  trousers: [
    {
      title: "扣型",
      items: [
        "圆腰头",
        "双扣意式腰头",
        "好莱坞腰头",
        "宝剑头",
        "平腰头",
        "廓尔格腰头",
      ],
    },
    { title: "褶皱", items: ["无褶皱", "单褶皱", "双褶皱"] },
    {
      title: "裤脚",
      items: ["裤脚口内折边", "裤脚口外翻翘", "靴裤脚口"],
    },
    { title: "裤型", items: ["喇叭裤型", "锥状裤型", "标准裤型", "直筒裤型"] },
    { title: "裤脚口", items: ["裤脚口打开", "裤脚口三角开口"] },
    { title: "侧兜", items: ["斜侧兜", "直侧兜"] },
    { title: "前表兜", items: ["无", "有", "有兜盖"] },
    { title: "后斗锁眼", items: ["无", "左右锁眼", "左锁眼", "右锁眼"] },
    { title: "兜中兜", items: ["无", "有"] },
    { title: "后兜", items: ["双牙", "单牙1.0", "单牙1.2", "单牙1.5"] },
  ],
  waistcoat: [
    {
      title: "马甲款式",
      items: [
        "标准五粒扣",
        "圆形三粒扣",
        "双排六扣三",
        "青果领三粒扣",
        "平驳头五粒扣",
        "平驳头六扣三",
        "戗驳头五粒扣",
        "戗驳头六扣三",
      ],
    },
    { title: "马甲口袋数量", items: ["无胸兜", "单胸兜", "双胸兜"] },
    { title: "马甲口袋款式", items: ["标准兜", "带兜盖", "双牙兜"] },
    { title: "马甲下摆", items: ["平摆", "尖摆"] },
    { title: "后领条", items: ["有", "无"] },
    { title: "后背面", items: ["面料", "里料"] },
    { title: "侧开叉", items: ["无", "有"] },
    { title: "外珠边", items: ["0.15", "0.25", "0.6", "0.8"] },
  ],
  shirt: [
    {
      title: "领型",
      items: [
        "标准领",
        "小八领(5.7)",
        "中八领(7.1)",
        "大八领(8.0)",
        "法式温莎领(8.0)",
        "意式温莎领(8.2)",
        "雅致一字领(8.5×3.5)",
        "伊顿领(6.0)",
        "大尖领(8.0)",
        "意式长尖领(10)",
        "古巴领",
        "意式一片领(9.5)",
        "针孔领(11.5)",
        "燕子领(5.9)",
        "立领圆角带扣(3.4)",
      ],
    },
    {
      title: "领插片",
      items: ["无插片", "固定内插片", "活动外插片", "领尖外扣", "领尖底扣"],
    },
    { title: "领硬度", items: ["硬手感", "中手感", "软手感"] },
    { title: "袖口折", items: ["单折", "双折", "意式三折", "意式碎折"] },
    { title: "口袋", items: ["无口袋", "圆口袋", "六角袋", "三角袋"] },
    {
      title: "袖口",
      items: [
        "圆角单扣",
        "直角单扣",
        "斜角单扣",
        "圆角双扣",
        "直角双扣",
        "斜角双扣",
        "圆角三扣",
        "直角三扣",
        "斜角三扣",
        "方角月牙袖口",
        "大圆角",
        "直角法式袖",
        "圆角法式袖口",
        "斜角法袖",
        "单层圆角法式",
        "意式法式袖3#",
        "意式法式袖2#",
      ],
    },
    {
      title: "前幅门襟",
      items: ["明门襟默认3.0", "明门襟2.5", "翻门襟", "暗门襟"],
    },
    { title: "下摆", items: ["圆摆", "圆摆贴三角", "圆摆宝剑头贴", "平摆"] },
    { title: "后担干", items: ["正常担干", "担干八字拼接"] },
    {
      title: "后幅",
      items: [
        "无折无省",
        "打双折",
        "后腰收腰省",
        "工字折",
        "意式后片碎折",
        "后反字折",
        "后工字折到底",
      ],
    },
    { title: "侧缝工艺", items: ["手工包缝"] },
    { title: "袖山意式碎折", items: ["袖山意式碎折"] },
    { title: "错位上袖", items: ["需要"] },
    { title: "鸡爪扣钉", items: ["需要"] },
    { title: "礼服打条", items: ["礼服打条"] },
    { title: "字体", items: ["509", "511", "512", "不需要", "图片"] },
    {
      title: "文字位置",
      items: [
        "左领尖",
        "左前胸",
        "口袋",
        "领下底门襟",
        "后领中",
        "左袖口左",
        "左袖口中",
      ],
    },
  ],
};
const OPTIONAL_SHIRT_GROUPS = new Set([
  "侧缝工艺",
  "袖山意式碎折",
  "错位上袖",
  "鸡爪扣钉",
  "礼服打条",
]);
const POSTURE_GROUPS = [
  { title: "驼背", options: ["正常背", "背长加长 1cm", "背长加长 1.5cm", "背长加长 2cm", "背长加长 2.5cm"] },
  { title: "凸肚", options: ["正常肚", "前肚围加大 1cm", "前肚围加大 2cm", "前肚围加大 3cm", "前肚围加大 4cm"] },
  { title: "挺胸", options: ["正常胸", "前腰节长加 1cm", "前腰节长加 1.5cm", "前腰节长加 2cm", "前腰节长加 2.5cm"] },
  { title: "左平溜肩", options: ["平肩上提 2cm", "平肩上提 1.5cm", "平肩上提 1cm", "平肩上提 0.5cm", "正常肩", "微溜肩下调 0.5cm", "中溜肩下调 0.8cm", "重溜肩下调 1.2cm"] },
  { title: "右平溜肩", options: ["平肩上提 2cm", "平肩上提 1.5cm", "平肩上提 1cm", "平肩上提 0.5cm", "正常肩", "微溜肩下调 0.5cm", "中溜肩下调 0.8cm", "重溜肩下调 1.2cm"] },
] as const;
type GarmentKey = keyof typeof garments;
type CustomerLookup = {
  id: number;
  name: string;
  height: string;
  weight: string;
  channelCode: string;
  avatarUrl: string | null;
  measurements: string | null;
};
type PiItem = {
  key: string;
  kind: "product" | "fabric";
  garmentType?: GarmentKey;
  garmentName?: string;
  fabricCode?: string;
  fabricName?: string;
  fabricMill?: string;
  meters?: number;
  basePrice: number;
  fabricPrice: number;
  optionExtra: number;
  shippingFee: number;
  productPrice: number;
  weightKg: number;
  options: Array<{ group: string; item: string; price: number }>;
  measurements: Array<{ field: string; net: string; finished: string }>;
};

/**
 * Keep PI data in sync with the option catalogue. This also cleans stale PI
 * rows created before an option group or an individual choice was removed.
 */
function validPiOptions(item: Pick<PiItem, "garmentType" | "options">) {
  if (!item.garmentType) return [];
  const groups = optionsByGarment[item.garmentType] as Array<{
    title: string;
    items: string[];
  }>;
  return item.options.filter((option) => {
    // Customer-entered embroidery information is valid for every garment.
    // It does not live in the fixed option catalogue, so keep it explicitly.
    if (option.group === "刺绣文字" || option.group === "刺绣颜色") return true;
    if (option.group === "备注") return true;
    const group = groups.find((candidate) => candidate.title === option.group);
    return Boolean(group?.items.includes(option.item));
  });
}

function normalizePiItem(item: PiItem): PiItem {
  if (item.kind === "fabric") return { ...item, options: [], optionExtra: 0 };
  const options = validPiOptions(item);
  const optionExtra = options.reduce((sum, option) => sum + option.price, 0);
  return {
    ...item,
    options,
    optionExtra,
    productPrice: item.basePrice + item.fabricPrice + optionExtra,
  };
}

function spreadsheetEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
const basePrices: Record<GarmentKey, number> = {
  jacket: 450,
  trousers: 200,
  waistcoat: 200,
  shirt: 100,
};
const WAISTCOAT_EXTRA_LENGTH_STYLES = new Set([
  "青果领三粒扣",
  "平驳头五粒扣",
  "平驳头六扣三",
  "戗驳头五粒扣",
  "戗驳头六扣三",
]);
const JACKET_DROPDOWN_GROUPS = new Set([
  "纽扣选择",
  "纽扣数量",
  "穿着习惯",
  "色丁位置",
  "驳头宽",
  "里兜左",
  "里兜右",
  "过面",
  "外珠边",
  "香水垫",
]);
const WAISTCOAT_DROPDOWN_GROUPS = new Set(["后领条", "后背面", "侧开叉", "外珠边"]);
const TROUSER_DROPDOWN_GROUPS = new Set(["侧兜", "前表兜", "后斗锁眼", "兜中兜", "后兜"]);
const fabricPrices: Record<string, number> = {
  "VBC-110-NV": 680,
  "TR-120-CH": 420,
  "TR-121-NV": 460,
  "TR-122-MG": 500,
  "TR-123-BE": 380,
  "TR-124-BR": 560,
  "WC-MATCH-01": 0,
  "WC-CT-IVO": 480,
  "WC-GLD-JQ": 680,
  "WC-BRG-JQ": 620,
  "WC-GRY-CK": 520,
  "SH-100-WH": 180,
  "SH-102-ST": 260,
  "SH-103-CK": 120,
  "SH-104-IV": 240,
  "SH-105-PK": 150,
};
const STYLBIELLA_PRICE_RANGES: Array<[number, number, number]> = [
  [34421, 34558, 375], [71671, 71672, 220], [71673, 71677, 240],
  [71678, 71680, 260], [71681, 71681, 280], [71682, 71685, 300],
  [33731, 33736, 645], [33737, 33737, 545], [33738, 33738, 450],
  [33739, 33759, 645], [63461, 63462, 285], [63463, 63468, 295],
  [63469, 63469, 345], [63470, 63472, 375],
  [60531, 60532, 950], [60533, 60535, 850], [60536, 60536, 1390],
  [60537, 60537, 950], [60538, 60539, 850], [60540, 60540, 1390],
  [60541, 60541, 950], [60542, 60542, 850], [60543, 60543, 1390],
  [60544, 60544, 750], [60545, 60545, 850], [60546, 60546, 750],
  [60547, 60550, 950], [60551, 60551, 850], [60552, 60552, 680],
  [60553, 60554, 1390], [60555, 60556, 850], [60557, 60559, 750],
  [60560, 60560, 850], [60561, 60562, 750], [60563, 60563, 850],
  [60564, 60568, 750], [34561, 34658, 375], [34701, 34719, 455],
  [34720, 34723, 430], [34724, 34754, 455], [34755, 34771, 430],
  [34881, 34929, 695], [34781, 34835, 395], [34836, 34844, 375],
  [34845, 34854, 395], [34855, 34872, 375], [34661, 34676, 645],
  [34677, 34692, 595], [34381, 34412, 595], [60571, 60594, 1480],
];
const getStylbiellaPrice = (code?: string) => {
  const numericCode = Number(code);
  if (!Number.isFinite(numericCode)) return undefined;
  return STYLBIELLA_PRICE_RANGES.find(
    ([start, end]) => numericCode >= start && numericCode <= end,
  )?.[2];
};
const getFabricPrice = (code?: string) =>
  code
    ? (getStylbiellaPrice(code) ??
      STYLBIELLA_FABRICS.find((f) => f.code === code)?.price ??
      fabricPrices[code] ??
      320)
    : 0;
const FABRIC_WIDTH_METERS = 1.5;

const conservativeFabricGsm = (fabric?: {
  weight?: string;
  meta?: string;
  book?: string;
}) => {
  const bookWeight = fabric?.book
    ? FABRIC_BOOK_DETAILS[fabric.book]?.weight
    : undefined;
  const values = `${fabric?.weight ?? ""} ${bookWeight ?? ""} ${fabric?.meta ?? ""}`
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number)
    .filter((value) => value >= 100 && value <= 1000);
  // A range or multi-weight bunch uses its heaviest stated cloth so freight is
  // not underestimated. Legacy fabrics without weight metadata use 270 g/m².
  return values?.length ? Math.max(...values) : 270;
};

const conservativeGarmentWeight = (
  garment: GarmentKey,
  meters: number | null,
  gsm: number,
  canvas?: string,
) => {
  if (meters === null) return 0;
  if (garment === "shirt") return 0.5;

  const shellKg = (meters * FABRIC_WIDTH_METERS * gsm) / 1000;
  const garmentKg =
    garment === "jacket"
      ? shellKg * 0.82 +
        (canvas === "全麻衬" ? 0.48 : canvas === "半麻衬" ? 0.38 : 0.3)
      : shellKg * 0.85 + 0.14;

  // Conservative single-item packing: 0.35 kg outer packaging + 0.08 kg/item.
  return Math.ceil((garmentKg + 0.43) / 0.5) * 0.5;
};
const shippingRates: Record<
  string,
  { label: string; base: number; half: number }
> = {
  GB: { label: "英国", base: 160, half: 35 },
  US: { label: "美国", base: 185, half: 42 },
  CA: { label: "加拿大", base: 190, half: 44 },
  AU: { label: "澳大利亚", base: 195, half: 46 },
  OTHER: { label: "其他国家/地区", base: 230, half: 55 },
};
const EUROPE_SHIPPING_FIRST_KG: Record<string, number> = {
  DE: 128,
  BE: 148, LU: 148, NL: 148, AT: 148,
  PL: 178, CZ: 178, SK: 178, SI: 178,
  FI: 183, SE: 183, HU: 183, PT: 183, IT: 183, ES: 183, FR: 183, DK: 183,
  BG: 198, EE: 198, RO: 198, LT: 198, GR: 198, IE: 198, HR: 198, LV: 198,
};

const US_SHIPPING_TABLE: Record<number, number> = {
  2: 241, 2.5: 262, 3: 285, 3.5: 306, 4: 327, 4.5: 349,
  5: 371, 5.5: 393, 6: 414, 6.5: 436, 7: 478, 7.5: 499,
  8: 521, 8.5: 542, 9: 565, 9.5: 586, 10: 608, 10.5: 629,
  11: 651, 11.5: 673,
};

export function shippingQuote(country: string, weightKg: number) {
  if (!country || weightKg <= 0) return { fee: 0, label: "" };
  if (country === "US") {
    const charged = Math.max(2, Math.ceil(weightKg * 2) / 2);
    const listed = US_SHIPPING_TABLE[charged];
    const base = listed ?? 673 + Math.ceil((charged - 11.5) / 0.5) * 22;
    return { fee: base + 30, label: "美国空派包税专线" };
  }
  if (country === "GB") {
    const charged = Math.ceil(weightKg * 10) / 10;
    const perKg = charged <= 2.5 ? 55 : 58;
    return { fee: Math.ceil(charged * perKg + 16), label: "英国 DLX1 小包" };
  }
  const europeanFirstKg = EUROPE_SHIPPING_FIRST_KG[country];
  if (europeanFirstKg) {
    const charged = Math.max(1, Math.ceil(weightKg));
    return {
      fee: europeanFirstKg + Math.max(0, charged - 1) * 39,
      label: "欧洲普货空派包税快线",
    };
  }
  const fallback = shippingRates[country] || shippingRates.OTHER;
  return {
    fee: fallback.base + Math.max(0, Math.round((weightKg - 0.5) / 0.5)) * fallback.half,
    label: fallback.label,
  };
}

function piOptionLabel(group: string, loc: string) {
  if (group === "备注") return loc === "zh" ? "备注" : "Notes";
  if (group === "刺绣文字") return loc === "zh" ? "刺绣文字" : "Embroidery text";
  if (group === "刺绣颜色") return loc === "zh" ? "刺绣颜色" : "Embroidery colour";
  return tailoringTerm(group, loc);
}

function piOptionValue(
  option: { group: string; item: string; price: number },
  loc: string,
) {
  return option.group === "备注" ||
    option.group === "刺绣文字" ||
    option.group === "刺绣颜色"
    ? option.item
    : tailoringTerm(option.item, loc, option.group);
}

function shippingFormula(country: string, weightKg: number, loc: string) {
  const grams = Math.ceil(weightKg * 1000);
  if (country === "US") return loc === "zh" ? "计费重：最低 2000g，之后每 500g 向上取整；美国专线价表 + ¥30" : "Chargeable weight: 2,000g minimum, then rounded up per 500g; US rate table + ¥30";
  if (country === "GB") {
    const rate = weightKg <= 2.5 ? 55 : 58;
    const charged = Math.ceil(weightKg * 10) / 10 * 1000;
    return loc === "zh" ? `计费重：${charged}g（100g 向上取整）；¥${rate}/kg × 计费重 + ¥16` : `Chargeable: ${charged}g (100g rounding); ¥${rate}/kg × chargeable weight + ¥16`;
  }
  if (EUROPE_SHIPPING_FIRST_KG[country]) return loc === "zh" ? `计费重：最低 1000g，按整公斤向上取整；首重 ¥${EUROPE_SHIPPING_FIRST_KG[country]} + 续重 ¥39/kg` : `Chargeable: 1,000g minimum, rounded up to full kg; ¥${EUROPE_SHIPPING_FIRST_KG[country]} first kg + ¥39/kg`;
  const rate = shippingRates[country] || shippingRates.OTHER;
  return loc === "zh" ? `计费重：${grams}g；首重 500g ¥${rate.base}，续重每 500g ¥${rate.half}` : `Chargeable: ${grams}g; first 500g ¥${rate.base}, then ¥${rate.half} per 500g`;
}

function localizedShippingFormula(
  country: string,
  weightKg: number,
  loc: string,
  money: (cnyValue: number) => string,
) {
  const grams = Math.ceil(weightKg * 1000);
  const label = loc === "zh" ? "计费重量" : "Chargeable weight";
  if (country === "US") {
    return loc === "zh"
      ? `${label}：最低 2,000g，之后每 500g 向上取整；美国专线价表 + ${money(30)}`
      : `${label}: 2,000g minimum, then rounded up per 500g; US rate table + ${money(30)}`;
  }
  if (country === "GB") {
    const rate = weightKg <= 2.5 ? 55 : 58;
    const charged = Math.ceil(weightKg * 10) / 10 * 1000;
    return loc === "zh"
      ? `${label}：${charged}g，100g 向上取整；${money(rate)}/kg + 操作费 ${money(16)}`
      : `${label}: ${charged}g (100g rounding); ${money(rate)}/kg + ${money(16)} handling`;
  }
  if (EUROPE_SHIPPING_FIRST_KG[country]) {
    return loc === "zh"
      ? `${label}：最低 1,000g，整公斤向上取整；首重 ${money(EUROPE_SHIPPING_FIRST_KG[country])}，续重 ${money(39)}/kg`
      : `${label}: 1,000g minimum, rounded to full kg; ${money(EUROPE_SHIPPING_FIRST_KG[country])} first kg, ${money(39)}/kg thereafter`;
  }
  const rate = shippingRates[country] || shippingRates.OTHER;
  return loc === "zh"
    ? `${label}：${grams}g；首重 500g ${money(rate.base)}，续重每 500g ${money(rate.half)}`
    : `${label}: ${grams}g; ${money(rate.base)} first 500g, then ${money(rate.half)} per 500g`;
}

const SHIRT_OPTION_SURCHARGES: Record<string, number> = {
  "领型\u0000古巴领": 20,
  "领型\u0000针孔领(11.5)": 30,
  "领型\u0000意式一片领(9.5)": 20,
  "袖口\u0000意式法式袖3#": 10,
  "袖口\u0000意式法式袖2#": 5,
  "袖口\u0000大圆角": 5,
  "袖口折\u0000意式碎折": 10,
  "袖口折\u0000意式三折": 5,
  "后幅\u0000意式后片碎折": 10,
  "后担干\u0000担干八字拼接": 15,
  "下摆\u0000圆摆贴三角": 5,
  "下摆\u0000圆摆宝剑头贴": 5,
  "侧缝工艺\u0000手工包缝": 10,
  "袖山意式碎折\u0000袖山意式碎折": 20,
  "错位上袖\u0000需要": 40,
  "鸡爪扣钉\u0000需要": 10,
  "礼服打条\u0000礼服打条": 70,
};

const syncedStyleSurcharges = new Map<string, number>();
const styleSyncKey = (garment: string, group: string, item: string) => `${garment}\u0000${group}\u0000${item}`;

function optionSurcharge(
  garment: GarmentKey,
  groupIndex: number,
  itemIndex: number,
) {
  if (itemIndex < 0) return 0;
  const synced = syncedStyleSurcharges.get(styleSyncKey(garment, optionsByGarment[garment][groupIndex]?.title ?? "", optionsByGarment[garment][groupIndex]?.items[itemIndex] ?? ""));
  if (synced !== undefined) return synced;
  if (garment === "shirt") {
    const group = optionsByGarment.shirt[groupIndex];
    const item = group?.items[itemIndex];
    return group && item
      ? (SHIRT_OPTION_SURCHARGES[`${group.title}\u0000${item}`] ?? 0)
      : 0;
  }
  const rules: Record<GarmentKey, Record<number, number[]>> = {
    jacket: {
      7: [0, 100, 1900],
      8: [0, 200, 200, 200],
    },
    trousers: {
      0: [0, 0, 0, 0, 0, 0],
      1: [0, 0, 0, 0],
      2: [0, 0, 0, 20],
      3: [0, 0, 0, 0],
      4: [0, 0],
    },
    waistcoat: {
      0: [0, 0, 0, 80, 80, 80, 80, 80],
    },
    shirt: {},
  };
  return rules[garment][groupIndex]?.[itemIndex] ?? 0;
}
const fabricsByGarment = {
  jacket: [
    {
      code: "VBC-110-NV",
      mill: "Vitale Barberis Canonico",
      name: "深海军蓝精纺",
      meta: "100% 羊毛 · 260g · 四季",
      tone: "navy",
      stock: "有库存",
    },
    ...STYLBIELLA_FABRICS.map((f) => {
      const detected = STYLBIELLA_FABRIC_COLORS[f.code];
      return {
        code: f.code,
        mill: "STYLBIELLA",
        name: f.name,
        book: f.book,
        imageUrl: f.imageUrl,
        tone: "custom",
        stock: "现货",
        meta: f.meta || STYLBIELLA_BOOK_META[f.book].meta,
        color: detected?.color || f.color,
        colors: detected?.colors || f.colors,
        pattern: f.pattern,
        weight: f.weight,
        composition: f.composition,
      };
    }),
  ],
  trousers: [
    {
      code: "TR-120-CH",
      mill: "House Collection",
      name: "炭灰耐磨精纺",
      meta: "100% 羊毛 · 280g · 四季",
      tone: "charcoal",
      stock: "有库存",
    },
    {
      code: "TR-121-NV",
      mill: "House Collection",
      name: "经典海军蓝",
      meta: "100% 羊毛 · 275g · 四季",
      tone: "navy",
      stock: "有库存",
    },
    {
      code: "TR-122-MG",
      mill: "House Collection",
      name: "中灰人字纹",
      meta: "100% 羊毛 · 290g · 秋冬",
      tone: "herring",
      stock: "有库存",
    },
    {
      code: "TR-123-BE",
      mill: "House Collection",
      name: "米色高捻羊毛",
      meta: "100% 羊毛 · 240g · 春夏",
      tone: "beige",
      stock: "库存较少",
    },
    {
      code: "TR-124-BR",
      mill: "House Collection",
      name: "深棕法兰绒",
      meta: "100% 羊毛 · 320g · 秋冬",
      tone: "brown",
      stock: "有库存",
    },
  ],
  waistcoat: [
    {
      code: "WC-MATCH-01",
      mill: "与西装上衣同料",
      name: "同步上衣面料",
      meta: "自动引用西装上衣所选面料",
      tone: "navy",
      stock: "推荐",
    },
    {
      code: "WC-CT-IVO",
      mill: "Ceremony Collection",
      name: "象牙白礼服纹",
      meta: "棉丝混纺 · 240g · 四季",
      tone: "ivory",
      stock: "有库存",
    },
    {
      code: "WC-GLD-JQ",
      mill: "Ceremony Collection",
      name: "香槟金提花",
      meta: "真丝混纺 · 230g · 四季",
      tone: "gold",
      stock: "库存较少",
    },
    {
      code: "WC-BRG-JQ",
      mill: "Ceremony Collection",
      name: "勃艮第红提花",
      meta: "真丝混纺 · 245g · 四季",
      tone: "burgundy",
      stock: "有库存",
    },
    {
      code: "WC-GRY-CK",
      mill: "House Collection",
      name: "复古灰格纹",
      meta: "100% 羊毛 · 280g · 秋冬",
      tone: "greycheck",
      stock: "有库存",
    },
  ],
  shirt: [
    {
      code: "SH-100-WH",
      mill: "Albini",
      name: "经典白色府绸",
      meta: "100% 长绒棉 · 120g · 四季",
      tone: "white",
      stock: "有库存",
    },
    {
      code: "SH-102-ST",
      mill: "Albini",
      name: "蓝白细条纹",
      meta: "100% 长绒棉 · 130g · 四季",
      tone: "shirtstripe",
      stock: "有库存",
    },
    {
      code: "SH-103-CK",
      mill: "House Collection",
      name: "蓝色小格纹",
      meta: "100% 棉 · 135g · 四季",
      tone: "shirtcheck",
      stock: "库存较少",
    },
    {
      code: "SH-104-IV",
      mill: "Canclini",
      name: "象牙白斜纹",
      meta: "100% 棉 · 145g · 秋冬",
      tone: "ivory",
      stock: "有库存",
    },
    {
      code: "SH-105-PK",
      mill: "House Collection",
      name: "淡粉牛津纺",
      meta: "100% 棉 · 155g · 四季",
      tone: "pink",
      stock: "有库存",
    },
    ...STYLBIELLA_SHIRT_FABRICS.map((f) => {
      const detected = STYLBIELLA_FABRIC_COLORS[f.code];
      return {
        code: f.code,
        mill: "STYLBIELLA",
        name: f.name,
        book: f.book,
        imageUrl: f.imageUrl,
        tone: "custom",
        stock: "现货",
        meta: f.meta,
        color: detected?.color || f.color,
        colors: detected?.colors || f.colors,
        pattern: f.pattern,
        weight: f.weight,
        composition: f.composition,
      };
    }),
  ],
};

export function TailoringApp({ whiteLabel = false }: { whiteLabel?: boolean }) {
  const { loc, t } = useLocale();
  const { money } = useCurrency();
  const { user, ready } = useAuthGuard(false);
  const [loginReq, setLoginReq] = useState(false);
  const WHATSAPP = "18169255770";
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    clearAuth();
    window.location.href = "/login";
  };
  const [customerName, setCustomerName] = useState("");
  const [customerHeight, setCustomerHeight] = useState("");
  const [customerWeight, setCustomerWeight] = useState("");
  const [channelCode, setChannelCode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [storeName, setStoreName] = useState("Baker Street Tailors");
  const [watermarkUrl, setWatermarkUrl] = useState<string>();
  const [fabricZoom, setFabricZoom] = useState(false);
  const [styleZoom, setStyleZoom] = useState<{ src: string; label: string } | null>(null);
  const [embroideryFont, setEmbroideryFont] = useState("");
  const [embroideryDetails, setEmbroideryDetails] = useState<
    Partial<Record<GarmentKey, { text: string; color: string }>>
  >({});
  const [embroideryImageUrl, setEmbroideryImageUrl] = useState<string>();
  const [styleNotes, setStyleNotes] = useState<Partial<Record<GarmentKey, string>>>({});
  const [garment, setGarment] = useState<GarmentKey>("jacket");
  const [step, setStep] = useState<"measure" | "style">("style");
  const [fabricFirst, setFabricFirst] = useState(true);
  const fabricPageScrollY = useRef(0);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (Object.keys(optionsByGarment) as GarmentKey[]).forEach((key) => {
      optionsByGarment[key].forEach((group) => {
        if (
          group.items[0] &&
          !(key === "shirt" && OPTIONAL_SHIRT_GROUPS.has(group.title))
        )
          init[`${key}:${group.title}`] = group.items[0];
      });
    });
    init["jacket:纽扣数量"] = "4";
    init["jacket:扣眼方向"] = "直扣眼";
    init["jacket:驳头宽"] = "5.5cm";
    return init;
  });
  const [measurements, setMeasurements] =
    useState<Record<string, [string, string]>>(emptyMeasurements);
  const [fabricByGarment, setFabricByGarment] = useState<
    Partial<Record<GarmentKey, string>>
  >({});
  const [fabricSearch, setFabricSearch] = useState("");
  const [, setCatalogRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void fetch("/api/catalog")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("catalog unavailable")))
      .then((data: { fabrics?: Array<Record<string, unknown>>; styles?: Array<Record<string, unknown>> }) => {
        if (cancelled || !Array.isArray(data.fabrics) || !Array.isArray(data.styles)) return;
        // An empty D1 catalog means no managed catalog has been configured yet.
        // Do not replace the built-in STYLBIELLA collection in that case: doing so
        // leaves the storefront with no brands or fabrics to choose from.
        if (data.fabrics.length > 0) {
          const defaultFabrics = Object.fromEntries((Object.keys(fabricsByGarment) as GarmentKey[]).map((key) => [key, new Map(fabricsByGarment[key].map((fabric) => [fabric.code, fabric]))]));
          const nextFabrics = Object.fromEntries((Object.keys(fabricsByGarment) as GarmentKey[]).map((key) => [key, [] as Array<Record<string, unknown>>])) as Record<GarmentKey, Array<Record<string, unknown>>>;
          for (const row of data.fabrics) {
            const garmentType = row.garmentType as GarmentKey;
            const code = String(row.code ?? "");
            if (!nextFabrics[garmentType] || !code) continue;
            const fallback = defaultFabrics[garmentType].get(code) ?? {};
            nextFabrics[garmentType].push({ ...fallback, ...row });
          }
          for (const key of Object.keys(fabricsByGarment) as GarmentKey[]) {
            fabricsByGarment[key].splice(0, fabricsByGarment[key].length, ...(nextFabrics[key] as typeof fabricsByGarment[typeof key]));
          }
        }
        const grouped = new Map<string, Array<Record<string, unknown>>>();
        for (const row of data.styles) {
          const key = `${row.garmentType}\u0000${row.groupTitle}`;
          const rows = grouped.get(key) ?? [];
          rows.push(row);
          grouped.set(key, rows);
          syncedStyleSurcharges.set(styleSyncKey(String(row.garmentType), String(row.groupTitle), String(row.item)), Number(row.surcharge ?? 0));
        }
        for (const garmentType of Object.keys(optionsByGarment) as GarmentKey[]) {
          for (const group of optionsByGarment[garmentType]) {
            const rows = grouped.get(`${garmentType}\u0000${group.title}`);
            if (rows?.length) group.items = rows.map((row) => String(row.item));
          }
        }
        setSelected((previous) => {
          const next = { ...previous };
          for (const garmentType of Object.keys(optionsByGarment) as GarmentKey[]) {
            for (const group of optionsByGarment[garmentType]) {
              const key = `${garmentType}:${group.title}`;
              if (next[key] && group.items.includes(next[key])) continue;
              if (group.items[0]) next[key] = group.items[0];
            }
          }
          return next;
        });
        setCatalogRevision((revision) => revision + 1);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  const active = garments[garment];
  const optionGroups = optionsByGarment[garment];
  const groupRows =
    garment === "jacket"
      ? [
          ["正面款式"],
          ["胸兜款式", "肩膀样式", "纽扣钉法", "纽扣选择", "纽扣数量"],
          ["口袋款式"],
          ["驳头款式", "驳头宽", "下摆开角大小"],
          ["西服背面款式", "西服开衩选择"],
          ["里布位置", "毛衬"],
          ["穿着习惯", "色丁位置", "外珠边", "香水垫", "里兜左", "里兜右", "过面"],
        ]
      : garment === "trousers"
        ? [["扣型", "褶皱"], ["裤脚", "裤型", "裤脚口"], ["侧兜", "前表兜", "后斗锁眼", "兜中兜", "后兜"]]
        : garment === "waistcoat"
          ? [["马甲款式"], ["马甲口袋数量", "马甲口袋款式", "马甲下摆"], ["后领条", "后背面", "侧开叉", "外珠边"]]
          : garment === "shirt"
            ? [
                ["领型"],
                ["领插片", "领硬度"],
                ["袖口折", "口袋"],
                ["袖口"],
                ["前幅门襟", "下摆", "后担干"],
                ["后幅"],
                ["侧缝工艺", "袖山意式碎折", "错位上袖", "鸡爪扣钉", "礼服打条"],
                ["字体"],
                ["文字位置"],
              ]
            : null;
  const currentFabric = [
    ...fabricsByGarment.jacket,
    ...fabricsByGarment.trousers,
    ...fabricsByGarment.waistcoat,
    ...fabricsByGarment.shirt,
  ].find((f) => f.code === fabricByGarment[garment]);
  const optionExtra = optionGroups.reduce((sum, group) => {
    const item = selected[`${garment}:${group.title}`];
    const itemIndex = group.items.indexOf(item);
    const groupIndex = optionGroups.findIndex(
      (candidate) => candidate.title === group.title,
    );
    return (
      sum +
      (itemIndex >= 0 ? optionSurcharge(garment, groupIndex, itemIndex) : 0)
    );
  }, 0);
  const measurementCm = (target: GarmentKey, field: string) => {
    const stored = measurements[`${target}:${field}`];
    return Number(stored?.[0] || stored?.[1]) || 0;
  };
  const garmentLengthCm =
    garment === "trousers"
      ? Math.max(
          measurementCm("trousers", "裤长 左"),
          measurementCm("trousers", "裤长 右"),
        )
      : garment === "jacket"
        ? Math.max(
            measurementCm("jacket", "前衣长"),
            measurementCm("jacket", "后中长"),
          )
        : garment === "waistcoat"
          ? Math.max(
              measurementCm("waistcoat", "前衣长"),
              measurementCm("waistcoat", "后衣长"),
            )
          : 0;
  const hasFabricMeasurement = garment === "shirt" || garmentLengthCm > 0;
  const missingMeasurementMessage =
    loc === "zh"
      ? "还未填写量体数值"
      : "Required measurement values have not been entered";
  const rawFabricMeters = !hasFabricMeasurement
    ? null
    : garment === "trousers"
      ? garmentLengthCm <= 72
        ? 1.2
        : (garmentLengthCm * 1.75) / 100
      : garment === "jacket"
        ? (garmentLengthCm * 2 + 20) / 100
        : garment === "waistcoat"
          ? (garmentLengthCm +
              (WAISTCOAT_EXTRA_LENGTH_STYLES.has(
                selected["waistcoat:马甲款式"],
              )
                ? 20
                : 0)) /
            100
          : 1;
  const fabricMeters =
    rawFabricMeters === null
      ? null
      : Math.round(rawFabricMeters * 1000) / 1000;
  const fabricUnitPrice = getFabricPrice(fabricByGarment[garment]);
  const fabricPrice =
    fabricMeters === null ? 0 : Math.round(fabricUnitPrice * fabricMeters);
  const fabricGsm = conservativeFabricGsm(currentFabric);
  const orderWeight = conservativeGarmentWeight(
    garment,
    fabricMeters,
    fabricGsm,
    selected["jacket:毛衬"],
  );
  const rate = shippingRates[country] || shippingRates.OTHER;
  const hasShippingAddress = Boolean(
    country && region.trim() && city.trim() && street.trim() && postalCode.trim(),
  );
  const quote = hasShippingAddress
    ? shippingQuote(country, orderWeight)
    : { fee: 0, label: "" };
  const selectedCountryName =
    Country.getCountryByCode(country)?.name || rate.label;
  const shippingFee = quote.fee;
  const productPrice = basePrices[garment] + fabricPrice + optionExtra;
  const totalPrice = productPrice + shippingFee;
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [piItems, setPiItems] = useState<PiItem[]>([]);
  const [piMsg, setPiMsg] = useState<string | null>(null);
  const [fabricEditItemKey, setFabricEditItemKey] = useState<string>();
  const [styleEditItemKey, setStyleEditItemKey] = useState<string>();
  const [mTab, setMTab] = useState<GarmentKey | "posture">("jacket");
  const [postureSelections, setPostureSelections] = useState<Record<string, string>>({});
  useEffect(() => {
    setPiItems((items) =>
      items.map((item) => ({
        ...item,
        shippingFee: hasShippingAddress
          ? shippingQuote(country, item.weightKg).fee
          : 0,
      })),
    );
  }, [country, region, city, street, postalCode, hasShippingAddress]);
  const setMeasureTab = (
    g: GarmentKey,
    field: string,
    slot: 0 | 1,
    value: string,
  ) =>
    setMeasurements((prev) => {
      const key = `${g}:${field}`;
      const cur = prev[key] ?? ["", ""];
      const next = [cur[0], cur[1]];
      next[slot] = value;
      return { ...prev, [key]: next };
    });
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [imperialMeasurementDrafts, setImperialMeasurementDrafts] = useState<
    Record<string, string>
  >({});
  const [customerMode, setCustomerMode] = useState<"new" | "returning">("new");
  const [lookupName, setLookupName] = useState("");
  const [lookupResults, setLookupResults] = useState<CustomerLookup[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadedCustomer, setLoadedCustomer] = useState<{
    id: number;
    name: string;
    height: string;
    weight: string;
    channelCode: string;
  } | null>(null);
  useEffect(() => {
    if (!user?.id) {
      setRecentSearches([]);
      setLookupResults([]);
      setLookupOpen(false);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(`verosuits:recent-customer-searches:${user.id}`) || "[]");
      setRecentSearches(
        Array.isArray(saved)
          ? saved.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0).slice(0, 10)
          : [],
      );
    } catch {
      setRecentSearches([]);
    }
  }, [user?.id]);
  const cmToIn = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? (n / 2.54).toFixed(1) : "";
  };
  const inToCm = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? (n * 2.54).toFixed(1) : "";
  };
  const measurementInputKey = (
    target: GarmentKey,
    field: string,
    slot: 0 | 1,
  ) => `${target}:${field}:${slot}`;
  const measurementInputValue = (
    target: GarmentKey,
    field: string,
    slot: 0 | 1,
    cmValue: string,
  ) =>
    unit === "cm"
      ? cmValue
      : (imperialMeasurementDrafts[
          measurementInputKey(target, field, slot)
        ] ?? cmToIn(cmValue));
  const changeMeasurementInput = (
    target: GarmentKey,
    field: string,
    slot: 0 | 1,
    inputValue: string,
  ) => {
    const cleaned = inputValue.replace(/[^0-9.]/g, "");
    if (unit === "cm") {
      setMeasureTab(target, field, slot, cleaned);
      return;
    }
    const key = measurementInputKey(target, field, slot);
    setImperialMeasurementDrafts((prev) => ({ ...prev, [key]: cleaned }));
    setMeasureTab(target, field, slot, cleaned ? inToCm(cleaned) : "");
  };
  const searchCustomersFor = async (query: string) => {
    if (!user?.id) {
      setLookupResults([]);
      setLookupOpen(false);
      window.location.href = "/login";
      return;
    }
    setRecentSearches((previous) => {
      const next = [query, ...previous.filter((entry) => entry.toLowerCase() !== query.toLowerCase())].slice(0, 10);
      if (user?.id) localStorage.setItem(`verosuits:recent-customer-searches:${user.id}`, JSON.stringify(next));
      return next;
    });
    try {
      const data = await apiFetch<{
        customers: CustomerLookup[];
      }>(
        `/api/customers?q=${encodeURIComponent(query)}&t=${Date.now()}`,
      );
      setLookupResults(data.customers ?? []);
    } catch (e) {
      alert(e instanceof Error ? e.message : t("common.searchFailed"));
    }
  };
  const loadCustomer = async (c: CustomerLookup) => {
    if (!user?.id) {
      setLookupResults([]);
      setLookupOpen(false);
      window.location.href = "/login";
      return;
    }
    try {
      const data = await apiFetch<{
        customer: typeof c & {
          country: string;
          region: string;
          city: string;
          street: string;
          postalCode: string;
          measurementsSavedAt: string | null;
        };
      }>(`/api/customers/${c.id}`);
      const profile = data.customer;
      setCustomerName(profile.name);
      setCustomerHeight(profile.height || "");
      setCustomerWeight(profile.weight || "");
      setChannelCode(profile.channelCode || "");
      setAvatarUrl(profile.avatarUrl ?? undefined);
      setCountry(profile.country || "");
      setRegion(profile.region || "");
      setCity(profile.city || "");
      setStreet(profile.street || "");
      setPostalCode(profile.postalCode || "");

      let profileMeasurements: Record<string, [string, string]> = {};
      let profilePostures: Record<string, string> = {};
      try {
        const saved = JSON.parse(profile.measurements || "{}");
        if (saved && typeof saved === "object") {
          const { __posture, ...sizeValues } = saved as Record<string, unknown>;
          profileMeasurements = Object.fromEntries(
            Object.entries(sizeValues).filter(([, value]) =>
              Array.isArray(value) && value.length === 2 && value.every((part) => typeof part === "string"),
            ),
          ) as Record<string, [string, string]>;
          if (__posture && typeof __posture === "object" && !Array.isArray(__posture)) {
            profilePostures = Object.fromEntries(
              Object.entries(__posture as Record<string, unknown>).filter(([, value]) => typeof value === "string"),
            );
          }
        }
      } catch { /* Start with a clean measurement form if the legacy record is malformed. */ }
      setMeasurements({ ...emptyMeasurements(), ...profileMeasurements });
      setPostureSelections(profilePostures);
      setLoadedCustomer(profile);
      setProfileSavedAt(profile.measurementsSavedAt || "");
      setLookupResults([]);
      setLookupName("");
      setLookupOpen(false);
      setFormOpen(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : t("common.searchFailed"));
    }
  };
  const searchCustomers = async () => {
    const query = lookupName.trim();
    if (!query) return;
    await searchCustomersFor(query);
  };
  const [formOpen, setFormOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedAt, setProfileSavedAt] = useState("");
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [profileKeptForOrder, setProfileKeptForOrder] = useState(false);
  useEffect(() => {
    if (formOpen && !loadedCustomer) {
      setMeasurements(emptyMeasurements());
      setPostureSelections({});
      setImp({ ft: "", in: "" });
    }
  }, [formOpen, loadedCustomer]);
  useEffect(() => {
    if (loadedCustomer)
      setMeasurements((prev) => ({ ...emptyMeasurements(), ...prev }));
  }, [loadedCustomer?.id]);
  const saveCustomerProfile = async () => {
    if (!customerName.trim()) {
      setProfileSaveMessage(t("cust.nameRequired"));
      return;
    }
    setProfileSaving(true);
    setProfileSaveMessage("");
    setProfileKeptForOrder(false);
    try {
      const savedAt = new Date().toISOString();
      const payload = {
        name: customerName.trim(),
        height: customerHeight,
        weight: customerWeight,
        channelCode,
        avatarUrl: avatarUrl ?? "",
        country,
        region,
        city,
        street,
        postalCode,
        measurements: JSON.stringify({
          ...measurements,
          __posture: postureSelections,
        }),
        measurementsSavedAt: savedAt,
      };
      const data = loadedCustomer
        ? await apiFetch<{
            customer: {
              id: number;
              name: string;
              height: string;
              weight: string;
              channelCode: string;
              updatedAt: string;
            };
          }>(`/api/customers/${loadedCustomer.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<{
            customer: {
              id: number;
              name: string;
              height: string;
              weight: string;
              channelCode: string;
              updatedAt: string;
            };
          }>("/api/customers", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      setLoadedCustomer(data.customer);
      setProfileSavedAt(data.customer.updatedAt || savedAt);
      setProfileSaveMessage(t("cust.saved"));
      setTimeout(() => setProfileSaveMessage(""), 3000);
    } catch (e) {
      setProfileSaveMessage(e instanceof Error ? e.message : t("cust.saveFailed"));
    } finally {
      setProfileSaving(false);
    }
  };
  const keepCustomerProfileForOrder = () => {
    setProfileSaveMessage("");
    setProfileKeptForOrder(true);
    setTimeout(() => setProfileKeptForOrder(false), 3000);
  };
  const [lookupOpen, setLookupOpen] = useState(false);
  const [imp, setImp] = useState<{ ft: string; in: string }>({
    ft: "",
    in: "",
  });
  const enterImperial = () => {
    setImperialMeasurementDrafts({});
    setUnit("in");
    const n = parseFloat(customerHeight) / 2.54;
    if (Number.isFinite(n) && n > 0) {
      setImp({
        ft: String(Math.floor(n / 12)),
        in: (n - Math.floor(n / 12) * 12).toFixed(1),
      });
    } else {
      setImp({ ft: "", in: "" });
    }
  };
  const kgToLb = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? (n * 2.20462).toFixed(1) : "";
  };
  const lbToKg = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? (n / 2.20462).toFixed(2) : "";
  };
  const buildItem = (): PiItem => {
    // Use the complete garment catalogue here, rather than only the groups
    // currently laid out on screen. This makes PI the canonical record of
    // every selected jacket, trouser, waistcoat and shirt option.
    const options = optionGroups.flatMap((group) => {
      const item = selected[`${garment}:${group.title}`];
      const itemIndex = group.items.indexOf(item);
      const groupIndex = optionGroups.findIndex(
        (candidate) => candidate.title === group.title,
      );
      return item
        ? [
            {
              group: group.title,
              item,
              price: optionSurcharge(garment, groupIndex, itemIndex),
            },
          ]
        : [];
    });
    if (garment === "shirt" && embroideryFont.trim()) {
      options.push({ group: "刺绣文字", item: embroideryFont.trim(), price: 0 });
    }
    const embroidery = embroideryDetails[garment];
    if (embroidery?.text.trim()) {
      options.push({ group: "刺绣文字", item: embroidery.text.trim(), price: 0 });
    }
    if (embroidery?.color.trim()) {
      options.push({ group: "刺绣颜色", item: embroidery.color.trim(), price: 0 });
    }
    const styleNote = styleNotes[garment]?.trim();
    if (styleNote) {
      options.push({ group: "备注", item: styleNote, price: 0 });
    }
    const measurementRows = active.fields.map((field, index) => {
      const [net, finished] = measurements[`${garment}:${field}`] ?? [
        String(active.values[index][0]),
        String(active.values[index][1]),
      ];
      return { field, net, finished };
    });
    return {
      key: `${garment}:${Date.now()}`,
      kind: "product",
      garmentType: garment,
      garmentName: active.name,
      fabricCode: fabricByGarment[garment] ?? "",
      fabricName: currentFabric?.name,
      fabricMill: currentFabric?.mill,
      meters: fabricMeters ?? undefined,
      basePrice: basePrices[garment],
      fabricPrice,
      optionExtra,
      shippingFee,
      productPrice,
      weightKg: orderWeight,
      options,
      measurements: measurementRows,
    };
  };
  const addToPi = () => {
    if (!fabricByGarment[garment]) {
      alert(t("home.pleaseFabric"));
      return;
    }
    if (!hasFabricMeasurement) {
      alert(missingMeasurementMessage);
      return;
    }
    const nextItem = buildItem();
    setPiItems((prev) =>
      styleEditItemKey
        ? prev.map((item) =>
            item.key === styleEditItemKey
              ? { ...nextItem, key: styleEditItemKey }
              : item,
          )
        : [...prev, nextItem],
    );
    setStyleEditItemKey(undefined);
    setPiMsg(t("home.addedPi"));
    setTimeout(() => setPiMsg(null), 2000);
  };
  const addFabricToPi = (code: string, metersInput: number) => {
    const meters = Number(metersInput) || 0;
    if (meters <= 0) {
      alert(t("home.invalidMeters"));
      return;
    }
    const fabric = [
      ...fabricsByGarment.jacket,
      ...fabricsByGarment.trousers,
      ...fabricsByGarment.waistcoat,
      ...fabricsByGarment.shirt,
    ].find((item) => item.code === code);
    const perMeter = getFabricPrice(code);
    // 合并同类项：同款面料直接累加米数
    const idx = piItems.findIndex(
      (item) => item.kind === "fabric" && item.fabricCode === code,
    );
    let next: PiItem[];
    let added: PiItem;
    if (idx >= 0) {
      const exist = piItems[idx];
      const newMeters = (exist.meters ?? 0) + meters;
      const fabricTotal = Math.round(perMeter * newMeters);
      const weight = Math.ceil((newMeters * 0.35 + 0.3) * 2) / 2;
      const shipping =
        rate.base + Math.max(0, Math.round((weight - 0.5) / 0.5)) * rate.half;
      added = {
        ...exist,
        meters: newMeters,
        basePrice: fabricTotal,
        shippingFee: shipping,
        productPrice: fabricTotal,
        weightKg: weight,
        options: [
          { group: "购买米数", item: `${newMeters} 米`, price: perMeter },
        ],
      };
      next = piItems.map((item, i) => (i === idx ? added : item));
    } else {
      const fabricTotal = Math.round(perMeter * meters);
      const weight = Math.ceil((meters * 0.35 + 0.3) * 2) / 2;
      const shipping =
        rate.base + Math.max(0, Math.round((weight - 0.5) / 0.5)) * rate.half;
      added = {
        key: `fabric:${code}:${Date.now()}`,
        kind: "fabric",
        fabricCode: code,
        fabricName: fabric?.name,
        fabricMill: fabric?.mill,
        meters,
        basePrice: fabricTotal,
        fabricPrice: perMeter,
        optionExtra: 0,
        shippingFee: shipping,
        productPrice: fabricTotal,
        weightKg: weight,
        options: [{ group: "购买米数", item: `${meters} 米`, price: perMeter }],
        measurements: [],
      };
      next = [...piItems, added];
    }
    setPiItems(next);
    setPiMsg(t("home.addedPi"));
    setTimeout(() => setPiMsg(null), 2000);
  };
  const submitOrder = async () => {
    if (!user) {
      setLoginReq(true);
      return;
    }
    if (!customerName.trim()) {
      alert(t("home.pleaseName"));
      return;
    }
    if (!fabricByGarment[garment]) {
      alert(t("home.pleaseFabric"));
      return;
    }
    if (
      (!piItems.length && !hasFabricMeasurement) ||
      piItems.some(
        (item) =>
          item.kind === "product" &&
          item.garmentType !== "shirt" &&
          !item.meters,
      )
    ) {
      alert(missingMeasurementMessage);
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    const submitItems = (piItems.length ? piItems : [buildItem()]).map(
      normalizePiItem,
    );
    const garmentItems = submitItems.map((item) =>
      item.kind === "fabric"
        ? {
            garmentType: "fabric",
            garmentName: `${t("pi.fabric")} · ${item.fabricName ?? item.fabricCode}`,
            fabricCode: item.fabricCode,
            fabricName: item.fabricName,
            fabricMill: item.fabricMill,
            basePrice: item.basePrice,
            fabricPrice: item.fabricPrice,
            optionExtra: 0,
            shippingFee: item.shippingFee,
            totalPrice: item.productPrice + item.shippingFee,
            currency: "CNY",
            weightKg: item.weightKg,
            options: [],
            measurements: [],
            shippingAddress: {
              country: selectedCountryName,
              region,
              city,
              street,
              postalCode,
            },
          }
        : {
            garmentType: item.garmentType,
            garmentName: item.garmentName,
            fabricCode: item.fabricCode,
            fabricName: item.fabricName,
            fabricMill: item.fabricMill,
            basePrice: item.basePrice,
            fabricPrice: item.fabricPrice,
            optionExtra: item.optionExtra,
            shippingFee: item.shippingFee,
            totalPrice: item.productPrice + item.shippingFee,
            currency: "CNY",
            weightKg: item.weightKg,
            options: validPiOptions(item),
            measurements: item.measurements,
            shippingAddress: {
              country: selectedCountryName,
              region,
              city,
              street,
              postalCode,
            },
          },
    );
    const measurementProfile: Record<string, [string, string]> = {};
    for (const g of Object.keys(garments) as GarmentKey[]) {
      for (const f of garments[g].fields) {
        const value = measurements[`${g}:${f}`];
        if (value && (value[0] || value[1])) measurementProfile[`${g}:${f}`] = value;
      }
    }
    localStorage.setItem("verosuits-order-draft", JSON.stringify({
      customer: { name: customerName.trim(), height: customerHeight, weight: customerWeight, channelCode, avatarUrl, country, region, city, street, postalCode },
      order: { items: garmentItems },
      profilePatch: { measurements: JSON.stringify({ ...measurementProfile, __posture: postureSelections }), height: customerHeight, weight: customerWeight, name: customerName.trim(), channelCode },
    }));
    setSubmitting(false);
    window.location.href = "/selection";
  };
  return (
    <main className={`shell ${whiteLabel ? "white-label-mode" : ""}`}>
      <aside className="side">
        <div className="brand"><BrandLogo compact /></div>
        <nav>
          <a className="on" href="/customize">
            ▦　{t("home.newOrder")}
          </a>
          <a href="/accessories">◇　{t("home.accessories")}</a>
          <a href="/selection">▣　{t("home.selection")}</a>
          <a href="/customers">♙　{t("home.customers")}</a>
          <a href="/orders">▤　{t("home.orders")}</a>
          {ready && user?.role === "master" && (
            <a href="/admin">⚙　{t("home.admin")}</a>
          )}
        </nav>
        <div className="store">
          <i />
          <div>
            <b>Baker Street Tailors</b>
            <small>{t("home.storeLocation")}</small>
          </div>
        </div>
      </aside>
      <section className="work">
        {whiteLabel ? (
          <header className="white-label-header">
            <div className="store-identity">
              <label className="watermark-upload">
                {watermarkUrl ? (
                  <img src={watermarkUrl} alt={t("home.watermark")} />
                ) : (
                  <span>
                    LOGO
                    <br />
                    {t("home.watermark")}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setWatermarkUrl(URL.createObjectURL(file));
                  }}
                />
              </label>
              <div>
                <p className="eyebrow">PRIVATE MADE-TO-MEASURE SERVICE</p>
                <input
                  aria-label={t("landing.contactName")}
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                />
                <small>{t("home.whiteLabelSub")}</small>
              </div>
            </div>
            <div className="actions">
              <LanguageSwitcher />
              {ready && user ? (
                <>
                  <button className="account-switch" onClick={logout}>
                    {t("home.switchAccount")}
                  </button>
                  <a className="home-return" href="/">
                    {t("home.backHome")}
                  </a>
                </>
              ) : (
                <>
                  <a className="login-link" href="/login">
                    {t("home.loginRegister")}
                  </a>
                  <a className="home-return" href="/">
                    {t("home.backHome")}
                  </a>
                </>
              )}
            </div>
          </header>
        ) : (
          <header>
            <div>
              <p className="eyebrow">{t("home.eyebrow")}</p>
              <h1>{t("home.title")}</h1>
            </div>
            <div className="actions">
              <LanguageSwitcher />
              <button>{t("home.saveDraft")}</button>
              <button
                className="primary"
                onClick={submitOrder}
                disabled={submitting}
              >
                {submitting
                  ? t("home.submitting")
                  : `${t("home.submitOrder")}　→`}
              </button>
              {ready && user ? (
                <>
                  <span className="user-chip">
                    {localizeStoreName(user.storeName || user.username, loc)}
                    {user.role === "master" ? " · 主账号" : ""}
                  </span>
                  <button onClick={logout} title={t("home.logout")}>
                    ⇥
                  </button>
                </>
              ) : (
                <a className="login-link" href="/login">
                  {t("home.loginRegister")}
                </a>
              )}
            </div>
          </header>
        )}
        {submitMsg && <div className="submit-banner">{submitMsg}</div>}
        {loginReq && (
          <div
            className="login-req-backdrop"
            onClick={() => setLoginReq(false)}
          >
            <div className="login-req" onClick={(e) => e.stopPropagation()}>
              <div className="login-req-head">
                <div>
                  <p className="eyebrow">ACCOUNT REQUIRED</p>
                  <h3>{t("home.loginReqTitle")}</h3>
                </div>
                <button
                  className="mgmt-close"
                  onClick={() => setLoginReq(false)}
                  aria-label={t("common.close")}
                >
                  ×
                </button>
              </div>
              <p className="login-req-text">{t("home.loginReqText")}</p>
              <div className="login-req-actions">
                <a
                  className="wa-btn"
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i>✆</i>
                  {t("home.waRegister")}
                </a>
                <a className="login-btn2" href="/login">
                  {t("home.goLogin")}
                </a>
              </div>
              <small className="login-req-note">{t("home.loginReqNote")}</small>
            </div>
          </div>
        )}
        <div className="layout" id="order">
          <div>
            <section className="client client-form">
              <div className="client-form-top">
                {formOpen && (
                  <button
                    type="button"
                    className="form-back"
                    onClick={() => setFormOpen(false)}
                    title={t("common.back")}
                  >
                    ←
                  </button>
                )}
                <b className="form-title">{t("home.customerInfo")}</b>
              </div>
              {!formOpen ? (
                <div className="customer-entry">
                  <div className="entry-head">
                    <small>{t("home.customerInfo")}</small>
                    <p>{t("cust.entryHelp")}</p>
                  </div>
                  <div className="entry-actions">
                    <button
                      type="button"
                      className="entry-new"
                      onClick={() => {
                        setCustomerMode("new");
                        setLoadedCustomer(null);
                        setFormOpen(true);
                        setCustomerName("");
                        setCustomerHeight("");
                        setCustomerWeight("");
                        setChannelCode("");
                        setCountry("");
                        setRegion("");
                        setCity("");
                        setStreet("");
                        setPostalCode("");
                        setAvatarUrl(undefined);
                        setStyleNotes({});
                        setEmbroideryDetails({});
                        setEmbroideryFont("");
                      }}
                    >
                      <i>＋</i>
                      <b>{t("home.addNewCustomer")}</b>
                      <em>{t("home.addNewCustomerSub")}</em>
                    </button>
                    <button
                      type="button"
                      className="entry-return"
                      onClick={() => {
                        if (user?.id) setLookupOpen(true);
                        else window.location.href = "/login";
                      }}
                    >
                      <i>⌕</i>
                      <b>{t("home.searchExistingCustomer")}</b>
                      <em>{t("home.searchExistingCustomerSub")}</em>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <label className="avatar-upload">
                    <span className="avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={t("home.avatar")} />
                      ) : (
                        customerName
                          .trim()
                          .split(/\s+/)
                          .map((name) => name[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || t("home.photoFallback")
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setAvatarUrl(URL.createObjectURL(file));
                      }}
                    />
                    <small>
                      {avatarUrl
                        ? t("home.avatarChange")
                        : t("home.avatarUpload")}
                    </small>
                  </label>
                  <div className="client-fields">
                    <label className="name">
                      <span>
                        {t("home.customerName")} <i>*</i>
                      </span>
                      <input
                        required
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        placeholder={t("home.customerName")}
                      />
                    </label>
                    <label>
                      <span>
                        {t("home.height")} <i>*</i>
                      </span>
                      <div>
                        {unit === "cm" ? (
                          <input
                            required
                            inputMode="decimal"
                            value={customerHeight}
                            onChange={(event) =>
                              setCustomerHeight(
                                event.target.value.replace(/[^0-9.]/g, ""),
                              )
                            }
                            placeholder="180"
                          />
                        ) : (
                          <div className="height-imperial">
                            <label>
                              <input
                                required
                                inputMode="decimal"
                                value={imp.ft}
                                onChange={(event) => {
                                  const v = event.target.value.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  setImp((p) => ({ ...p, ft: v }));
                                  setCustomerHeight(
                                    (
                                      ((parseFloat(v) || 0) * 12 +
                                        (parseFloat(imp.in) || 0)) *
                                      2.54
                                    ).toFixed(1),
                                  );
                                }}
                                placeholder="5"
                              />
                              <em>ft</em>
                            </label>
                            <label>
                              <input
                                required
                                inputMode="decimal"
                                value={imp.in}
                                onChange={(event) => {
                                  const v = event.target.value.replace(
                                    /[^0-9.]/g,
                                    "",
                                  );
                                  setImp((p) => ({ ...p, in: v }));
                                  setCustomerHeight(
                                    ((parseFloat(imp.ft) || 0) * 12 +
                                      (parseFloat(v) || 0)) *
                                      2.54,
                                  ).toFixed(1);
                                }}
                                placeholder="9"
                              />
                              <em>in</em>
                            </label>
                          </div>
                        )}
                      </div>
                    </label>
                    <label>
                      <span>
                        {t("home.weight")} <i>*</i>
                      </span>
                      <div>
                        <input
                          required
                          inputMode="decimal"
                          value={
                            unit === "cm"
                              ? customerWeight
                              : kgToLb(customerWeight)
                          }
                          onChange={(event) =>
                            setCustomerWeight(
                              unit === "cm"
                                ? event.target.value.replace(/[^0-9.]/g, "")
                                : lbToKg(event.target.value),
                            )
                          }
                          placeholder="78"
                        />
                        <em>{unit === "cm" ? "kg" : "lb"}</em>
                      </div>
                    </label>
                    <label>
                      <span>{t("home.channel")}</span>
                      <input
                        maxLength={8}
                        value={channelCode}
                        onChange={(event) =>
                          setChannelCode(
                            event.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                          )
                        }
                        placeholder="BST"
                      />
                    </label>
                  </div>
                  <div className="client-measure">
                    <div className="client-measure-head">
                      <small>{t("cust.measureProfile")}</small>
                      <div className="mtabs">
                        <div className="unit-toggle" aria-label={t("cust.unit") }>
                          <button
                            className={unit === "cm" ? "on" : ""}
                            onClick={() => {
                              setImperialMeasurementDrafts({});
                              setUnit("cm");
                            }}
                          >
                            {t("cust.metric")}
                          </button>
                          <button
                            className={unit === "in" ? "on" : ""}
                            onClick={enterImperial}
                          >
                            {t("cust.imperial")}
                          </button>
                        </div>
                        {(Object.keys(garments) as GarmentKey[]).map((key) => (
                          <button
                            key={key}
                            className={mTab === key ? "on" : ""}
                            onClick={() => setMTab(key)}
                          >
                            {tailoringTerm(garments[key].name, loc)}
                          </button>
                        ))}
                        <button
                          className={mTab === "posture" ? "on" : ""}
                          onClick={() => setMTab("posture")}
                        >
                          {t("cust.posture")}
                        </button>
                      </div>
                    </div>
                    {(function () {
                      if (mTab === "posture") {
                        return (
                          <div className="posture-register" aria-label={t("cust.posture")}>
                            {POSTURE_GROUPS.map((group) => (
                              <section key={group.title}>
                                <b>{tailoringTerm(group.title, loc)}</b>
                                <select
                                  aria-label={`${tailoringTerm(group.title, loc)} ${t("cust.level")}`}
                                  value={postureSelections[group.title] ?? ""}
                                  onChange={(event) =>
                                    setPostureSelections((current) => ({
                                      ...current,
                                      [group.title]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">{t("cust.choose")}</option>
                                  {group.options.map((option) => (
                                    <option key={option} value={option}>
                                      {tailoringTerm(option, loc)}
                                    </option>
                                  ))}
                                </select>
                              </section>
                            ))}
                          </div>
                        );
                      }
                      const isPaper =
                        mTab === "shirt" ||
                        mTab === "jacket" ||
                        mTab === "trousers" ||
                        mTab === "waistcoat";
                      const shownFields = garments[mTab].fields;
                      const renderSplitMeasurementTable = (fields: string[], tableCorner: string) => (
                        <div
                          className={`cm-table ${isPaper ? "bw" : ""}`}
                          style={{
                            gridTemplateColumns: `90px repeat(${fields.length}, 1fr)`,
                          }}
                        >
                          <div className="cm-tr head">
                            <b>{tailoringTerm(tableCorner, loc)}</b>
                            {fields.map((field) => (
                              <span key={field}>{tailoringTerm(field, loc, "measurement")}</span>
                            ))}
                          </div>
                          {[0, 1].map((measurementIndex) => (
                            <div className="cm-tr" key={measurementIndex}>
                              <b>{measurementIndex === 0 ? t("cust.body") : t("cust.finished")}</b>
                              {fields.map((field) => {
                                const fieldIndex = garments[mTab].fields.indexOf(field);
                                const measure = measurements[`${mTab}:${field}`] ?? [
                                  String(garments[mTab].values[fieldIndex][0]),
                                  String(garments[mTab].values[fieldIndex][1]),
                                ];
                                return (
                                  <label key={field}>
                                    <input
                                      inputMode="decimal"
                                      value={measurementInputValue(
                                        mTab,
                                        field,
                                        measurementIndex,
                                        measure[measurementIndex],
                                      )}
                                      onChange={(event) =>
                                        changeMeasurementInput(
                                          mTab,
                                          field,
                                          measurementIndex,
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <em>{unit}</em>
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                      const corner =
                        mTab === "shirt"
                          ? "衬衫"
                          : mTab === "jacket"
                            ? "西装上衣"
                            : mTab === "trousers"
                              ? "裤子"
                              : mTab === "waistcoat"
                                ? "马甲"
                                : "尺寸项目";
                      return (
                        <>
                          <p className="cm-req">
                            ※ {t("cust.measureHint")}
                          </p>
                          <div className="cm-table-wrap cm-table-full">
                            <div
                              className={`cm-table ${isPaper ? "bw" : ""}`}
                              style={{
                                gridTemplateColumns: `90px repeat(${shownFields.length}, 1fr)`,
                              }}
                            >
                              <div className="cm-tr head">
                                <b>{tailoringTerm(corner, loc)}</b>
                                {shownFields.map((f) => (
                                  <span key={f}>{tailoringTerm(f, loc, "measurement")}</span>
                                ))}
                              </div>
                              <div className="cm-tr">
                                <b>{t("cust.body")}</b>
                                {shownFields.map((field) => {
                                  const oi =
                                    garments[mTab].fields.indexOf(field);
                                  const m = measurements[
                                    `${mTab}:${field}`
                                  ] ?? [
                                    String(garments[mTab].values[oi][0]),
                                    String(garments[mTab].values[oi][1]),
                                  ];
                                  return (
                                    <label key={field}>
                                      <input
                                        inputMode="decimal"
                                        value={measurementInputValue(
                                          mTab,
                                          field,
                                          0,
                                          m[0],
                                        )}
                                        onChange={(e) =>
                                          changeMeasurementInput(
                                            mTab,
                                            field,
                                            0,
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <em>{unit}</em>
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="cm-tr">
                                <b>{t("cust.finished")}</b>
                                {shownFields.map((field) => {
                                  const oi =
                                    garments[mTab].fields.indexOf(field);
                                  const m = measurements[
                                    `${mTab}:${field}`
                                  ] ?? [
                                    String(garments[mTab].values[oi][0]),
                                    String(garments[mTab].values[oi][1]),
                                  ];
                                  return (
                                    <label key={field}>
                                      <input
                                        inputMode="decimal"
                                        value={measurementInputValue(
                                          mTab,
                                          field,
                                          1,
                                          m[1],
                                        )}
                                        onChange={(e) =>
                                          changeMeasurementInput(
                                            mTab,
                                            field,
                                            1,
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <em>{unit}</em>
                                    </label>
                                  );
                                })}
                              </div>
                              {!isPaper && (
                                <div className="cm-tr ease">
                                  <b>{t("cust.ease")}</b>
                                  {garments[mTab].fields.map((field, index) => {
                                    const m = measurements[
                                      `${mTab}:${field}`
                                    ] ?? [
                                      String(garments[mTab].values[index][0]),
                                      String(garments[mTab].values[index][1]),
                                    ];
                                    const ease = Number(m[1]) - Number(m[0]);
                                    return (
                                      <strong key={field}>
                                        {Number.isFinite(ease)
                                          ? ease.toFixed(1)
                                          : "0.0"}
                                      </strong>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="cm-table-split">
                            {[
                              shownFields.slice(0, Math.ceil(shownFields.length / 2)),
                              shownFields.slice(Math.ceil(shownFields.length / 2)),
                            ]
                              .filter((fields) => fields.length > 0)
                              .map((fields, index) => (
                                <div className="cm-table-wrap" key={`measurement-group-${index}`}>
                                  {renderSplitMeasurementTable(fields, corner)}
                                </div>
                              ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
              {lookupOpen && (
                <div
                  className="lookup-modal-backdrop"
                  onClick={() => setLookupOpen(false)}
                  role="presentation"
                >
                  <div
                    className="lookup-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("home.searchExistingCustomer")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="lookup-modal-close"
                      onClick={() => setLookupOpen(false)}
                      aria-label={t("common.close")}
                    >
                      ×
                    </button>
                    <div className="lookup-head">
                      <small>{t("home.searchExistingCustomer")}</small>
                      <div>
                        <input
                          value={lookupName}
                          onChange={(e) => setLookupName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") searchCustomers();
                          }}
                          placeholder={t("cust.searchName")}
                        />
                        <button onClick={searchCustomers}>{t("common.search")}</button>
                      </div>
                    </div>
                    {lookupResults.length > 0 && (
                      <div className="lookup-results">
                        {lookupResults.map((c) => (
                          <button
                            key={c.id}
                            className="lookup-item"
                            onClick={() => loadCustomer(c)}
                          >
                            <span className="avatar-mini">
                              {c.avatarUrl ? (
                                <img src={c.avatarUrl} alt="" />
                              ) : (
                                c.name
                                  .trim()
                                  .split(/\s+/)
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              )}
                            </span>
                            <span className="lookup-meta">
                              <b>{c.name}</b>
                              <em>
                                {c.height || "—"} cm · {c.weight || "—"} kg
                              </em>
                            </span>
                            <i>{c.channelCode || t("cust.noChannel")}</i>
                          </button>
                        ))}
                      </div>
                    )}
                    {recentSearches.length > 0 && (
                      <div className="recent-customer-searches">
                        <small>{loc === "zh" ? "最近搜索" : "Recent searches"}</small>
                        <div className="recent-customer-searches-list">
                          {recentSearches.map((query) => (
                            <button
                              key={query}
                              type="button"
                              className="recent-customer-search"
                              onClick={() => {
                                setLookupName(query);
                                void searchCustomersFor(query);
                              }}
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
            {formOpen && (
              <div className="profile-save-bar">
                <div>
                  {profileSaveMessage && profileSaveMessage !== t("cust.saved") && (
                    <b
                      className="error"
                    >
                      {profileSaveMessage}
                    </b>
                  )}
                  {profileSavedAt && (
                    <small>
                      {t("cust.savedAt")}：
                      {new Date(profileSavedAt).toLocaleString(loc)}
                    </small>
                  )}
                </div>
                {loadedCustomer ? (
                  <div className="profile-save-options">
                    <button onClick={saveCustomerProfile} disabled={profileSaving}>
                      {profileSaving
                        ? t("cust.saving")
                        : loc === "zh"
                          ? "替换旧档案"
                          : "Replace saved profile"}
                    </button>
                    <button
                      type="button"
                      className="keep-order-options"
                      onClick={keepCustomerProfileForOrder}
                      disabled={profileSaving}
                    >
                      {loc === "zh" ? "保留新档案" : "Keep new profile"}
                    </button>
                  </div>
                ) : (
                  <button onClick={saveCustomerProfile} disabled={profileSaving}>
                    {profileSaving ? t("cust.saving") : t("cust.saveProfile")}
                  </button>
                )}
              </div>
            )}
            {(profileSaveMessage === t("cust.saved") || profileKeptForOrder) && (
              <div className="profile-save-success" role="status" aria-live="polite">
                <span aria-hidden="true">✓</span>
                <div>
                  <b>{profileKeptForOrder ? (loc === "zh" ? "已保留本次新选项" : "Kept for this order") : loc === "zh" ? "档案保存成功" : "Profile saved"}</b>
                  <small>{profileKeptForOrder ? (loc === "zh" ? "老客户档案未被修改" : "The saved customer profile was not changed") : loc === "zh" ? "客户资料已同步" : "Customer details are up to date"}</small>
                </div>
              </div>
            )}
            <div hidden={!fabricFirst}>
              <FabricFirst
                search={fabricSearch}
                setSearch={setFabricSearch}
                onQuickSelect={
                  fabricEditItemKey
                    ? (code) => {
                        const fabric = [
                          ...fabricsByGarment.jacket,
                          ...fabricsByGarment.trousers,
                          ...fabricsByGarment.waistcoat,
                          ...fabricsByGarment.shirt,
                        ].find((entry) => entry.code === code);
                        const nextFabricPrice = getFabricPrice(code);
                        setPiItems((prev) =>
                          prev.map((item) =>
                            item.key === fabricEditItemKey
                              ? {
                                  ...item,
                                  fabricCode: code,
                                  fabricName: fabric?.name,
                                  fabricMill: fabric?.mill,
                                  fabricPrice: nextFabricPrice,
                                  productPrice:
                                    item.basePrice +
                                    nextFabricPrice +
                                    item.optionExtra,
                                }
                              : item,
                          ),
                        );
                        const editingItem = piItems.find(
                          (item) => item.key === fabricEditItemKey,
                        );
                        if (editingItem?.garmentType) {
                          setFabricByGarment((prev) => ({
                            ...prev,
                            [editingItem.garmentType!]: code,
                          }));
                        }
                        setFabricEditItemKey(undefined);
                        setFabricFirst(false);
                        requestAnimationFrame(() => {
                          document
                            .querySelector(".pi-preview")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        });
                      }
                    : undefined
                }
                onContinue={(key, code) => {
                  fabricPageScrollY.current = window.scrollY;
                  setGarment(key);
                  setFabricByGarment({ ...fabricByGarment, [key]: code });
                  setFabricFirst(false);
                  setStep("style");
                }}
                onFabricOnly={addFabricToPi}
              />
            </div>
            {!fabricFirst && (
              <>
                <div className="chosen-fabric-bar">
                  <button
                    onClick={() => {
                      setFabricFirst(true);
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          window.scrollTo({
                            top: fabricPageScrollY.current,
                            behavior: "auto",
                          });
                        });
                      });
                    }}
                  >
                    ← {t("home.reselectFabric")}
                  </button>
                  {currentFabric && (
                    <div className="chosen-fabric-details">
                      <header>
                        <small>{currentFabric.mill}</small>
                        <em>
                          {currentFabric.code === "WC-MATCH-01"
                            ? t("home.sameAsJacket")
                            : `${money(getFabricPrice(currentFabric.code))}/${t("pi.meters")}`}
                        </em>
                      </header>
                      <b>
                        {fabricDisplayName(
                          currentFabric.name,
                          loc,
                          STYLBIELLA_FABRIC_COLORS[currentFabric.code]?.color,
                        )}
                      </b>
                      <p>{fabricDisplayCode(currentFabric)}</p>
                      <span>{fabricSpecification(currentFabric.meta, loc)}</span>
                    </div>
                  )}
                  {currentFabric && (
                    <button
                      className="fabric-confirm-thumb"
                      onClick={() => setFabricZoom(true)}
                      title={`${t("home.currentFabric")}：${currentFabric.name}（${currentFabric.code}）`}
                      aria-label={`${t("home.currentFabric")} ${currentFabric.code}`}
                    >
                      <span
                        className={`mini-swatch ${currentFabric.tone}`}
                        style={{
                          backgroundColor:
                            STYLBIELLA_FABRIC_COLORS[currentFabric.code]?.hex,
                        }}
                      >
                        {currentFabric.imageUrl ? (
                          <img
                            src={currentFabric.imageUrl}
                            alt={`${currentFabric.name} ${currentFabric.code}`}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </span>
                      <em>{t("home.clickZoom")}</em>
                    </button>
                  )}
                  {fabricZoom && currentFabric?.imageUrl && (
                    <div
                      className="fabric-preview-zoom"
                      role="dialog"
                      aria-modal="true"
                      aria-label={`${currentFabric.name} ${currentFabric.code}`}
                      onClick={() => setFabricZoom(false)}
                    >
                      <button
                        aria-label={t("common.close")}
                        onClick={() => setFabricZoom(false)}
                      >
                        ×
                      </button>
                      <img
                        src={currentFabric.imageUrl}
                        alt={`${currentFabric.name} ${currentFabric.code}`}
                      />
                      <p>
                        {currentFabric.name} ·{" "}
                        {fabricDisplayCode(currentFabric)}
                      </p>
                    </div>
                  )}
                </div>
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="eyebrow">{active.en.toUpperCase()}</p>
                      <h2>
                        {tailoringTerm(active.name, loc)}
                        {t("home.styleTab")}
                      </h2>
                      <p className="style-zoom-hint">{t("home.doubleClickZoom")}</p>
                    </div>
                  </div>
                  <div className="styles">
                    {groupRows
                      ? groupRows.map((row, ri) => {
                          const rowTotal = row.reduce(
                            (s, t) =>
                              s +
                              (optionGroups.find((g) => g.title === t)?.items
                                .length ?? 0),
                            0,
                          );
                          const rowColumns = garment === "trousers" ? 9 : 8;
                          const gBase = Math.floor(rowColumns / row.length);
                          const gRem = rowColumns - gBase * row.length;
                          return (
                            <div
                               className={`group-row ${
                                 garment === "trousers"
                                   ? "trousers-group-row"
                                   : ""
                               } ${
                                 garment === "trousers" &&
                                 row.includes("侧兜") &&
                                 row.includes("后兜")
                                   ? "trousers-detail-row"
                                   : ""
                               } ${
                                 garment === "jacket" &&
                                 row.includes("纽扣钉法") &&
                                 row.includes("胸兜款式")
                                   ? "pocket-button-row"
                                   : garment === "jacket" &&
                                       row.includes("纽扣钉法")
                                     ? "button-config-row"
                                     : ""
                               } ${
                                 garment === "jacket" &&
                                 row.includes("穿着习惯") &&
                                 row.includes("香水垫")
                                   ? "jacket-detail-row"
                                   : ""
                               } ${
                                 garment === "jacket" &&
                                 row.includes("驳头款式") &&
                                 row.includes("下摆开角大小")
                                   ? "lapel-front-row"
                                   : ""
                               } ${
                                 garment === "shirt" &&
                                row.includes("前幅门襟")
                                  ? "shirt-placket-row"
                                  : ""
                              } ${
                                garment === "shirt" &&
                                row.includes("侧缝工艺")
                                  ? "shirt-optional-row"
                                  : ""
                              }`}
                              data-button-label={
                                garment === "jacket" &&
                                row.includes("纽扣钉法") &&
                                row.includes("胸兜款式")
                                  ? tailoringTerm("纽扣选择", loc)
                                  : undefined
                              }
                              key={ri}
                            >
                              {row.map((title, j) => {
                                const group = optionGroups.find(
                                  (g) => g.title === title,
                                );
                                return group
                                  ? ((group) => {
                                      const groupKey = `${garment}:${group.title}`;
                                      const chosen = selected[groupKey];
                                      const isJacketDetailSelect =
                                        garment === "jacket" &&
                                        row.includes("穿着习惯") &&
                                        row.includes("香水垫");
                                      const span =
                                        rowTotal === rowColumns
                                          ? group.items.length
                                          : gBase + (j < gRem ? 1 : 0);
                                      return (
                                        <div
                                          className="group"
                                          key={group.title}
                                          style={{ gridColumn: `span ${span}` }}
                                        >
                                          <div>
                                            {garment === "jacket" &&
                                            group.title === "纽扣数量" ? (
                                              <div
                                                className="buttonhole-direction-picker"
                                                role="group"
                                                aria-label="扣眼方向"
                                              >
                                                {["直扣眼", "斜扣眼"].map((item) => (
                                                  <button
                                                    type="button"
                                                    key={item}
                                                    className={
                                                      selected["jacket:扣眼方向"] === item
                                                        ? "selected"
                                                        : ""
                                                    }
                                                    onClick={() =>
                                                      setSelected({
                                                        ...selected,
                                                        "jacket:扣眼方向": item,
                                                      })
                                                    }
                                                  >
                                                    {tailoringTerm(
                                                      item,
                                                      loc,
                                                      "扣眼方向",
                                                    )}
                                                  </button>
                                                ))}
                                              </div>
                                            ) : (
                                              <h3 aria-label={tailoringTerm(group.title, loc)}>
                                                {garment === "jacket" &&
                                                (group.title === "纽扣钉法" ||
                                                  group.title === "纽扣选择")
                                                  ? null
                                                  : tailoringTerm(group.title, loc)}
                                              </h3>
                                            )}
                                          </div>
                                          <div className="options">
                                            {garment === "shirt" &&
                                            group.title === "字体" ? (
                                              <label className="embroidery-font-input">
                                                <span>{t("home.embroideryText")}</span>
                                                <input
                                                  value={embroideryFont}
                                                  onChange={(event) =>
                                                    setEmbroideryFont(event.target.value)
                                                  }
                                                  placeholder={t("home.embroideryPlaceholder")}
                                                />
                                              </label>
                                            ) : null}
                                            {(garment === "jacket" &&
                                              JACKET_DROPDOWN_GROUPS.has(group.title)) ||
                                            (garment === "waistcoat" &&
                                              WAISTCOAT_DROPDOWN_GROUPS.has(group.title)) ||
                                            (garment === "trousers" &&
                                              TROUSER_DROPDOWN_GROUPS.has(group.title)) ? (
                                              garment === "jacket" &&
                                              group.title === "纽扣数量" ? (
                                                <div
                                                  className="button-count-picker"
                                                  role="group"
                                                  aria-label={tailoringTerm(group.title, loc)}
                                                >
                                                  {group.items.map((item) => (
                                                    <button
                                                      type="button"
                                                      key={item}
                                                      className={chosen === item ? "selected" : ""}
                                                      onClick={() =>
                                                        setSelected({
                                                          ...selected,
                                                          [groupKey]: item,
                                                        })
                                                      }
                                                    >
                                                      {item}
                                                    </button>
                                                  ))}
                                                </div>
                                              ) : (
                                                <label
                                                  className={`compact-option-select ${
                                                    garment === "jacket" &&
                                                    group.title === "纽扣选择"
                                                      ? "wrap-selected-value"
                                                      : garment === "jacket" &&
                                                          group.title === "驳头宽"
                                                        ? "lapel-wrap-selected-value"
                                                      : isJacketDetailSelect
                                                        ? "detail-wrap-selected-value"
                                                        : ""
                                                  }`}
                                                >
                                                  <select
                                                    aria-label={tailoringTerm(group.title, loc)}
                                                    value={chosen ?? ""}
                                                    onChange={(event) =>
                                                      setSelected({
                                                        ...selected,
                                                        [groupKey]: event.target.value,
                                                      })
                                                    }
                                                  >
                                                    {group.items.map((item) => (
                                                      <option key={item} value={item}>
                                                        {tailoringTerm(item, loc, group.title)}
                                                      </option>
                                                    ))}
                                                  </select>
                                                  {(garment === "jacket" &&
                                                    group.title === "纽扣选择") ||
                                                  (garment === "jacket" &&
                                                    group.title === "驳头宽") ||
                                                  isJacketDetailSelect ? (
                                                    <span
                                                      className="compact-selected-value"
                                                      aria-hidden="true"
                                                    >
                                                      {tailoringTerm(
                                                        chosen ?? "",
                                                        loc,
                                                        group.title,
                                                      )}
                                                    </span>
                                                  ) : null}
                                                </label>
                                              )
                                            ) : group.items.map((item) => {
                                              const optImg =
                                                garment === "shirt"
                                                  ? shirtOptionImageUrl(
                                                      group.title,
                                                      item,
                                                    )
                                                  : suitOptionImageUrl(
                                                      group.title,
                                                      item,
                                                    );
                                              const surcharge =
                                                optionSurcharge(
                                                  garment,
                                                  optionGroups.findIndex(
                                                    (candidate) =>
                                                      candidate.title === group.title,
                                                  ),
                                                  group.items.indexOf(item),
                                                );
                                              if (
                                                garment === "shirt" &&
                                                group.title === "字体" &&
                                                item === "图片"
                                              ) {
                                                return (
                                                  <label
                                                    className={`embroidery-image-upload ${chosen === item ? "selected" : ""}`}
                                                    key={item}
                                                  >
                                                    <span className="opt-thumb">
                                                      {embroideryImageUrl ? (
                                                        <img
                                                          src={embroideryImageUrl}
                                                          alt="刺绣图片预览"
                                                        />
                                                      ) : optImg ? (
                                                        <img
                                                          src={optImg}
                                                          alt={item}
                                                        />
                                                      ) : null}
                                                    </span>
                                                    <b>{t("home.uploadEmbroideryImage")}</b>
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={(event) => {
                                                        const file =
                                                          event.target.files?.[0];
                                                        if (!file) return;
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                          setEmbroideryImageUrl(
                                                            String(reader.result),
                                                          );
                                                          setSelected({
                                                            ...selected,
                                                            [groupKey]: "图片",
                                                          });
                                                        };
                                                        reader.readAsDataURL(file);
                                                      }}
                                                    />
                                                  </label>
                                                );
                                              }
                                              return (
                                                <button
                                                  key={item}
                                                  className={`${chosen === item ? "selected" : ""} ${OPTIONAL_SHIRT_GROUPS.has(group.title) ? "optional-choice" : ""} has-img`}
                                                  onClick={() => {
                                                    const next = { ...selected };
                                                    if (
                                                      garment === "shirt" &&
                                                      OPTIONAL_SHIRT_GROUPS.has(
                                                        group.title,
                                                      ) &&
                                                      chosen === item
                                                    )
                                                      delete next[groupKey];
                                                    else next[groupKey] = item;
                                                    setSelected(next);
                                                  }}
                                                  onDoubleClick={() =>
                                                    optImg &&
                                                    setStyleZoom({
                                                      src: optImg,
                                                      label: item,
                                                    })
                                                  }
                                                >
                                                  <span className="opt-thumb">
                                                    {optImg ? (
                                                      <img
                                                        src={optImg}
                                                        alt={item}
                                                        loading="lazy"
                                                      />
                                                    ) : (
                                                      <i>{t("home.noImage")}</i>
                                                    )}
                                                    {surcharge > 0 ? (
                                                      <span className="opt-surcharge-note">
                                                        +{money(surcharge)}
                                                      </span>
                                                    ) : null}
                                                  </span>
                                                  <b>{tailoringTerm(item, loc, group.title)}</b>
                                                  {chosen === item && (
                                                    <em>
                                                      {t("home.selected")}
                                                    </em>
                                                  )}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })(group)
                                  : null;
                              })}
                              {garment === "jacket" &&
                              row.includes("穿着习惯") &&
                              row.includes("香水垫") ? (
                                <div className="jacket-embroidery-fields">
                                  <h3>{loc === "zh" ? "刺绣信息" : "Embroidery"}</h3>
                                  <div className="jacket-embroidery-inputs">
                                    <label>
                                      <span>{loc === "zh" ? "刺绣文字" : "Text"}</span>
                                      <input
                                        value={embroideryDetails.jacket?.text ?? ""}
                                        onChange={(event) =>
                                          setEmbroideryDetails((previous) => ({
                                            ...previous,
                                            jacket: {
                                              text: event.target.value,
                                              color: previous.jacket?.color ?? "",
                                            },
                                          }))
                                        }
                                        placeholder={loc === "zh" ? "输入文字" : "Enter text"}
                                      />
                                    </label>
                                    <label>
                                      <span>{loc === "zh" ? "刺绣颜色" : "Colour"}</span>
                                      <input
                                        value={embroideryDetails.jacket?.color ?? ""}
                                        onChange={(event) =>
                                          setEmbroideryDetails((previous) => ({
                                            ...previous,
                                            jacket: {
                                              text: previous.jacket?.text ?? "",
                                              color: event.target.value,
                                            },
                                          }))
                                        }
                                        placeholder={loc === "zh" ? "例如：金色" : "e.g. Gold"}
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      : optionGroups.map((group) => {
                          const groupKey = `${garment}:${group.title}`;
                          const chosen = selected[groupKey];
                          return (
                            <div className="group" key={group.title}>
                              <div>
                                <h3>{tailoringTerm(group.title, loc)}</h3>
                              </div>
                              <div className="options">
                                {group.items.map((item) => {
                                  const optImg =
                                    garment === "shirt"
                                      ? shirtOptionImageUrl(group.title, item)
                                      : suitOptionImageUrl(group.title, item);
                                  const surcharge =
                                    optionSurcharge(
                                      garment,
                                      optionGroups.findIndex(
                                        (candidate) =>
                                          candidate.title === group.title,
                                      ),
                                      group.items.indexOf(item),
                                    );
                                  return (
                                    <button
                                      key={item}
                                      className={`${chosen === item ? "selected" : ""} has-img`}
                                      onClick={() =>
                                        setSelected({
                                          ...selected,
                                          [groupKey]: item,
                                        })
                                      }
                                      onDoubleClick={() =>
                                        optImg &&
                                        setStyleZoom({ src: optImg, label: item })
                                      }
                                    >
                                      <span className="opt-thumb">
                                        {optImg ? (
                                          <img
                                            src={optImg}
                                            alt={item}
                                            loading="lazy"
                                          />
                                        ) : (
                                          <i>{t("home.noImage")}</i>
                                        )}
                                        {surcharge > 0 ? (
                                          <span className="opt-surcharge-note">
                                            +{money(surcharge)}
                                          </span>
                                        ) : null}
                                      </span>
                                      <b>{tailoringTerm(item, loc, group.title)}</b>
                                      {chosen === item && (
                                        <em>{t("home.selected")}</em>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    <label className="style-note-field">
                      <span>{t("cust.notes")}</span>
                      <textarea
                        value={styleNotes[garment] ?? ""}
                        onChange={(event) =>
                          setStyleNotes((prev) => ({
                            ...prev,
                            [garment]: event.target.value,
                          }))
                        }
                        maxLength={1000}
                        rows={4}
                        placeholder={t("home.styleNotePlaceholder")}
                      />
                      <small>{(styleNotes[garment] ?? "").length}/1000</small>
                    </label>
                    <div className="styles-price">
                      <PriceBreakdown
                        garment={garment}
                        fabricCode={fabricByGarment[garment]}
                        fabricMeters={fabricMeters}
                        fabricUnitPrice={fabricUnitPrice}
                        optionGroups={optionGroups}
                        selected={selected}
                        total={productPrice}
                      />
                    </div>
                    <div className="notice pi-add" style={{ marginTop: 10 }}>
                      <span>◈</span>
                      <div>
                        <b>{t("home.joinPiTitle")}</b>
                        <p>
                          {t("home.joinPiSub")}
                          {tailoringTerm(active.name, loc)}
                          {t("home.joinPiSub2")}
                        </p>
                      </div>
                      <button onClick={addToPi}>
                        {piMsg ?? `${t("home.joinPi")}　＋`}
                      </button>
                    </div>
                  </div>
                  {styleZoom && (
                    <div
                      className="fabric-preview-zoom style-option-zoom"
                      role="dialog"
                      aria-modal="true"
                      aria-label={`${styleZoom.label} 放大图片`}
                      onClick={() => setStyleZoom(null)}
                    >
                      <button
                        aria-label="关闭放大图片"
                        onClick={() => setStyleZoom(null)}
                      >
                        ×
                      </button>
                      <img src={styleZoom.src} alt={styleZoom.label} />
                      <p>{styleZoom.label}</p>
                    </div>
                  )}
                </section>
              </>
            )}
            <PiPreview
              customerName={customerName}
              channelCode={channelCode}
              countryLabel={selectedCountryName}
              countryCode={country}
              region={region}
              city={city}
              street={street}
              postalCode={postalCode}
              items={piItems}
              onRemove={(key) =>
                setPiItems((prev) => prev.filter((item) => item.key !== key))
              }
              onReselectFabric={(item) => {
                if (!item.garmentType) return;
                setGarment(item.garmentType);
                setFabricEditItemKey(item.key);
                setFabricFirst(true);
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    window.scrollTo({
                      top: fabricPageScrollY.current,
                      behavior: "smooth",
                    });
                  });
                });
              }}
              onReselectStyle={(item) => {
                if (!item.garmentType) return;
                setStyleEditItemKey(item.key);
                setGarment(item.garmentType);
                setFabricByGarment((prev) => ({
                  ...prev,
                  [item.garmentType!]: item.fabricCode,
                }));
                setSelected((prev) => {
                  const next = Object.fromEntries(
                    Object.entries(prev).filter(
                      ([key]) => !key.startsWith(`${item.garmentType}:`),
                    ),
                  );
                  validPiOptions(item).forEach((option) => {
                    if (
                      option.group !== "刺绣文字" &&
                      option.group !== "刺绣颜色" &&
                      option.group !== "备注"
                    ) {
                      next[`${item.garmentType}:${option.group}`] = option.item;
                    }
                  });
                  return next;
                });
                setEmbroideryFont(
                  item.garmentType === "shirt"
                    ? validPiOptions(item).find((option) => option.group === "刺绣文字")?.item ?? ""
                    : "",
                );
                setEmbroideryDetails((previous) => ({
                  ...previous,
                  [item.garmentType!]: {
                    text:
                      validPiOptions(item).find((option) => option.group === "刺绣文字")?.item ??
                      "",
                    color:
                      validPiOptions(item).find((option) => option.group === "刺绣颜色")?.item ??
                      "",
                  },
                }));
                setStyleNotes((prev) => ({
                  ...prev,
                  [item.garmentType!]:
                    validPiOptions(item).find((option) => option.group === "备注")?.item ?? "",
                }));
                setFabricFirst(false);
                setStep("style");
                requestAnimationFrame(() => {
                  document
                    .querySelector(".chosen-fabric-bar")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              customerHeight={customerHeight}
              customerWeight={customerWeight}
              customerAvatar={avatarUrl}
              country={country}
              setCountry={setCountry}
              setRegion={setRegion}
              setCity={setCity}
              setStreet={setStreet}
              setPostalCode={setPostalCode}
              orderWeight={orderWeight}
              shippingFee={shippingFee}
              rateLabel={quote.label}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Notice({
  text,
  sub,
  action,
  onClick,
}: {
  text: string;
  sub: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="notice">
      <span>↻</span>
      <div>
        <b>{text}</b>
        <p>{sub}</p>
      </div>
      <button onClick={onClick}>{action}</button>
    </div>
  );
}

function PriceBreakdown({
  garment,
  fabricCode,
  fabricMeters,
  fabricUnitPrice,
  optionGroups,
  selected,
  total,
}: {
  garment: GarmentKey;
  fabricCode?: string;
  fabricMeters: number | null;
  fabricUnitPrice: number;
  optionGroups: (typeof optionsByGarment)[GarmentKey];
  selected: Record<string, string>;
  total: number;
}) {
  const { loc, t } = useLocale();
  const { money, updatedAt, source } = useCurrency();
  const extras = optionGroups.flatMap((group, groupIndex) => {
    const item = selected[`${garment}:${group.title}`];
    const itemIndex = group.items.indexOf(item);
    const price =
      itemIndex >= 0 ? optionSurcharge(garment, groupIndex, itemIndex) : 0;
    return price ? [{ group: group.title, item, price }] : [];
  });
  return (
    <section className="price-breakdown">
      <div className="price-title">
        <div>
          <p className="eyebrow">{t("pi.livePrice")}</p>
          <h3>{t("pi.currentPrice")}</h3>
        </div>
        <strong>{money(total)}</strong>
      </div>
      <div className="price-lines">
        <span>
          <i>
            {tailoringTerm(garments[garment].name, loc)} · {t("pi.baseCost")}
          </i>
          <b>{money(basePrices[garment])}</b>
        </span>
        <span>
          <i>
            {t("pi.fabric")} {fabricCode || "—"}
            {fabricMeters === null
              ? ""
              : ` · ${fabricMeters} ${t("pi.meters")} × ${money(fabricUnitPrice)}/${t("pi.meters")}`}
          </i>
          <b>
            {fabricMeters === null
              ? loc === "zh"
                ? "还未填写量体数值"
                : "Measurements not entered"
              : money(Math.round(fabricUnitPrice * fabricMeters))}
          </b>
        </span>
        {extras.map((extra) => (
          <span key={`${extra.group}:${extra.item}`} className="extra">
            <i>
              {tailoringTerm(extra.group, loc)} · {tailoringTerm(extra.item, loc, extra.group)}
            </i>
            <b>+{money(extra.price)}</b>
          </span>
        ))}
      </div>
      <small className="fx-rate-note">
        {updatedAt ? `${t("currency.latestRate")} · ${new Date(updatedAt).toLocaleDateString(loc)} · ${source}` : t("currency.loadingRate")}
      </small>
    </section>
  );
}

export function CountryRegionFields({
  country,
  region,
  setCountry,
  setRegion,
  idPrefix = "shipping",
}: {
  country: string;
  region: string;
  setCountry: (value: string) => void;
  setRegion: (value: string) => void;
  idPrefix?: string;
}) {
  const { t } = useLocale();
  const countries = Country.getAllCountries().sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const selectedCountry = countries.find((item) => item.isoCode === country);
  const countryDisplay = (item: (typeof countries)[number]) =>
    `${item.name} (${item.isoCode})`;
  const [countryText, setCountryText] = useState(
    selectedCountry ? countryDisplay(selectedCountry) : "",
  );
  const states = country
    ? State.getStatesOfCountry(country).sort((a, b) =>
        a.name.localeCompare(b.name),
      )
    : [];
  const selectedState = states.find(
    (item) =>
      `${country}-${item.isoCode}` === region ||
      item.isoCode === region ||
      item.name === region,
  );
  const stateDisplay = (item: (typeof states)[number]) =>
    `${item.name} (${country}-${item.isoCode})`;
  const [regionText, setRegionText] = useState(
    selectedState ? stateDisplay(selectedState) : region || "",
  );
  useEffect(() => {
    const item = countries.find((entry) => entry.isoCode === country);
    setCountryText(item ? countryDisplay(item) : "");
  }, [country]);
  useEffect(() => {
    const item = states.find(
      (entry) =>
        `${country}-${entry.isoCode}` === region ||
        entry.isoCode === region ||
        entry.name === region,
    );
    setRegionText(item ? stateDisplay(item) : region || "");
  }, [country, region]);
  const changeCountry = (value: string) => {
    setCountryText(value);
    const normalized = value.trim().toLowerCase();
    const match = countries.find(
      (item) =>
        countryDisplay(item).toLowerCase() === normalized ||
        item.isoCode.toLowerCase() === normalized ||
        item.name.toLowerCase() === normalized,
    );
    if (match) {
      if (match.isoCode !== country) setRegion("");
      setCountry(match.isoCode);
    } else {
      setCountry("");
      setRegion("");
    }
  };
  const changeRegion = (value: string) => {
    setRegionText(value);
    if (!states.length) {
      setRegion(value);
      return;
    }
    const normalized = value.trim().toLowerCase();
    const match = states.find(
      (item) =>
        stateDisplay(item).toLowerCase() === normalized ||
        item.isoCode.toLowerCase() === normalized ||
        item.name.toLowerCase() === normalized ||
        `${country}-${item.isoCode}`.toLowerCase() === normalized,
    );
    setRegion(match ? `${country}-${match.isoCode}` : "");
  };
  return (
    <>
      <label>
        <span>
          {t("home.country")} <i>*</i>
        </span>
        <input
          list={`${idPrefix}-iso-country-list`}
          value={countryText}
          onChange={(event) => changeCountry(event.target.value)}
          placeholder={t("home.countrySearch")}
          autoComplete="off"
        />
        <datalist id={`${idPrefix}-iso-country-list`}>
          {countries.map((item) => (
            <option key={item.isoCode} value={countryDisplay(item)} />
          ))}
        </datalist>
      </label>
      <label>
        <span>
          {t("home.region")} <i>*</i>
        </span>
        <input
          list={`${idPrefix}-iso-region-list`}
          value={regionText}
          onChange={(event) => changeRegion(event.target.value)}
          placeholder={
            country
              ? states.length
                ? "搜索州 / 省名称或代码"
                : "输入州 / 省"
              : t("home.selectCountryFirst")
          }
          disabled={!country}
          autoComplete="off"
        />
        <datalist id={`${idPrefix}-iso-region-list`}>
          {states.map((item) => (
            <option
              key={`${country}-${item.isoCode}`}
              value={stateDisplay(item)}
            />
          ))}
        </datalist>
      </label>
    </>
  );
}

function PiPreview({
  customerName,
  channelCode,
  countryLabel,
  countryCode,
  region,
  city,
  street,
  postalCode,
  items,
  onRemove,
  onReselectFabric,
  onReselectStyle,
  customerHeight,
  customerWeight,
  customerAvatar,
  country,
  setCountry,
  setRegion,
  setCity,
  setStreet,
  setPostalCode,
  orderWeight,
  shippingFee,
  rateLabel,
}: {
  customerName: string;
  channelCode: string;
  countryLabel: string;
  countryCode: string;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  items: PiItem[];
  onRemove: (key: string) => void;
  onReselectFabric: (item: PiItem) => void;
  onReselectStyle: (item: PiItem) => void;
  customerHeight: string;
  customerWeight: string;
  customerAvatar?: string | null;
  country: string;
  setCountry: (value: string) => void;
  setRegion: (value: string) => void;
  setCity: (value: string) => void;
  setStreet: (value: string) => void;
  setPostalCode: (value: string) => void;
  orderWeight: number;
  shippingFee: number;
  rateLabel: string;
}) {
  const { loc, t } = useLocale();
  const { currency, money } = useCurrency(countryCode);
  const currentItems = items.map(normalizePiItem);
  const productTotal = currentItems.reduce(
    (sum, item) => sum + item.productPrice,
    0,
  );
  const shippingTotal = currentItems.reduce(
    (sum, item) => sum + item.shippingFee,
    0,
  );
  const total = productTotal + shippingTotal;
  const exportPiSpreadsheet = () => {
    if (currentItems.length === 0) return;
    const issuedAt = new Date();
    const dateLabel = issuedAt.toISOString().slice(0, 10);
    const address = [street, city, region, countryLabel, postalCode]
      .filter(Boolean)
      .join(", ");
    const rows = currentItems
      .map((item, index) => {
        const garmentLabel =
          item.kind === "fabric"
            ? t("pi.fabric")
            : tailoringTerm(item.garmentName ?? "", loc);
        const fabricLabel = [item.fabricCode, item.fabricMill, item.fabricName]
          .filter(Boolean)
          .join(" · ");
        const styles = validPiOptions(item)
          .map(
            (option) => `${piOptionLabel(option.group, loc)}: ${piOptionValue(option, loc)}`,
          )
          .join("<br>");
        return `<tr>
          <td>${index + 1}</td>
          <td>${spreadsheetEscape(garmentLabel)}</td>
          <td>${spreadsheetEscape(fabricLabel)}</td>
          <td class="details">${styles || "—"}</td>
          <td class="money">${spreadsheetEscape(money(item.basePrice))}</td>
          <td class="money">${spreadsheetEscape(money(item.fabricPrice))}</td>
          <td class="money">${spreadsheetEscape(money(item.optionExtra))}</td>
          <td class="money">${spreadsheetEscape(money(item.shippingFee))}</td>
          <td class="money total-cell">${spreadsheetEscape(money(item.productPrice + item.shippingFee))}</td>
        </tr>`;
      })
      .join("");
    const html = `<!doctype html><html><head><meta charset="UTF-8"><style>
      body{font-family:Arial,"Microsoft YaHei",sans-serif;color:#2d241e;margin:24px}
      table{border-collapse:collapse;width:100%}.brand{font-family:Georgia,serif;font-size:22px;letter-spacing:2px;color:#563b2a}
      .title{font-family:Georgia,serif;font-size:26px;color:#563b2a}.meta td{border:1px solid #cbbba8;padding:8px}
      .items th{background:#5b4030;color:#fff;border:1px solid #5b4030;padding:9px;text-align:left}
      .items td{border:1px solid #cbbba8;padding:8px;vertical-align:top}.details{min-width:320px;line-height:1.6}
      .money{text-align:right}.total-cell{font-weight:bold}.grand td{background:#efe7dc;font-weight:bold;font-size:16px}
      .note{color:#756657;font-size:11px;padding-top:12px}
    </style></head><body>
      <table class="meta">
        <tr><td colspan="4" class="brand">VEROSUITS</td><td colspan="5" class="title">PROFORMA INVOICE</td></tr>
        <tr><td><b>${spreadsheetEscape(t("pi.customer"))}</b></td><td colspan="3">${spreadsheetEscape(customerName || "—")}</td><td><b>Date</b></td><td colspan="4">${dateLabel}</td></tr>
        <tr><td><b>${spreadsheetEscape(t("pi.address"))}</b></td><td colspan="8">${spreadsheetEscape(address || "—")}</td></tr>
      </table><br>
      <table class="items">
        <thead><tr><th>#</th><th>${spreadsheetEscape(t("pi.product"))}</th><th>${spreadsheetEscape(t("pi.fabric"))}</th><th>${spreadsheetEscape(t("pi.styles"))}</th><th>${spreadsheetEscape(t("pi.make"))}</th><th>${spreadsheetEscape(t("pi.fabricPrice"))}</th><th>${spreadsheetEscape(t("pi.extra"))}</th><th>${spreadsheetEscape(t("pi.shipping"))}</th><th>${spreadsheetEscape(t("pi.price"))}</th></tr></thead>
        <tbody>${rows}<tr class="grand"><td colspan="8">${spreadsheetEscape(t("pi.total"))}</td><td class="money">${spreadsheetEscape(money(total))}</td></tr></tbody>
      </table>
      <div class="note">Currency: ${currency} · Generated by verosuits</div>
    </body></html>`;
    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeCustomer = (customerName || "customer")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .trim();
    anchor.href = url;
    anchor.download = `PI-${dateLabel}-${safeCustomer || "customer"}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  const exportPiDocument = () => {
    if (currentItems.length === 0) return;
    const dateLabel = new Date().toISOString().slice(0, 10);
    const exportCountryLabel = countryCode === "OTHER"
      ? (loc === "zh" ? "其他国家/地区" : "Other countries / regions")
      : countryLabel;
    const address = [street, city, region, exportCountryLabel, postalCode].filter(Boolean).join(", ");
    const safe = (value: string) => spreadsheetEscape(value || "—");
    const rows = currentItems.map((item) => {
      const garment = item.kind === "fabric" ? t("pi.fabric") : tailoringTerm(item.garmentName ?? "", loc);
      const fabricName = item.fabricName ? fabricDisplayName(item.fabricName, loc) : "";
      const fabric = [item.fabricMill, item.fabricCode, fabricName].filter(Boolean).join(" · ");
      const options = validPiOptions(item).map((option) => `${piOptionLabel(option.group, loc)}: ${piOptionValue(option, loc)}`).join("<br>");
      return `<tr><td>${safe(garment)}<br><small>${safe(fabric)}${options ? `<br>${options}` : ""}</small></td><td class="center">1</td><td class="right">${safe(money(item.productPrice))}</td><td class="right">${safe(money(item.productPrice + item.shippingFee))}</td></tr>`;
    }).join("");
    const piNo = `PI-${dateLabel.replaceAll("-", "")}-${(channelCode || "ORDER").replace(/[^A-Za-z0-9-]/g, "")}`;
    const html = `<!doctype html><html><head><meta charset="UTF-8"><style>
      @page{size:A4;margin:14mm 16mm}body{font-family:"Times New Roman",serif;color:#111;font-size:11pt;line-height:1.25}.seller{text-align:center}.seller h1{font-size:17pt;text-decoration:underline;margin:0 0 5px}.seller p{margin:2px 0;font-size:9.5pt;font-weight:bold}.title{text-align:center;font-size:17pt;font-weight:bold;margin:20px 0 28px}table{border-collapse:collapse;width:100%}.info{margin-bottom:22px}.info td{border:0;padding:2px 0;vertical-align:top}.date{padding-left:24px;white-space:nowrap}.items th,.items td{border:1px solid #222;padding:7px 8px;vertical-align:top}.items th{text-align:center;font-weight:normal}.items small{font-size:9pt;line-height:1.35}.center{text-align:center}.right{text-align:right}.total-label{text-align:right;font-weight:bold}.total-amount{font-weight:bold;text-align:right}.terms{margin:8px 0 25px;padding-left:21px}.terms li{padding:1px 0}.bank{margin-left:36px}.bank h3{font-size:11pt;font-weight:normal;margin:0 0 10px}.bank p{margin:0}.muted{font-size:9pt;color:#555}
    </style></head><body><section class="seller"><h1>VEROSUITS</h1><p>MADE TO MEASURE AND PRIVATE LABEL TAILORING</p></section><div class="title">PROFORMA INVOICE</div><table class="info"><tr><td><b>BUYER:</b>&nbsp;&nbsp;${safe(customerName)}</td><td class="date"><b>DATE:</b>&nbsp;&nbsp;${dateLabel}</td></tr><tr><td><b>ADD:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${safe(address)}</td><td></td></tr><tr><td><b>TEL:</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${safe(channelCode)}</td><td></td></tr><tr><td><b>PI NO.:</b>&nbsp;&nbsp;${safe(piNo)}</td><td></td></tr><tr><td><b>CONTRACT NO.:</b>&nbsp;&nbsp;${safe(channelCode)}</td><td></td></tr></table><table class="items"><thead><tr><th style="width:48%">COMMODITY &amp; SPECIFICATION</th><th style="width:13%">QUANTITY<br>(PCS)</th><th style="width:19%">UNIT PRICE<br>(${safe(currency)}/PC)</th><th style="width:20%">TOTAL AMOUNT<br>(${safe(currency)})</th></tr></thead><tbody>${rows}<tr><td colspan="3" class="total-label">TOTAL AMOUNT</td><td class="total-amount">${safe(money(total))}</td></tr></tbody></table><ol class="terms"><li>PACKING &amp; QUANTITY: TO BE CONFIRMED</li><li>LOADING PORT: CHINA</li><li>DISCHARGE PORT: ${safe(exportCountryLabel || "TO BE CONFIRMED")}</li><li>DELIVERY: TO BE CONFIRMED</li><li>PRODUCT ORIGIN: CHINA</li><li>PAYMENT TERMS: TO BE CONFIRMED</li><li>HS CODE: TO BE CONFIRMED</li><li>PRICE VALIDITY: 15 DAYS FROM INVOICE DATE</li></ol><section class="bank"><h3>BANK INFORMATION:</h3><p class="muted">Bank beneficiary details will be added when merchant payment settings are configured.</p></section></body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${piNo}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  const [results, setResults] = useState<
    Record<string, { loading: boolean; image: string | null; error: string }>
  >({});
  const [suiteLoading, setSuiteLoading] = useState(false);
  const [suiteImage, setSuiteImage] = useState<string | null>(null);
  const [suiteZoom, setSuiteZoom] = useState(false);
  const [suiteSelect, setSuiteSelect] = useState("");
  const hasAvatar = !!customerAvatar;
  const buildPrompt = (item: PiItem): string => {
    const fab = item.fabricCode
      ? [
          ...fabricsByGarment.jacket,
          ...fabricsByGarment.trousers,
          ...fabricsByGarment.waistcoat,
          ...fabricsByGarment.shirt,
        ].find((f) => f.code === item.fabricCode)
      : undefined;
    const g = (item.garmentType ?? "jacket") as GarmentKey;
    const garmentEn = {
      jacket: "suit jacket",
      trousers: "dress trousers",
      waistcoat: "waistcoat",
      shirt: "dress shirt",
    }[g];
    const toneEn = TONE_EN[fab?.tone ?? ""] ?? fab?.tone ?? "fine suiting";
    const fabricDesc = fab
      ? `${toneEn} fabric (code ${item.fabricCode}, mill ${fab.mill || "custom"})`
      : `fabric (code ${item.fabricCode})`;
    const modeTxt =
      item.kind === "fabric"
        ? `A folded stack of premium ${fabricDesc} on a clean pure white background, flat lay, product photography, no model, no person`
        : hasAvatar
          ? `A male model wearing a tailored ${garmentEn} made of ${fabricDesc}, photographed strictly from the neck down, with the entire head and face outside the frame`
          : `A single ${garmentEn} made of ${fabricDesc}, displayed flat lay on a clean pure white background, product photography, no model, no person`;
    const currentOptions = validPiOptions(item);
    const styleTxt = currentOptions.length
      ? `, garment custom options, must match exactly: ${currentOptions.map((o) => `${o.group}: ${o.item}`).join("; ")}`
      : "";
    const sizeTxt = item.measurements.length
      ? `, garment measurements in cm: ${item.measurements.map((m) => `${m.field} net ${m.net || "-"} / finished ${m.finished || "-"}`).join(", ")}`
      : "";
    const bodyTxt = hasAvatar
      ? `, client body: height ${customerHeight || "185"}cm, weight ${customerWeight || "78"}kg, model physique should match this body proportion`
      : "";
    return `${modeTxt}${styleTxt}${sizeTxt}${bodyTxt}, ultra detailed, high resolution, realistic fabric texture, professional menswear photography, soft studio lighting, no visible face, no facial features, no head in frame, no text, no watermark, no logo`.trim();
  };
  // 西装上衣只参考正反面款式：正面款式组 + 反面（后背/开衩）款式组
  const JACKET_FRONT_GROUPS = [
    "正面款式",
    "胸兜款式",
    "下摆开角大小",
    "肩膀样式",
    "口袋款式",
    "驳头款式",
  ];
  const JACKET_BACK_GROUPS = ["西服背面款式", "西服开衩选择"];
  const optionRefImages = (item: PiItem): string[] => {
    if (item.kind === "fabric") return [];
    const g = item.garmentType ?? "jacket";
    const currentOptions = validPiOptions(item);
    const list: string[] = [];
    if (g === "jacket") {
      const pick = (groups: string[]) => {
        for (const group of groups) {
          const opt = currentOptions.find((o) => o.group === group);
          if (opt) {
            const url = suitOptionImageUrl(opt.group, opt.item);
            if (url) return url;
          }
        }
        return null;
      };
      const front = pick(JACKET_FRONT_GROUPS);
      const back = pick(JACKET_BACK_GROUPS);
      if (front) list.push(front);
      if (back) list.push(back);
      return list;
    }
    for (const opt of currentOptions) {
      const url =
        g === "shirt"
          ? shirtOptionImageUrl(opt.group, opt.item)
          : suitOptionImageUrl(opt.group, opt.item);
      if (url) list.push(url);
      if (list.length >= 4) break;
    }
    return list;
  };
  const toDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };
  const collectRefs = async (item: PiItem): Promise<string[]> => {
    const refs: string[] = [];
    for (const url of optionRefImages(item)) {
      try {
        refs.push(await toDataUrl(url));
      } catch {
        /* 忽略无法读取的参考图 */
      }
    }
    return refs;
  };
  const generateOne = async (item: PiItem) => {
    if (!item.fabricCode) {
      setResults((prev) => ({
        ...prev,
        [item.key]: { loading: false, image: null, error: "未选择面料" },
      }));
      return;
    }
    setResults((prev) => ({
      ...prev,
      [item.key]: { loading: true, image: null, error: "" },
    }));
    try {
      const referenceImages = await collectRefs(item);
      const data = await apiFetch<{ imageUrl: string }>(
        `/api/generate-image?t=${Date.now()}`,
        {
          method: "POST",
          body: JSON.stringify({
            garment: item.garmentType ?? "jacket",
            prompt: buildPrompt(item),
            style: hasAvatar ? "wear" : "flat",
            referenceImages,
          }),
        },
      );
      setResults((prev) => ({
        ...prev,
        [item.key]: { loading: false, image: data.imageUrl, error: "" },
      }));
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        [item.key]: {
          loading: false,
          image: null,
          error: e instanceof Error ? e.message : "生成失败",
        },
      }));
    }
  };
  const hasGarment = currentItems.some((item) => item.kind === "product");
  const generateAll = async () => {
    if (!hasGarment) {
      alert(t("pi.garmentOnly"));
      return;
    }
    // 只取尚未生成的成衣行，已生成的行不重复生成
    const pending = currentItems.filter(
      (item) => item.kind === "product" && !results[item.key]?.image,
    );
    if (pending.length === 0) return;
    // 立即把每一条未生成的行都标记为「生成中...」
    const marks: Record<
      string,
      { loading: boolean; image: null; error: string }
    > = {};
    pending.forEach((item) => {
      marks[item.key] = { loading: true, image: null, error: "" };
    });
    setResults((prev) => ({ ...prev, ...marks }));
    await Promise.allSettled(pending.map((item) => generateOne(item)));
  };
  const generateSuite = async () => {
    if (currentItems.length === 0) {
      alert(t("pi.pending"));
      return;
    }
    if (!hasGarment) {
      alert(t("pi.garmentOnly"));
      return;
    }
    // 解析用户选择的序号（默认全部成衣行）
    let selectedRows = currentItems.map((item, idx) => ({ item, idx }));
    if (suiteSelect.trim()) {
      const nums = suiteSelect
        .split(/[,，\s]+/)
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= currentItems.length);
      if (nums.length === 0) {
        alert(t("pi.invalidRows"));
        return;
      }
      selectedRows = selectedRows.filter(({ idx }) => nums.includes(idx + 1));
    }
    const productSel = selectedRows.filter(
      (row) => row.item.kind === "product",
    );
    // 同一部位不能重复选择（如多件西装）
    const types = productSel.map((row) => row.item.garmentType).filter(Boolean);
    if (new Set(types).size !== types.length) {
      alert(t("pi.duplicateType"));
      return;
    }
    if (productSel.length === 0) {
      alert(t("pi.noGarment"));
      return;
    }
    // 先补齐选中行未生成的单项效果图
    const pending = productSel.filter((row) => !results[row.item.key]?.image);
    if (pending.length) {
      const marks: Record<
        string,
        { loading: boolean; image: null; error: string }
      > = {};
      pending.forEach((row) => {
        marks[row.item.key] = { loading: true, image: null, error: "" };
      });
      setResults((prev) => ({ ...prev, ...marks }));
      await Promise.allSettled(pending.map((row) => generateOne(row.item)));
    }
    setSuiteLoading(true);
    setSuiteImage(null);
    // 参考图：客户头像（如有，优先放第一张保证面容） + 选中行已生成的单项效果图
    const referenceImages = productSel
      .map((row) => results[row.item.key]?.image)
      .filter(Boolean) as string[];
    const parts = productSel.map(
      (row) =>
        ({
          jacket: "suit jacket",
          trousers: "dress trousers",
          waistcoat: "waistcoat",
          shirt: "dress shirt",
        })[row.item.garmentType!],
    );
    const desc = parts.length
      ? `A complete matching made-to-measure suit set consisting of ${[...new Set(parts)].join(", ")}`
      : `A complete matching made-to-measure suit set consisting of suit jacket, dress trousers, waistcoat and dress shirt`;
    const first = productSel[0].item;
    const fab = first.fabricCode
      ? [
          ...fabricsByGarment.jacket,
          ...fabricsByGarment.trousers,
          ...fabricsByGarment.waistcoat,
          ...fabricsByGarment.shirt,
        ].find((f) => f.code === first.fabricCode)
      : undefined;
    const toneEn = TONE_EN[fab?.tone ?? ""] ?? fab?.tone ?? "fine suiting";
    const fabricDesc = fab
      ? `${toneEn} fabric (code ${first.fabricCode}, mill ${fab.mill || "custom"})`
      : `fine suiting fabric`;
    // 无头像时按客户收货国家生成对应人种的 AI 真人模特
    const ETHNICITY: Record<string, string> = {
      UK: "a Caucasian British man",
      US: "a Caucasian American man",
      CA: "a Caucasian Canadian man",
      AU: "a Caucasian Australian man",
      EU: "a Caucasian European man",
      NZ: "a Caucasian New Zealander man",
      OTHER: "a realistic adult man",
    };
    const modelTxt = ETHNICITY[countryCode] ?? "a realistic adult man";
    const modeTxt = `${desc}, all pieces made of ${fabricDesc}, worn by ${modelTxt} whose physique matches client height ${customerHeight || "185"}cm weight ${customerWeight || "78"}kg, photographed strictly from the neck down with the entire head and face outside the frame`;
    const prompt =
      `${modeTxt}, keep each garment identical to the reference images, matching suit set, coordinated tailoring, ultra detailed, high resolution, realistic fabric texture, professional menswear photography, soft studio lighting, no visible face, no facial features, no head in frame, no text, no watermark, no logo`.trim();
    try {
      const data = await apiFetch<{ imageUrl: string }>(
        `/api/generate-image?t=${Date.now()}`,
        {
          method: "POST",
          body: JSON.stringify({
            garment: "jacket",
            prompt,
            style: "wear",
            referenceImages,
          }),
        },
      );
      setSuiteImage(data.imageUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : "生成失败");
    } finally {
      setSuiteLoading(false);
    }
  };
  const genBusy = Object.values(results).some((r) => r.loading);
  return (
    <section className="pi-preview">
      <div className="pi-head">
        <div>
          <p className="eyebrow">{t("pi.eyebrow")}</p>
          <h3>{t("pi.title")}</h3>
        </div>
        <b className="pi-no">{channelCode || "CH"}-DD-MM-序号</b>
      </div>
      {false && <section className="shipping-address">
        <div className="address-title">
          <div>
            <p className="eyebrow">SHIPPING ADDRESS</p>
            <h3>{t("home.shipAddress")}</h3>
          </div>
          <span>{t("home.shipForFee")}</span>
        </div>
        <div className="address-fields">
          <CountryRegionFields
            country={country}
            region={region}
            setCountry={setCountry}
            setRegion={setRegion}
            idPrefix="pi"
          />
          <label>
            <span>
              {t("home.city")} <i>*</i>
            </span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t("home.city")}
            />
          </label>
          <label className="street">
            <span>
              {t("home.street")} <i>*</i>
            </span>
            <input
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              placeholder={t("home.street")}
            />
          </label>
          <label>
            <span>
              {t("home.postal")} <i>*</i>
            </span>
            <input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder={t("home.postal")}
            />
          </label>
        </div>
        <div className="shipping-estimate">
          {!(country && region && city && street && postalCode) && (
            <strong>
              {loc === "zh" ? "还未填写收货地址" : "Shipping address not entered"}
            </strong>
          )}
          <span hidden={!(country && region && city && street && postalCode)}>
            {t("home.estWeight")} <b>{orderWeight.toFixed(1)} kg</b>
          </span>
          <span hidden={!(country && region && city && street && postalCode)}>
            {rateLabel}
            {t("home.shipEst")} <b>{money(shippingFee)}</b>
          </span>
          <small hidden={!(country && region && city && street && postalCode)}>{t("home.shipNote")}</small>
        </div>
      </section>}
      <div className="pi-customer">
        <div>
          <small>{t("pi.customer")}</small>
          <b>{customerName || "—"}</b>
        </div>
        <div>
          <small>{t("pi.address")}</small>
          <b>
            {[city, region, countryLabel].filter(Boolean).join(" · ") || "—"}
          </b>
          <p>{[street, postalCode].filter(Boolean).join(" · ") || "—"}</p>
        </div>
      </div>
      <div className="pi-table">
        <div className="pi-table-head">
          <span>{t("pi.product")}</span>
          <span>{t("pi.fabric")}</span>
          <span>{t("pi.styles")}</span>
          <span>{t("pi.price")}</span>
        </div>
        {currentItems.map((item, idx) => (
          <PiRow
            key={item.key}
            item={item}
            countryCode={countryCode}
            onRemove={onRemove}
            onReselectFabric={onReselectFabric}
            onReselectStyle={onReselectStyle}
            result={results[item.key]}
            index={idx}
          />
        ))}
        {currentItems.length === 0 ? (
          <div className="pi-empty">{t("pi.empty")}</div>
        ) : (
          <>
            <div className="pi-shipping">
              <div className="pi-shipping-head">
                <span>{t("pi.shipping")}（{currentItems.length}）</span>
                <b>{money(shippingTotal)}</b>
              </div>
              <div className="pi-shipping-items">
                {currentItems.map((item, index) => (
                  <div className="pi-shipping-item" key={`shipping:${item.key}`}>
                    <b>
                      {index + 1}. {item.kind === "fabric" ? t("pi.fabric") : tailoringTerm(item.garmentName ?? "", loc)} · {Math.ceil(item.weightKg * 1000)} g
                    </b>
                    <small>
                      {countryCode
                        ? localizedShippingFormula(countryCode, item.weightKg, loc, money)
                        : loc === "zh"
                          ? "请先填写收货地址后计算国际快递费"
                          : "Enter a shipping address to calculate international shipping."}
                      {countryCode ? ` · ${money(item.shippingFee)}` : ""}
                    </small>
                  </div>
                ))}
              </div>
            </div>
            <div className="pi-total">
              <span>{t("pi.total")}</span>
              <b>{money(total)}</b>
            </div>
            <div className="pi-actions">
              <div className="pi-actions-btns">
                {false && <button
                  className="pi-gen-btn"
                  onClick={generateAll}
                  disabled={genBusy}
                >
                  {genBusy ? t("pi.generating") : t("pi.generateOne")}
                </button>}
                {false && <button
                  className="pi-gen-btn pi-gen-suite"
                  onClick={generateSuite}
                  disabled={suiteLoading}
                >
                  {suiteLoading ? t("pi.generatingNow") : t("pi.generateSuite")}
                </button>}
                <button
                  type="button"
                  className="pi-gen-btn pi-export-btn"
                  onClick={exportPiDocument}
                >
                  {t("pi.exportTable")}
                </button>
              </div>
              {false && <label className="pi-suite-select">
                <span>{t("pi.suiteRef")}</span>
                <input
                  value={suiteSelect}
                  onChange={(e) => setSuiteSelect(e.target.value)}
                  placeholder={t("pi.suiteDefault")}
                />
              </label>}
              {false && suiteImage && (
                <div className="pi-suite">
                  <img
                    src={suiteImage}
                    alt="Full Set"
                    onClick={() => setSuiteZoom(true)}
                    title={t("pi.zoom")}
                  />
                  <small>{t("pi.suite")}</small>
                </div>
              )}
            </div>
            {false && suiteZoom && suiteImage && (
              <div className="ai-zoom" onClick={() => setSuiteZoom(false)}>
                <img src={suiteImage} alt="Full Set" />
                <span>{t("common.close")}</span>
              </div>
            )}
          </>
        )}
      </div>
      <p className="pi-note">{t("pi.note")}</p>
    </section>
  );
}

const TONE_EN: Record<string, string> = {
  navy: "deep navy blue",
  charcoal: "charcoal grey",
  bluecheck: "navy blue with subtle check pattern",
  brown: "rich brown",
  stripe: "navy blue with subtle stripes",
  beige: "elegant beige",
  herring: "charcoal herringbone",
  ivory: "ivory white",
  gold: "golden brown",
  burgundy: "deep burgundy",
  greycheck: "grey with check pattern",
  white: "crisp white",
  sky: "light sky blue",
  shirtstripe: "white with fine blue stripes",
  shirtcheck: "white with subtle check pattern",
  pink: "soft pink",
};

function PiRow({
  item,
  countryCode,
  onRemove,
  onReselectFabric,
  onReselectStyle,
  result,
  index,
}: {
  item: PiItem;
  countryCode: string;
  onRemove: (key: string) => void;
  onReselectFabric: (item: PiItem) => void;
  onReselectStyle: (item: PiItem) => void;
  result?: { loading: boolean; image: string | null; error: string };
  index: number;
}) {
  const { loc, t } = useLocale();
  const { money } = useCurrency(countryCode);
  const [zoom, setZoom] = useState(false);
  const [fabricZoom, setFabricZoom] = useState(false);
  const loading = result?.loading ?? false;
  const image = result?.image ?? null;
  const error = result?.error ?? "";
  const currentOptions = validPiOptions(item);
  const selectedFabric = [
    ...fabricsByGarment.jacket,
    ...fabricsByGarment.trousers,
    ...fabricsByGarment.waistcoat,
    ...fabricsByGarment.shirt,
  ].find((fabric) => fabric.code === item.fabricCode);
  const selectedFabricImage =
    selectedFabric && "imageUrl" in selectedFabric
      ? selectedFabric.imageUrl
      : undefined;
  return (
    <div className="pi-item" key={item.key}>
      {item.kind === "fabric" ? (
        <>
          <b>
            <span className="pi-index">{index + 1}</span>
            {item.fabricName || t("pi.fabric")}
            <small>FABRIC ONLY · {item.fabricCode}</small>
          </b>
          <span>
            <strong>{item.fabricCode}</strong>
            <small>{item.fabricMill}</small>
          </span>
          <span className="pi-styles">
            <small>
              {t("home.fabricMeters")}：{item.meters} {t("pi.meters")} × {money(item.fabricPrice)}/{t("pi.meters")}
            </small>
          </span>
        </>
      ) : (
        <>
          <b>
            <span className="pi-index">{index + 1}</span>
            {tailoringTerm(item.garmentName ?? "", loc)}
          </b>
          <span>
            {item.fabricCode ? (
              <>
                {selectedFabricImage ? (
                  <img
                    className="pi-fabric-thumb"
                    src={selectedFabricImage}
                    alt={`${item.fabricName ?? "面料"} ${item.fabricCode}`}
                    onClick={() => setFabricZoom(true)}
                    title={t("pi.zoom")}
                  />
                ) : null}
                <strong>{item.fabricCode}</strong>
                <small>
                  {[item.fabricMill, item.fabricName ? fabricDisplayName(item.fabricName, loc, STYLBIELLA_FABRIC_COLORS[item.fabricCode]?.color) : undefined]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
                <button
                  type="button"
                  className="pi-reselect-btn"
                  onClick={() => onReselectFabric(item)}
                >
                  {t("pi.reselectFabric")}
                </button>
              </>
            ) : (
              "—"
            )}
          </span>
          <span className="pi-styles">
            {currentOptions.map((style) => (
              <small className={style.group === "备注" || style.group === "刺绣文字" || style.group === "刺绣颜色" ? "pi-style-note" : undefined} key={`${style.group}:${style.item}`}>
                {piOptionLabel(style.group, loc)}：{piOptionValue(style, loc)}
              </small>
            ))}
            <button
              type="button"
              className="pi-reselect-btn"
              onClick={() => onReselectStyle(item)}
            >
              {t("pi.reselectStyle")}
            </button>
          </span>
        </>
      )}
      {false && <span className="pi-ai">
        {loading ? (
          <span className="pi-ai-loading">{t("pi.generatingNow")}</span>
        ) : image ? (
          <>
            <img
              className="pi-ai-thumb"
              src={image}
              alt="AI"
              onClick={() => setZoom(true)}
              title={t("pi.zoom")}
            />
            <small className="pi-ai-hint">{t("pi.zoom")}</small>
          </>
        ) : item.kind === "fabric" ? null : (
          <span className="pi-ai-holder" />
        )}
      </span>}
      <strong className="pi-price">
        {item.kind === "fabric" ? (
          <>
            <b>{money(item.productPrice)}</b>
            <small>
              {t("pi.fabricPrice")} {money(item.basePrice)}
              <br />
              {item.meters}
              {t("pi.meters")} × {money(item.fabricPrice)}/{t("pi.meters")}
            </small>
          </>
        ) : (
          <>
            <b>{money(item.productPrice)}</b>
            <small>
              {t("pi.fabricPrice")} {money(item.fabricPrice)}
              <br />
              {t("pi.make")} {money(item.basePrice)}
              <br />
              {t("pi.extra")} {money(item.optionExtra)}
            </small>
          </>
        )}
        <button
          className="pi-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.key);
          }}
          title={t("pi.remove")}
        >
          ×
        </button>
      </strong>
      {false && zoom && image && (
        <div className="ai-zoom" onClick={() => setZoom(false)}>
          <img src={image} alt="AI" />
          <span>{t("common.close")}</span>
        </div>
      )}
      {fabricZoom && selectedFabricImage && (
        <div className="ai-zoom" onClick={() => setFabricZoom(false)}>
          <img src={selectedFabricImage} alt={`${item.fabricName ?? "Fabric"} ${item.fabricCode}`} />
          <span>{t("common.close")}</span>
        </div>
      )}
      {false && error && <p className="pi-ai-error">{error}</p>}
    </div>
  );
}

const fabricColor = (f: { name: string; color?: string }) => {
  if (f.color) return f.color;
  const name = f.name;
  if (/黑/.test(name)) return "黑色";
  if (/灰|银|炭/.test(name)) return "灰色";
  if (/蓝|靛/.test(name)) return "蓝色";
  if (/绿|橄榄|苔藓|鼠尾草|松柏/.test(name)) return "绿色";
  if (/棕|褐|咖啡|巧克力|栗|核桃|貂|焦糖|烟草/.test(name)) return "棕色";
  if (/红|勃艮第|酒红|砖红|玫瑰/.test(name)) return "红色";
  if (/紫|梅子|丁香|茄/.test(name)) return "紫色";
  if (/粉/.test(name)) return "粉色";
  if (/白|象牙|奶油/.test(name)) return "白色";
  if (/米|卡其|驼|沙|燕麦/.test(name)) return "米色/卡其";
  if (/黄|金/.test(name)) return "黄色";
  if (/橙|陶土/.test(name)) return "橙色";
  return "其他";
};
const whiteGroundPatternColors = (name: string) => {
  if (!/(白底|白色).*(条|格|纹)/.test(name)) return [] as string[];
  const colors: string[] = [];
  if (/蓝|靛/.test(name)) colors.push("蓝色");
  if (/灰|银|炭/.test(name)) colors.push("灰色");
  if (/绿|橄榄|苔藓/.test(name)) colors.push("绿色");
  if (/红|酒红|勃艮第/.test(name)) colors.push("红色");
  if (/紫/.test(name)) colors.push("紫色");
  if (/粉/.test(name)) colors.push("粉色");
  if (/棕|褐|咖啡/.test(name)) colors.push("棕色");
  if (/黄|金/.test(name)) colors.push("黄色");
  return [...new Set(colors)].slice(0, 2);
};
const fabricColors = (f: {
  name: string;
  color?: string;
  colors?: string[];
}) => {
  const whiteGround = whiteGroundPatternColors(f.name);
  return whiteGround.length
    ? whiteGround
    : f.colors?.length
      ? f.colors
      : [fabricColor(f)];
};
const fabricPattern = (f: { name: string; pattern?: string }) =>
  f.pattern ||
  (/条纹|条|stripe/i.test(f.name)
    ? "条纹"
    : /格纹|格|check|plaid/i.test(f.name)
      ? "格纹"
      : /人字|herring/i.test(f.name)
        ? "人字纹"
        : /点|圆点|dot/i.test(f.name)
          ? "圆点"
          : "素色");
const fabricWeight = (f: { meta?: string; weight?: string }) =>
  f.weight || f.meta?.match(/(?:^|[·\s])([0-9]{2,4})\s*g\b/i)?.[1] || "";
const fabricComposition = (f: { meta?: string; composition?: string }) =>
  f.composition || f.meta?.split("·")[0]?.trim() || "";
const fabricDisplayCode = (f: { code: string; book?: string; mill: string }) =>
  f.mill === "STYLBIELLA" && f.book ? `${f.book}·${f.code}` : f.code;

function FabricFirst({
  search,
  setSearch,
  onQuickSelect,
  onContinue,
  onFabricOnly,
}: {
  search: string;
  setSearch: (value: string) => void;
  onQuickSelect?: (code: string) => void;
  onContinue: (key: GarmentKey, code: string) => void;
  onFabricOnly: (code: string, meters: number) => void;
}) {
  const { loc, t } = useLocale();
  const { money } = useCurrency();
  const [kind, setKind] = useState<"suiting" | "shirt">("suiting");
  const [code, setCode] = useState<string>();
  const [meters, setMeters] = useState("2.5");
  const [showChoose, setShowChoose] = useState(false);
  const [showBookDetail, setShowBookDetail] = useState<string>();
  const [showFabricZoom, setShowFabricZoom] = useState<boolean | number>(false);
  const [mill, setMill] = useState<string>();
  const [book, setBook] = useState<string>();
  const [colorFilter, setColorFilter] = useState("");
  const [patternFilter, setPatternFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [compositionFilter, setCompositionFilter] = useState("");
  const hasFabricFilters = Boolean(
    search.trim() ||
      colorFilter ||
      patternFilter ||
      weightFilter ||
      compositionFilter,
  );
  const source =
    kind === "shirt" ? fabricsByGarment.shirt : fabricsByGarment.jacket;
  const mills = [...new Set(source.map((f) => f.mill))];
  const filterSource = source.filter(
    (f) => (!mill || f.mill === mill) && (!book || !f.book || f.book === book),
  );
  const matchesFabric = (
    f: (typeof source)[number],
    ignore?: "color" | "pattern" | "weight" | "composition",
  ) => {
    const haystack =
      `${fabricDisplayCode(f)} ${f.code} ${f.mill} ${f.name} ${f.meta || ""} ${fabricColors(f).join(" ")} ${fabricPattern(f)} ${fabricWeight(f)} ${fabricComposition(f)}`.toLowerCase();
    return (
      haystack.includes(search.trim().toLowerCase()) &&
      (ignore === "color" ||
        !colorFilter ||
        fabricColors(f).includes(colorFilter)) &&
      (ignore === "pattern" ||
        !patternFilter ||
        fabricPattern(f) === patternFilter) &&
      (ignore === "weight" ||
        !weightFilter ||
        fabricWeight(f) === weightFilter) &&
      (ignore === "composition" ||
        !compositionFilter ||
        fabricComposition(f) === compositionFilter)
    );
  };
  const colors = [
    ...new Set(
      filterSource
        .filter((f) => matchesFabric(f, "color"))
        .flatMap((f) => fabricColors(f))
        .filter(Boolean),
    ),
  ].sort();
  const patterns = [
    ...new Set(
      filterSource
        .filter((f) => matchesFabric(f, "pattern"))
        .map((f) => fabricPattern(f))
        .filter(Boolean),
    ),
  ].sort();
  const weights = [
    ...new Set(
      filterSource
        .filter((f) => matchesFabric(f, "weight"))
        .map((f) => fabricWeight(f))
        .filter(Boolean),
    ),
  ].sort((a, b) => Number(a) - Number(b));
  const compositions = [
    ...new Set(
      filterSource
        .filter((f) => matchesFabric(f, "composition"))
        .map((f) => fabricComposition(f))
        .filter(Boolean),
    ),
  ].sort();
  const list = filterSource.filter((f) => matchesFabric(f));
  useEffect(() => {
    if (colorFilter && !colors.includes(colorFilter)) setColorFilter("");
    if (patternFilter && !patterns.includes(patternFilter))
      setPatternFilter("");
    if (weightFilter && !weights.includes(weightFilter)) setWeightFilter("");
    if (compositionFilter && !compositions.includes(compositionFilter))
      setCompositionFilter("");
  }, [
    colorFilter,
    patternFilter,
    weightFilter,
    compositionFilter,
    colors.join("|"),
    patterns.join("|"),
    weights.join("|"),
    compositions.join("|"),
  ]);
  const chosen = source.find((f) => f.code === code);
  const eligible: GarmentKey[] =
    kind === "shirt" ? ["shirt"] : ["jacket", "trousers", "waistcoat"];
  useEffect(() => {
    const row = document.querySelector<HTMLElement>(".fabric-mills");
    if (!row) return;
    const handle = (event: Event) => {
      const button = (event.target as HTMLElement).closest("button");
      if (button?.classList.contains("on")) {
        window.setTimeout(() => {
          setMill(undefined);
          setBook(undefined);
          setCode(undefined);
        }, 0);
      }
    };
    row.addEventListener("click", handle);
    return () => row.removeEventListener("click", handle);
  }, [mill]);
  return (
    <section className="fabric-first panel">
      <div className="fabric-first-title">
        <div>
          <p className="eyebrow">STEP 01 · FABRIC FIRST</p>
          <h2>{t("home.fabricFirstTitle")}</h2>
          <p>{t("home.fabricFirstSub")}</p>
        </div>
        <div className="fabric-kind">
          <button
            className={kind === "suiting" ? "on" : ""}
            onClick={() => {
              setKind("suiting");
              setCode(undefined);
              setMill(undefined);
            }}
          >
            {t("home.suitingFabric")}
          </button>
          <button
            className={kind === "shirt" ? "on" : ""}
            onClick={() => {
              setKind("shirt");
              setCode(undefined);
              setMill(undefined);
            }}
          >
            {t("home.shirtFabric")}
          </button>
        </div>
      </div>
      <div className="fabric-picker">
        <div className="fabric-mills">
          <span>{t("home.selectBrand")}</span>
          {mills.map((m) => (
            <button
              key={m}
              className={mill === m ? "on" : ""}
              onClick={() => {
                setMill(m);
                setBook(undefined);
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="fabric-tools">
          <label>
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("home.fabricSearch")}
            />
          </label>
          <select
            aria-label={t("home.colorFilter")}
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
          >
            <option value="">{t("home.colorFilter")}</option>
            {colors.map((v) => (
              <option key={v} value={v}>
                {fabricTerm(v, loc)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("home.patternFilter")}
            value={patternFilter}
            onChange={(e) => setPatternFilter(e.target.value)}
          >
            <option value="">{t("home.patternFilter")}</option>
            {patterns.map((v) => (
              <option key={v} value={v}>
                {fabricTerm(v, loc)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("home.weightFilter")}
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
          >
            <option value="">{t("home.weightFilter")}</option>
            {weights.map((v) => (
              <option key={v} value={v}>
                {v}g
              </option>
            ))}
          </select>
          <select
            aria-label={t("home.compositionFilter")}
            value={compositionFilter}
            onChange={(e) => setCompositionFilter(e.target.value)}
          >
            <option value="">{t("home.compositionFilter")}</option>
            {compositions.map((v) => (
              <option key={v} value={v}>
                {fabricTerm(v, loc)}
              </option>
            ))}
          </select>
        </div>
        {mill === "STYLBIELLA" && !book && !hasFabricFilters ? (
          <div className="fabric-books">
            <span>{t("home.chooseBook")}</span>
            <div className="fabric-book-grid">
              {Object.keys(STYLBIELLA_BOOK_META)
                .filter((b) => source.some((f) => f.book === b))
                .map((b) => {
                  const bm = STYLBIELLA_BOOK_META[b];
                  const cnt = source.filter((f) => f.book === b).length;
                  return (
                    <button
                      key={b}
                      className="fabric-book-card"
                      data-cover={t("home.fabricBookCover")}
                      onClick={() => setBook(b)}
                    >
                      <em>{b}</em>
                      <b>{bm.title}</b>
                      <p>{bm.sub}</p>
                      <span>{cnt} {t("home.fabricCount")}　→</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ) : mill === "STYLBIELLA" && book ? (
          <div className="fabric-list fabric-book-inline">
            <div className="fabric-book-head">
              <button className="book-back" onClick={() => setBook(undefined)}>
                ← {t("home.backToBook")}
              </button>
              <b>
                {STYLBIELLA_BOOK_META[book].title} · {book}
              </b>
              <span>{fabricSpecification(STYLBIELLA_BOOK_META[book].meta, loc)}</span>
            </div>
            {FABRIC_BOOK_DETAILS[book] ? (
              <button
                type="button"
                className="fabric-card fabric-book-detail-card"
                onClick={() => setShowBookDetail(book)}
                aria-label={`查看 ${FABRIC_BOOK_DETAILS[book].title} ${book} 完整面料本详情`}
              >
                <span className="swatch">
                  <img
                    src={`/stylbiella/books/${book}/page-02.jpg`}
                    alt={`STYLBIELLA ${FABRIC_BOOK_DETAILS[book].title} ${book} 面料本详情`}
                  />
                </span>
                <span className="fabric-copy">
                  <small>STYLBIELLA</small>
                  <b>{FABRIC_BOOK_DETAILS[book].title} · {book}</b>
                  <em>{t("home.bookDetail")}</em>
                  <p>{fabricSpecification(FABRIC_BOOK_DETAILS[book].summary, loc)}</p>
                  <strong>{t("home.viewFullBook")} →</strong>
                </span>
              </button>
            ) : null}
            {list.map((f) => (
              <button
                key={f.code}
                className={`fabric-card ${code === f.code ? "selected" : ""}`}
                onClick={() => {
                  setCode(f.code);
                  if (onQuickSelect) onQuickSelect(f.code);
                  else setShowChoose(true);
                }}
              >
                <span className={`swatch ${f.tone}`}>
                  {f.imageUrl ? (
                    <img src={f.imageUrl} alt={f.code} />
                  ) : (
                    <i>{code === f.code ? "✓" : ""}</i>
                  )}
                </span>
                <span className="fabric-copy">
                  <small>{f.mill}</small>
                  <b>{fabricDisplayName(f.name, loc, STYLBIELLA_FABRIC_COLORS[f.code]?.color)}</b>
                  <em>{fabricDisplayCode(f)}</em>
                  <p>{fabricSpecification(f.meta, loc)}</p>
                  <em className="fabric-card-meter-price">
                    {money(getFabricPrice(f.code))}/{t("home.perMeter")}
                  </em>
                </span>
              </button>
            ))}
          </div>
        ) : mill || hasFabricFilters ? (
          <div className="fabric-list">
            {list.map((f) => (
              <button
                key={f.code}
                className={`fabric-card ${code === f.code ? "selected" : ""}`}
                onClick={() => {
                  setCode(f.code);
                  if (onQuickSelect) onQuickSelect(f.code);
                  else setShowChoose(true);
                }}
              >
                <span className={`swatch ${f.tone}`}>
                  {f.imageUrl ? (
                    <img src={f.imageUrl} alt={f.code} />
                  ) : (
                    <i>{code === f.code ? "✓" : ""}</i>
                  )}
                </span>
                <span className="fabric-copy">
                  <small>{f.mill}</small>
                  <b>{fabricDisplayName(f.name, loc, STYLBIELLA_FABRIC_COLORS[f.code]?.color)}</b>
                  <em>{fabricDisplayCode(f)}</em>
                  <p>{fabricSpecification(f.meta, loc)}</p>
                  <strong
                    className={
                      f.stock === "库存较少"
                        ? "low"
                        : f.stock === "需确认"
                          ? "check"
                          : ""
                    }
                  >
                    {fabricTerm(f.stock, loc)}
                  </strong>
                  <em
                    className={
                      f.mill === "STYLBIELLA"
                        ? "fabric-card-meter-price"
                        : "fabric-price"
                    }
                  >
                    {f.code === "WC-MATCH-01"
                      ? t("home.sameAsJacket")
                      : f.mill === "STYLBIELLA"
                        ? `${money(getFabricPrice(f.code))}/${t("home.perMeter")}`
                        : `${t("home.fabricPrice")} ${money(getFabricPrice(f.code))}`}
                  </em>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="fabric-empty">
            <span>◈</span>
            <div>
              <b>{t("home.chooseBrand")}</b>
              <p>{t("home.chooseBrandSub")}</p>
            </div>
          </div>
        )}
        {chosen && mill ? (
          <div className="fabric-chosen-bar">
            <span className={`mini-swatch ${chosen.tone}`}>
              {chosen.imageUrl ? <img src={chosen.imageUrl} alt="" /> : null}
            </span>
            <div>
              <small>{t("home.selectedFabric")}</small>
              <b>
                {fabricDisplayName(chosen.name, loc, STYLBIELLA_FABRIC_COLORS[chosen.code]?.color)} · {chosen.code}
              </b>
            </div>
            <button onClick={() => setShowChoose(true)}>{t("home.nextMake")} →</button>
          </div>
        ) : null}
      </div>
      {showBookDetail ? (
        <div
          className="fabric-book-detail-backdrop"
          role="presentation"
          onClick={() => setShowBookDetail(undefined)}
        >
          <section
            className="fabric-book-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`STYLBIELLA ${FABRIC_BOOK_DETAILS[showBookDetail].title} ${showBookDetail} 面料本详情`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="fabric-book-detail-close"
              aria-label={t("common.close")}
              onClick={() => setShowBookDetail(undefined)}
            >
              ×
            </button>
            <header>
              <p>STYLBIELLA · FABRIC MADE IN ITALY</p>
              <h2>{FABRIC_BOOK_DETAILS[showBookDetail].title} · {showBookDetail}</h2>
              <span>{loc === "zh" ? FABRIC_BOOK_DETAILS[showBookDetail].summary : FABRIC_BOOK_DETAILS_EN[showBookDetail].summary}</span>
            </header>
            <div className="fabric-book-positioning">
              <div>
                <h3>{t("home.bookPositioning")}</h3>
                <p>{t("home.bookBrandIntro")}</p>
                <p>{loc === "zh" ? FABRIC_BOOK_DETAILS[showBookDetail].positioning : FABRIC_BOOK_DETAILS_EN[showBookDetail].positioning}</p>
              </div>
              <dl>
                <div><dt>{t("home.bookProducts")}</dt><dd>{loc === "zh" ? FABRIC_BOOK_DETAILS[showBookDetail].products : FABRIC_BOOK_DETAILS_EN[showBookDetail].products}</dd></div>
                <div><dt>{t("home.bookWeight")}</dt><dd>{FABRIC_BOOK_DETAILS[showBookDetail].weight}</dd></div>
                <div><dt>{t("home.bookView")}</dt><dd>{t("home.bookViewHint")}</dd></div>
              </dl>
            </div>
            <div className="fabric-book-pages">
              {Array.from({ length: FABRIC_BOOK_DETAILS[showBookDetail].pages }, (_, index) => (
                <figure key={index + 1}>
                  <button type="button" onClick={() => setShowFabricZoom(index + 1)} aria-label={`放大第 ${index + 1} 页`}>
                    <img
                      src={`/stylbiella/books/${showBookDetail}/page-${String(index + 1).padStart(2, "0")}.jpg`}
                      alt={`${FABRIC_BOOK_DETAILS[showBookDetail].title} ${showBookDetail} 面料本第 ${index + 1} 页`}
                      loading={index > 1 ? "lazy" : "eager"}
                    />
                  </button>
                  <figcaption>{t("home.bookPage").replace("{n}", String(index + 1))}</figcaption>
                </figure>
              ))}
            </div>
            {typeof showFabricZoom === "number" ? (
              <div className="fabric-book-page-zoom" role="dialog" aria-modal="true" aria-label={`面料本第 ${showFabricZoom} 页放大图`} onClick={() => setShowFabricZoom(false)}>
                <button type="button" aria-label={t("common.close")} onClick={() => setShowFabricZoom(false)}>×</button>
                <img src={`/stylbiella/books/${showBookDetail}/page-${String(showFabricZoom).padStart(2, "0")}.jpg`} alt={`面料本第 ${showFabricZoom} 页放大图`} />
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
      {showChoose && chosen && (
        <div
          className="fabric-modal-backdrop"
          onClick={() => setShowChoose(false)}
          role="presentation"
        >
          <div
            className="fabric-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t("home.nextMake")}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="fabric-modal-close"
              onClick={() => setShowChoose(false)}
              aria-label={t("common.close")}
            >
              ×
            </button>
            <div className="selected-fabric-line">
              <button
                className="modal-fabric-thumb"
                type="button"
                onClick={() => setShowFabricZoom(true)}
                aria-label={`放大面料 ${chosen.code}`}
              >
                <span
                  className={`mini-swatch ${chosen.tone}`}
                  style={{
                    backgroundColor: STYLBIELLA_FABRIC_COLORS[chosen.code]?.hex,
                  }}
                >
                  {chosen.imageUrl ? (
                    <img
                      src={chosen.imageUrl}
                      alt={`${chosen.name} ${chosen.code}`}
                    />
                  ) : null}
                </span>
                <i>⌕</i>
              </button>
              {showFabricZoom && chosen.imageUrl && (
                <div
                  className="fabric-preview-zoom"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${chosen.name} ${chosen.code}`}
                  onClick={() => setShowFabricZoom(false)}
                >
                  <button
                    aria-label={t("common.close")}
                    onClick={() => setShowFabricZoom(false)}
                  >
                    ×
                  </button>
                  <img
                    src={chosen.imageUrl}
                    alt={`${chosen.name} ${chosen.code}`}
                  />
                  <p>
                    {fabricDisplayName(chosen.name, loc, STYLBIELLA_FABRIC_COLORS[chosen.code]?.color)} · {fabricDisplayCode(chosen)}
                  </p>
                </div>
              )}
              <div>
                <small>{t("home.selectedFabric")}</small>
                <b>
                  {fabricDisplayName(chosen.name, loc, STYLBIELLA_FABRIC_COLORS[chosen.code]?.color)} · {chosen.code}
                </b>
                <p>{fabricSpecification(chosen.meta, loc)}</p>
              </div>
              <em className="fabric-price">
                {chosen.code === "WC-MATCH-01"
                  ? t("home.sameAsJacket")
                  : `${t("home.fabricPrice")} ${money(getFabricPrice(chosen.code))}`}
              </em>
            </div>
            <div className="choose-garment">
              <small>{t("home.nextMake")}</small>
              <div>
                {eligible.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      onContinue(key, chosen.code);
                      setShowChoose(false);
                    }}
                  >
                    <i>
                      {key === "jacket"
                        ? "♜"
                        : key === "trousers"
                          ? "Ⅱ"
                          : key === "waistcoat"
                            ? "◇"
                            : "⌑"}
                    </i>
                    <span>
                      <b>{tailoringTerm(garments[key].name, loc)}</b>
                      {loc === "zh" ? <em>{garments[key].en}</em> : null}
                    </span>
                    <strong>{t("home.choose")}　→</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="fabric-only-choice">
              <div>
                <i>✂</i>
                <span>
                  <b>{t("home.fabricOnly")}</b>
                  <em>{t("home.fabricOnlySub")}</em>
                </span>
              </div>
              <label>
                <span>{t("home.fabricMeters")}</span>
                <div>
                  <input
                    inputMode="decimal"
                    value={meters}
                    onChange={(event) =>
                      setMeters(event.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                  <em>{t("pi.meters")}</em>
                </div>
              </label>
              <button
                disabled={!Number(meters)}
                onClick={() => {
                  onFabricOnly(chosen.code, Number(meters));
                  setShowChoose(false);
                }}
              >
                {meters && Number(meters) > 0
                  ? `${t("home.joinPi")} (${t("pi.fabric")}) →`
                  : `${t("home.joinPi")} →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
