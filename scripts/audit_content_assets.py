#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容资产审计脚本（知识库维护工具）
- 面料主数据 stylbiella-fabrics.ts
- 颜色映射 stylbiella-fabric-colors.ts
- 英文名词典 fabricEnglish (tailoring-terms.ts)
- 图片目录 public/stylbiella/
- SEO 文章 articles.ts

用法: python scripts/audit_content_assets.py [project_root]
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
APP_LIB = ROOT / "app" / "lib"
PUB_STYL = ROOT / "public" / "stylbiella"


def parse_fabrics() -> list[dict]:
    text = (APP_LIB / "stylbiella-fabrics.ts").read_text(encoding="utf-8")
    out = []
    for block in re.finditer(r"\{([^{}]*)\}", text):
        b = block.group(1)
        def field(name: str) -> str | None:
            m = re.search(rf'\b{name}:\s*"([^"]*)"', b)
            return m.group(1) if m else None
        m_price = re.search(r"\bprice:\s*([\d.]+)", b)
        code = field("code")
        if not code:
            continue
        out.append({
            "code": code,
            "name": field("name") or "",
            "book": field("book") or "",
            "imageUrl": field("imageUrl") or "",
            "price": float(m_price.group(1)) if m_price else None,
        })
    return out


def parse_colors() -> dict[str, dict]:
    text = (APP_LIB / "stylbiella-fabric-colors.ts").read_text(encoding="utf-8")
    m = re.search(r"export const STYLBIELLA_FABRIC_COLORS[^=]*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    if not m:
        return {}
    return json.loads(m.group(1))


def parse_fabric_english() -> set[str]:
    text = (APP_LIB / "tailoring-terms.ts").read_text(encoding="utf-8")
    m = re.search(r"const fabricEnglish: Record<string, string> = \{(.*?)\n\};", text, re.S)
    if not m:
        return set()
    return set(re.findall(r'^\s*"?([^":}]+)"?\s*:', m.group(1), re.M))


def parse_articles() -> list[dict]:
    text = (APP_LIB / "articles.ts").read_text(encoding="utf-8")
    out = []
    for block in re.finditer(r"\{\s*slug:\s*\"([^\"]+)\".*?\},?\n", text, re.S):
        b = block.group(0)
        def field(name: str) -> str:
            m = re.search(rf'\b{name}:\s*"([^"]*)"', b)
            return m.group(1) if m else ""
        out.append({
            "slug": block.group(1),
            "title": field("title"),
            "category": field("category"),
            "published": field("published"),
            "updated": field("updated"),
            "primaryKeyword": field("primaryKeyword"),
        })
    return out


def main() -> None:
    fabrics = parse_fabrics()
    colors = parse_colors()
    fabric_en = parse_fabric_english()
    articles = parse_articles()
    img_names = {p.stem for p in PUB_STYL.glob("*.png")} if PUB_STYL.exists() else set()

    codes = [f["code"] for f in fabrics]
    name_map: dict[str, list[str]] = defaultdict(list)
    for f in fabrics:
        name_map[f["name"]].append(f["code"])

    print(f"=== 面料主数据 stylbiella-fabrics.ts ===")
    print(f"总条目: {len(fabrics)} | 唯一 code: {len(set(codes))}")
    dup_codes = [c for c, n in Counter(codes).items() if n > 1]
    print(f"重复 code: {dup_codes if dup_codes else '无'}")
    books = Counter(f["book"] for f in fabrics)
    print(f"面料本分布: {dict(sorted(books.items()))}")
    print(f"价格: {sorted({f['price'] for f in fabrics if f['price'] is not None})}")

    dup_names = {k: v for k, v in name_map.items() if len(v) > 1}
    print(f"\n=== 重名（同 name 不同 code，{len(dup_names)} 组）===")
    code_book = {f["code"]: f["book"] for f in fabrics}
    same_book = {
        k: [c for c in v if code_book[c] == code_book[v[0]]]
        for k, v in dup_names.items()
        if len({code_book[c] for c in v}) == 1
    }
    print(f"其中【同册重名】（同一面料本内同名，疑似录入问题，{len(same_book)} 组）:")
    for name, cs in sorted(same_book.items(), key=lambda x: -len(x[1])):
        print(f"  {name} [{code_book[cs[0]]}]: {cs}")
    print(f"跨册重名（不同面料本同名，属正常）: {len(dup_names) - len(same_book)} 组")

    print(f"\n=== 价格与面料本 ===")
    price_book: dict[str, set] = defaultdict(set)
    for f in fabrics:
        if f["price"] is not None:
            price_book[f["book"]].add(f["price"])
    for b in sorted(price_book):
        print(f"  book {b}: 价格 {sorted(price_book[b])}")

    print(f"\n=== 颜色映射 stylbiella-fabric-colors.ts ===")
    print(f"颜色条目: {len(colors)}")
    missing = [c for c in codes if c not in colors]
    orphans = [c for c in colors if c not in set(codes)]
    print(f"面料中缺颜色条目: {len(missing)} {missing[:20]}{'...' if len(missing) > 20 else ''}")
    print(f"颜色映射中的孤儿 code（不在面料主数据）: {len(orphans)}（前 20: {orphans[:20]}）")

    print(f"\n=== 图片 public/stylbiella/ ===")
    print(f"实际图片数: {len(img_names)}")
    refs = {f["imageUrl"].rsplit("/", 1)[-1][:-4] for f in fabrics if f["imageUrl"]}
    missing_img = [c for c in codes if c not in img_names]
    orphan_img = sorted(img_names - refs)
    print(f"面料引用但缺文件: {len(missing_img)} {missing_img[:20]}")
    print(f"文件存在但无引用(孤儿图): {len(orphan_img)}（前 20: {orphan_img[:20]}）")

    print(f"\n=== 英文名词典 fabricEnglish 覆盖 ===")
    unique_names = set(name_map.keys())
    covered = unique_names & fabric_en
    print(f"唯一中文名: {len(unique_names)} | 词典已覆盖: {len(covered)} | 未覆盖: {len(unique_names - covered)}")
    print(f"未覆盖样例(前 30): {sorted(unique_names - covered)[:30]}")

    print(f"\n=== SEO 文章 articles.ts ===")
    print(f"文章数: {len(articles)}")
    slugs = [a["slug"] for a in articles]
    print(f"slug 唯一: {'是' if len(slugs) == len(set(slugs)) else '否'}")
    cats = Counter(a["category"] for a in articles)
    print(f"分类分布: {dict(cats)}")
    bad_date = [a["slug"] for a in articles if a["updated"] < a["published"]]
    print(f"updated < published 异常: {bad_date if bad_date else '无'}")
    kw_dup = [k for k, n in Counter(a["primaryKeyword"] for a in articles).items() if n > 1]
    print(f"primaryKeyword 重复: {kw_dup if kw_dup else '无'}")


if __name__ == "__main__":
    main()
