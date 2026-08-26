# 内容知识库索引（CONTENT-KB）

> 本文件是 TailorSupply OS 站点**内容资产的统一索引**：每类资产在哪里、什么格式、被谁消费、如何维护。
> 维护人：开发 / 内容运营 ｜ 最近更新：2026-08-26

---

## 1. 资产地图总览

| 资产 | 路径 | 用途 | 消费方 | 更新方式 |
|---|---|---|---|---|
| 面料主数据 | `app/lib/stylbiella-fabrics.ts` | 下单系统面料库（code/名称/面料本/图/价） | `app/tailoring-app.tsx`（选料、计价） | 改 TS 数组 |
| 面料颜色映射 | `app/lib/stylbiella-fabric-colors.ts` | code → 色系/主色 hex（自动生成） | `tailoring-app.tsx`（色卡、筛选） | 跑 `scripts/analyze_fabric_colors.py` |
| 面料图 | `public/stylbiella/{code}.webp` | 面料缩略图（630 张） | 下单系统 / 展示页 | 按 code.png 命名放入 |
| 款式术语 | `app/lib/tailoring-terms.ts` | 中文术语 → 14 语种翻译 + 面料名翻译 | `tailoring-app.tsx`、`customers/page.tsx` | 改 TS 字典 |
| UI 翻译（主） | `app/lib/i18n.ts` | zh/en/de/ja 界面文案 | 全局 `useLocale` | 改 TS 字典 |
| UI 翻译（欧系） | `app/lib/eu-translations.ts` | fr/it/es/pt/nl/pl/sv/da/no/cs 界面文案 | 同上 | 改 TS 字典 |
| SEO 文章 | `app/lib/articles.ts` | 10 篇 B2B 定制西服文章 | `/news`、`/news/[slug]` | 改 TS 数组 |
| 款式参考图映射 | `app/shirt-option-images.ts`、`app/suit-option-images.ts`、`shirt-option-images.generated.json` | 款式组:选项 → 参考图路径 | `tailoring-app.tsx`（englishOption 取图） | 改 TS 映射 |
| 款式参考图文件 | `public/style-options/`、`public/garment-options/`、`public/shirt-options/`、`public/suit-options/` | 选项示意图 | 下单系统 | 按目录规则放图 |
| DB 面料表 | `db/schema.ts` → `fabrics` | 管理端面料上架（独立于静态库） | `app/admin`、`/api/admin/fabrics` | API 批量上架 |
| DB 款式选项表 | `db/schema.ts` → `style_options` | 管理端款式选项 | `app/admin` | API |
| 审计/生成工具 | `scripts/audit_content_assets.py`、`scripts/generate_fabric_name_en.py` | 数据体检 / 英文名词典草稿 | 维护流程 | 见 §5 |

---

## 2. 数据链路（谁喂谁）

```
┌─────────────────────────────────────────────────────────────┐
│ 静态内容层（代码内数据，部署即生效）                            │
│  stylbiella-fabrics.ts ──┐                                   │
│  stylbiella-fabric-colors.ts ──┤→ tailoring-app.tsx          │
│  tailoring-terms.ts ──────┘    （选料 + 计价 + 14 语种展示）   │
│  i18n.ts / eu-translations.ts ─→ 全局 UI                      │
│  articles.ts ─────────────────→ /news 页面                    │
│  shirt/suit-option-images.ts ─→ 款式参考图                    │
├─────────────────────────────────────────────────────────────┤
│ 数据库层（D1，运行时数据）                                     │
│  fabrics / style_options ← app/api/admin/*（管理端批量上架）    │
│  customers / orders / users ← 业务 API                       │
└─────────────────────────────────────────────────────────────┘
```

**关键点**：静态面料库（STYLBIELLA_FABRICS）与管理端 DB 面料表是**两套并行数据源**——前者驱动下单选料，后者驱动后台上架展示，互不自动同步。

---

## 3. 数据质量现状（2026-08-26 审计）

运行 `python scripts/audit_content_assets.py` 复检。

### 3.1 通过项 ✅
- 面料主数据：630 条，code 唯一，无重复
- 颜色映射：630/630 全覆盖，0 缺失、0 孤儿
- 图片：630/630 全覆盖，0 缺图、0 孤儿图
- SEO 文章：slug 唯一、日期无异常、关键词无重复

### 3.2 待人工确认项 ⚠️

| 项目 | 数量 | 说明 |
|---|---|---|
| 同册重名 | 17 组 | 同一面料本内同名不同 code（如 6410 的 `深藏青`×3、`浅米褐`×3、6401 的 `宝蓝`×4），可能是有意的同色系分号，也可能是录入错误，需对照实物确认 |
| 跨册重名 | 71 组 | 不同面料本同名，属正常 |
| book 6401 低价面料 | 15 条（71671–71685） | 价格 180 元，命名多为"白底 XX 条纹"，疑似衬衫面料系列，与 6401 主体 680 元并存——确认是有意分层即可，否则拆分 |
| 英文名词典覆盖 | 34/422 | 见 3.3 |

