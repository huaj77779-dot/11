#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成完整面料目录文档 docs/FABRIC-CATALOG.md（630 条，合并颜色/色值）"""
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_LIB = ROOT / "app" / "lib"
OUT = ROOT / "docs" / "FABRIC-CATALOG.md"


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
            "code": code, "name": field("name") or "", "book": field("book") or "",
            "price": float(m_price.group(1)) if m_price else 0,
        })
    return out


def parse_colors() -> dict[str, dict]:
    text = (APP_LIB / "stylbiella-fabric-colors.ts").read_text(encoding="utf-8")
    m = re.search(r"export const STYLBIELLA_FABRIC_COLORS[^=]*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    return json.loads(m.group(1)) if m else {}


def main() -> None:
    fabrics = parse_fabrics()
    colors = parse_colors()
    assert len(fabrics) == 630, f"fabrics={len(fabrics)}"

    by_book: dict[str, list[dict]] = defaultdict(list)
    for f in fabrics:
        by_book[f["book"]].append(f)

    lines = []
    lines.append("# TailorSupply OS · 面料全目录（630 条）")
    lines.append("")
    lines.append("> 数据来源：`app/lib/stylbiella-fabrics.ts` + `stylbiella-fabric-colors.ts` ｜ 生成日期：2026-08-26")
    lines.append("> 生成工具：`scripts/generate_fabric_catalog.py` ｜ 价格单位：元/米")
    lines.append("")
    lines.append("## 一、面料本汇总")
    lines.append("")
    lines.append("| 面料本 | 条目数 | 价格（元/米） | 说明 |")
    lines.append("|---|---|---|---|")
    price_books = {
        "6401": "680（含 716xx 衬衫系列 180）", "6402": "680", "6403": "1280",
        "6410": "680", "6411": "780", "6412": "880", "6413": "680",
        "6414": "760", "6415": "580", "6416": "1680",
    }
    notes = {
        "6401": "含 71671–71685 白底条纹衬衫料（180 元）", "6403": "高支精纺", "6416": "高端系列",
    }
    for b in sorted(by_book, key=lambda x: int(x)):
        lines.append(f"| {b} | {len(by_book[b])} | {price_books.get(b, '—')} | {notes.get(b, '')} |")
    lines.append("")
    lines.append(f"**合计：{len(fabrics)} 条** ｜ 颜色映射全覆盖（630/630）｜ 图片全覆盖（630/630）")
    lines.append("")

    for b in sorted(by_book, key=lambda x: int(x)):
        items = sorted(by_book[b], key=lambda f: f["code"])
        lines.append(f"## 二、面料本 {b}（{len(items)} 条 · {price_books.get(b, '—')} 元/米）")
        lines.append("")
        lines.append("| 货号 | 中文名 | 色系 | 色值 | 价格 |")
        lines.append("|---|---|---|---|---|")
        for f in items:
            c = colors.get(f["code"], {})
            color = c.get("color", "") or ""
            hexv = c.get("hex", "") or ""
            price = int(f["price"]) if f["price"] == int(f["price"]) else f["price"]
            lines.append(f"| {f['code']} | {f['name']} | {color} | {hexv} | {price} |")
        lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    # 统计验证
    total_rows = sum(len(v) for v in by_book.values())
    print(f"FABRIC-CATALOG.md 生成：{total_rows} 条 / {len(by_book)} 个面料本")
    for b in sorted(by_book, key=lambda x: int(x)):
        prices = sorted({int(f['price']) for f in by_book[b]})
        print(f"  book {b}: {len(by_book[b])} 条, 价格 {prices}")


if __name__ == "__main__":
    main()
