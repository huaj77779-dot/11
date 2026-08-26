#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
面料英文名词典草稿生成器（知识库维护工具）
针对 tailoring-terms.ts 中 fabricEnglish 未覆盖的中文面料名，
用「色调前缀 + 颜色主体 + 纹理后缀」规则生成英文草稿，输出 CSV 供人工审核。

用法: python scripts/generate_fabric_name_en.py [project_root]
输出: docs/fabric-name-en-draft.csv
"""
import csv
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
FABRICS = ROOT / "app" / "lib" / "stylbiella-fabrics.ts"
TERMS = ROOT / "app" / "lib" / "tailoring-terms.ts"
OUT = ROOT / "docs" / "fabric-name-en-draft.csv"

# 色调前缀（按长度降序匹配，循环剥离）
TONES = [
    ("极深", "very dark"), ("更深", "darker"), ("近黑", "near-black"), ("极淡", "very pale"),
    ("深", "dark"), ("中深", "medium-dark"), ("中浅", "medium-light"), ("中", "medium"),
    ("浅", "light"), ("淡", "pale"), ("微", "fine"), ("纯", "pure"), ("亮", "bright"),
    ("白底", "white with"), ("哑光", "matt"), ("中调", "mid-tone"), ("最深", "deepest"),
]

# 纹理/后缀（按长度降序）
PATTERNS = [
    ("人字纹浅蓝窗格", "herringbone with light-blue windowpane"),
    ("人字纹芥黄窗格", "herringbone with mustard windowpane"),
    ("红灰细条纹", "red-grey fine stripe"), ("蓝红格纹", "blue-red check"),
    ("深浅人字纹", "light-and-dark herringbone"), ("微格红窗格", "mini check with red windowpane"),
    ("格伦格纹", "glen check"), ("鸟眼纹", "birdseye"), ("人字纹", "herringbone"),
    ("细斜纹", "fine twill"), ("细人字纹", "fine herringbone"), ("小人字纹", "fine herringbone"),
    ("细窗格", "fine windowpane"),
    ("大窗格", "large windowpane"), ("窗格", "windowpane"), ("微格", "mini check"),
    ("斜纹", "twill"), ("细竖纹", "fine vertical stripe"), ("细竖条纹", "fine vertical stripe"),
    ("宽竖条纹", "wide vertical stripe"), ("竖纹", "vertical stripe"), ("细条纹", "fine stripe"),
    ("条纹", "stripe"), ("格纹", "check"), ("盐椒纹", "salt-and-pepper"),
    ("麻点纹", "granite"), ("麻灰", "heather"), ("颗粒", "granular"), ("微粒纹", "micro-granule"),
    ("微纹理", "micro-texture"), ("鲨皮纹", "sharkskin"), ("素色", "plain"),
    ("细织", "fine weave"), ("细纹", "fine weave"), ("千鸟纹", "houndstooth"),
    ("红窗格", "red windowpane"), ("浅蓝窗格", "light-blue windowpane"),
    ("棋盘格", "checkerboard"), ("格", "check"),
]

# 颜色主体（纯词干，不含色调前缀；色调由 TONES 处理）
COLORS = [
    ("炭灰", "charcoal grey"), ("灰", "grey"), ("黑", "black"), ("蓝", "blue"),
    ("绿", "green"), ("炭", "charcoal"), ("棕", "brown"), ("藏青", "navy"),
    ("蓝灰", "blue grey"), ("灰褐", "grey brown"), ("米褐", "beige brown"),
    ("棕灰", "brown grey"), ("米燕麦", "beige oat"), ("燕麦", "oat"),
    ("香槟", "champagne"), ("奶油", "cream"), ("象牙", "ivory"),
    ("可可棕", "cocoa brown"), ("巧克力", "chocolate"), ("暖驼色", "warm camel"),
    ("驼色", "camel"), ("暖灰", "warm grey"), ("冷调棕", "cool brown"),
    ("橄榄草绿", "olive green"), ("橄榄绿", "olive green"), ("橄榄", "olive"),
    ("钢蓝", "steel blue"), ("石板灰蓝", "slate blue-grey"), ("石板蓝灰", "slate blue-grey"),
    ("夜蓝", "night blue"), ("午夜蓝", "midnight blue"), ("藏青近黑", "navy near-black"),
    ("酒红", "burgundy"),
    ("砖红", "brick red"), ("锈红", "rust red"), ("绯红", "scarlet"),
    ("陶土", "terracotta"), ("玫瑰", "rose"), ("豆沙", "dusty rose"),
    ("泡泡糖", "bubblegum pink"), ("粉", "pink"), ("紫", "purple"), ("梅紫", "plum"),
    ("梅紫罗兰", "plum violet"), ("丁香紫", "lilac"), ("茄子", "aubergine"),
    ("紫罗兰", "violet"), ("孔雀蓝", "peacock blue"), ("牛仔蓝", "denim blue"),
    ("靛蓝", "indigo"), ("冬日蓝", "winter blue"), ("貂棕", "mink brown"),
    ("坚果棕", "nut brown"), ("麻绳米", "hemp beige"), ("芝麻米", "sesame beige"),
    ("蘑菇棕", "mushroom brown"), ("焦糖", "caramel"), ("烟草", "tobacco"),
    ("赭黄", "ochre"), ("芥黄", "mustard"), ("黄油", "butter"),
    ("薄荷绿", "mint green"), ("海沫绿", "seafoam green"), ("鼠尾草绿", "sage green"),
    ("森林绿", "forest green"), ("松绿", "pine green"), ("苔绿", "moss green"),
    ("卡其", "khaki"), ("卡其棕绿", "khaki olive"), ("宝蓝", "royal blue"),
    ("青绿", "teal"), ("石油蓝", "petrol blue"), ("灰蓝", "grey blue"),
    ("米白", "off-white"), ("白", "white"), ("奶油白", "cream white"),
    ("象牙白", "ivory white"), ("银灰", "silver grey"), ("中灰", "medium grey"),
    ("蓝白灰", "blue-white-grey"), ("粉紫白", "pink-purple-white"), ("灰白", "grey-white"),
    ("白底", "white"), ("巧克力棕", "chocolate brown"), ("复古玫瑰", "vintage rose"),
    ("巧克力灰", "chocolate grey"), ("奶油米白", "creamy off-white"),
    ("夜蓝近黑", "midnight near-black"), ("炭棕", "charcoal brown"), ("炭蓝", "charcoal blue"),
    ("灰紫", "grey purple"), ("灰玫瑰粉", "grey rose pink"), ("橄榄褐", "olive brown"),
    ("冷灰", "cool grey"), ("冰灰", "ice grey"), ("勃艮第红", "burgundy red"),
    ("午夜蓝黑", "midnight blue-black"), ("咖啡灰", "coffee grey"), ("咖啡棕", "coffee brown"),
    ("天蓝", "sky blue"), ("开心果绿", "pistachio green"), ("暖红棕", "warm reddish brown"),
    ("黑灰", "black grey"), ("松柏绿", "pine green"), ("松石绿", "turquoise"),
    ("棕炭", "brown charcoal"), ("棕近黑", "brown near-black"), ("灰近黑", "grey near-black"),
    ("炭灰近黑", "charcoal grey near-black"), ("炭紫", "charcoal purple"),
    ("炭绿", "charcoal green"), ("炭黑", "carbon black"), ("茄子紫", "aubergine purple"),
    ("藏青炭黑", "navy carbon black"), ("藏青深蓝", "navy dark blue"),
    ("核桃灰", "walnut grey"), ("核桃棕", "walnut brown"),
    ("桃花心木红棕", "mahogany"), ("梅子紫", "plum purple"),
    ("橄榄调", "olive-tone"), ("灰玫瑰褐", "grey rose brown"),
]

# 兜底：剩余未知 → 待确认
def translate(name: str) -> tuple[str, str]:
    if not re.search(r"[\u3400-\u9fff]", name):
        return name, "非中文名"
    rest = name
    tones: list[str] = []
    patterns: list[str] = []
    color = ""
    while True:
        matched = False
        for tone, en in TONES:
            if rest.startswith(tone) and len(rest) > len(tone):
                tones.append(en)
                rest = rest[len(tone):]
                matched = True
                break
        if matched:
            continue
        break
    while True:
        matched = False
        for pat, en in sorted(PATTERNS, key=lambda x: -len(x[0])):
            if rest.endswith(pat) and len(rest) >= len(pat):
                patterns.insert(0, en)
                rest = rest[: -len(pat)]
                matched = True
                break
        if matched:
            continue
        break
    for c, en in sorted(COLORS, key=lambda x: -len(x[0])):
        if rest == c:
            color = en
            rest = ""
            break
    if not rest:
        parts = [*tones, color, *patterns]
        return " ".join(p for p in parts if p), "规则生成"
    return "", f"待确认({name})"


def existing_dict() -> dict[str, str]:
    text = TERMS.read_text(encoding="utf-8")
    m = re.search(r"const fabricEnglish: Record<string, string> = \{(.*?)\n\};", text, re.S)
    if not m:
        return {}
    return {k: v for k, v in re.findall(r'([^\s:{}]+)\s*:\s*"([^"]*)"', m.group(1)) if re.search(r"[\u3400-\u9fff]", k)}


def main() -> None:
    text = FABRICS.read_text(encoding="utf-8")
    fabrics = []
    for block in re.finditer(r"\{([^{}]*)\}", text):
        b = block.group(1)
        m_code = re.search(r'\bcode:\s*"(\d+)"', b)
        m_name = re.search(r'\bname:\s*"([^"]*)"', b)
        m_book = re.search(r'\bbook:\s*"([^"]*)"', b)
        if m_code and m_name:
            fabrics.append({"code": m_code.group(1), "name": m_name.group(1), "book": m_book.group(1) if m_book else ""})

    counter: Counter = Counter(f["name"] for f in fabrics)
    book_of: dict[str, Counter] = {}
    for f in fabrics:
        book_of.setdefault(f["name"], Counter())[f["book"]] += 1

    existing = existing_dict()
    rows = []
    generated = review = existing_n = 0
    leftovers: Counter = Counter()
    for name in sorted(counter):
        if name in existing:
            rows.append([name, counter[name], book_of[name].most_common(1)[0][0], existing[name], "已有词典"])
            existing_n += 1
            continue
        en, method = translate(name)
        if en:
            rows.append([name, counter[name], book_of[name].most_common(1)[0][0], en, method])
            generated += 1
        else:
            rows.append([name, counter[name], book_of[name].most_common(1)[0][0], "", method])
            review += 1
            leftovers[method] += counter[name]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["中文名", "出现次数", "主面料本", "建议英文翻译", "生成方式"])
        w.writerows(rows)

    print(f"唯一中文名: {len(counter)} | 已有词典: {existing_n} | 规则生成: {generated} | 待确认: {review}")
    print(f"输出: {OUT}")
    if leftovers:
        print("\n=== 未解析词干（前 60，按面料出现次数）===")
        for stem, n in leftovers.most_common(60):
            print(f"  {stem}: {n}")


if __name__ == "__main__":
    main()