### 3.3 英文名词典缺口（重点）

- `tailoring-terms.ts` 的 `fabricEnglish` 仅覆盖 34 个唯一名（422 个中）。
- 未覆盖名在非中文语种下由 `fabricDisplayName()` 降级为"颜色 · 纹理"泛化标签（如 `Grey · plain`），丢失具体名称信息。
- 已生成草稿：`docs/fabric-name-en-draft.csv`（34 个已有词典 + 255 个规则生成 = 289 个有翻译，133 个待确认）。
- **合并方式**：审核 CSV 后，将"建议英文翻译"填入 `tailoring-terms.ts` 的 `fabricEnglish`，重跑审计确认覆盖提升。

---

## 4. 资产详情与维护

### 4.1 面料主数据 `app/lib/stylbiella-fabrics.ts`

```ts
export type StylbiellaFabric = {
  code: string;      // 货号，全局唯一，如 "34561"
  name: string;      // 中文名（非中文语种经 tailoring-terms 翻译）
  book: string;      // 面料本编号：6401/6402/6403/6410–6416
  imageUrl: string;  // /stylbiella/{code}.webp
  price: number;     // 单价（元），面料本定价：见下
};
```

**价格分层**（当前）：6401=680（含 716xx 衬衫系列 180）｜6402=680｜6403=1280｜6410=680｜6411=780｜6412=880｜6413=680｜6414=760｜6415=580｜6416=1680。

**新增面料流程**：
1. 确认 code 未被占用（`audit_content_assets.py` 会报重复）
2. 图放入 `public/stylbiella/{code}.webp`（必须与 code 同名）
3. 颜色映射无需手动维护——`scripts/analyze_fabric_colors.py` 可从大图重新生成
4. 在数组中按 book 追加

### 4.2 款式术语与翻译 `app/lib/tailoring-terms.ts`

- `englishTerms`：中文术语 → 英文
- `localizedTailoringTerms`：特例词 → 全语种
- `japaneseTailoringTerms`：日文术语
- `garments` / `groups`：欧系语种（fr/it/es/...）
- `fabricEnglish`：**面料名英文词典**（当前缺口最大，见 §3.3）
- `materialLocale` / `fibreEnglish`：成分词翻译
- `localizedFabricColors` / `localizedPatterns`：色系 / 纹理翻译

### 4.3 SEO 文章 `app/lib/articles.ts`

结构：`slug / title / titleZh / description / descriptionZh / category / published / updated / readingTime / primaryKeyword / sections[]`。
新增文章：抄现有结构，slug 用 kebab-case 且全局唯一；`published` 用发布日期，`updated` ≥ `published`；category 建议复用现有 9 个分类之一。

### 4.4 款式参考图映射

key 格式 `${配置组}:${选项}`（避免不同组同名选项冲突），value 为 `style-options/...` 相对路径。图片来源：门店下单表扫描件人工核对。

### 4.5 DB 层

- `db/schema.ts`：Drizzle schema（users/fabrics/style_options/customers/orders）
- `db/init.ts`：幂等建表 SQL + 列迁移（ensureColumn）+ 默认 admin 账号
- 改表后：`npm run db:generate` 生成迁移，同时更新 `init.ts` 的 DDL 与 ensureColumn 列表（两处必须一致）

---

## 5. 维护工具

```bash
# 数据体检（覆盖率/重名/缺图/价格/文章一致性）
python scripts/audit_content_assets.py

# 重新生成面料颜色映射（需原大图，参照 analyze_fabric_colors.py 注释）
python scripts/analyze_fabric_colors.py

# 生成英文名词典草稿（输出 docs/fabric-name-en-draft.csv）
python scripts/generate_fabric_name_en.py
```

---

## 6. 数据守则

1. **code 即身份**：面料以 code 为准，名称只是展示；跨册可同名，同册尽量不重名。
2. **图片命名 = code**：`public/stylbiella/{code}.webp`，与 `imageUrl` 严格一致；审计脚本会报缺图/孤儿图。
3. **颜色映射只由脚本生成**：不要手改 `stylbiella-fabric-colors.ts`，改完重跑生成器。
4. **面料名翻译统一进 `fabricEnglish`**：不要散落各处硬编码；新名字必须补词典（否则非中文语种退化为泛化标签）。
5. **静态库与 DB 面料表是两套源**：上架走管理端 API，选料走静态库；改动前先确认改哪一套。
6. **schema 与 init.ts 必须同步**：加列时 DDL、ensureColumn、drizzle 迁移三处一致。
7. **审计脚本是守护**：每次批量改数据后跑一遍 `audit_content_assets.py`，0 缺图、0 孤儿、0 重复 code 再收工。
