# TailorSupply OS · 网站细节全解

> 数据级细节文档：面料数据、价格、选项、量体、PI、订单模型、API 全清单
> 整理日期：2026-08-26 ｜ 数据来源：代码逐行核对（`app/`、`db/schema.ts`、`app/api/`、`lib/`）
> 关联文档：[FABRIC-CATALOG.md](FABRIC-CATALOG.md)（630 条面料全表）

---

## 一、面料体系（数据级）

### 1.1 面料本元数据（10 册）

数据源：`tailoring-app.tsx` 的 `FABRIC_BOOK_DETAILS`。

| 面料本 | 系列名 | 成分/支数 | 克重 | 适用产品 | 季节 | 页数 | 价格(元/米) | 条目数 |
|---|---|---|---|---|---|---|---|---|
| 6401 | SKYLINE | Super 110's 羊毛 | 270g | 西装、上衣、西裤、马甲 | 四季 | 37 | 680（含衬衫料 180） | 153 |
| 6402 | JACKETING | 混纺 | 260–480g | 单西、休闲西装 | 多季节 | 23 | 680 | 41 |
| 6403 | OVERCOAT | 羊毛/羊绒/羊驼 | 440–720g | 大衣、外套 | 秋冬 | 23 | 1280 | 38 |
| 6410 | SKYLINE | Super 110's 纯羊毛（幅宽150cm） | 270g | 西装、上衣、西裤、马甲 | 四季 | 12 | 680 | 98 |
| 6411 | KNIGHT | 纯羊毛 | 360g | 西装、上衣、西裤 | 秋冬 | 10 | 780 | 71 |
| 6412 | HIGHLAND | Super 150's 羊毛+羊绒 | 300g | 高级西装、正式定制 | 秋冬及过渡季 | 7 | 880 | 49 |
| 6413 | ESSENTIAL | Super 110's 羊毛 | 270g | 西装、上衣、西裤、马甲 | 四季 | 12 | 680 | 92 |
| 6414 | JOURNEY | 羊毛真丝 / Super 120's | 320g / 280g | 旅行西装、上衣、西裤 | 多季节 | 6 | 760 | 32 |
| 6415 | MARBLE FLANNEL | 羊毛/棉/羊绒 | 310g | 西装、上衣、西裤 | 秋冬 | 6 | 580 | 32 |
| 6416 | OVERCOATS | 纯羊绒 | 500g | 大衣、高级外套 | 冬季 | 5 | 1680 | 24 |

### 1.2 价格分层（已确认）

| 价格档 | 面料本 | 说明 |
|---|---|---|
| 180 元/米 | 6401（71671–71685，15 条） | 白底条纹衬衫料，混在 6401 册内，**待确认是否独立成册** |
| 580 元/米 | 6415 | 法兰绒 |
| 680 元/米 | 6401（其余 138 条）、6402、6410、6413 | 主力西装料 |
| 760 元/米 | 6414 | 旅行系列 |
| 780 元/米 | 6411 | 厚实纯羊毛 |
| 880 元/米 | 6412 | 高支+羊绒 |
| 1280 元/米 | 6403 | 大衣料 |
| 1680 元/米 | 6416 | 纯羊绒大衣 |

### 1.3 颜色与图片体系

- 630 条面料 ↔ 630 条颜色映射（`stylbiella-fabric-colors.ts`：`code → {color 色系, colors[], hex 色值}`，由脚本从实物大图自动提取）↔ 630 张图（`public/stylbiella/{code}.webp`），**三套数据 100% 对齐**
- 颜色映射支持"一料双色系"（混色纱线），每条可属两个色族
- 面料名：中文存储（如"深炭蓝藏青"），非中文语种经 `fabricEnglish` 词典翻译，未覆盖时回退为"颜色 · 纹理"泛化标签（当前覆盖 289/422，见《面料英文名词典》）

### 1.4 面料选择交互

- 按面料本（book）浏览，带封面图/页数/系列说明（中英双语 positioning）
- 搜索维度：货号 / 品牌 / 颜色 / 成分
- 筛选维度：色系（colorFilter）、纹理（patternFilter）、克重（weightFilter）、成分（compositionFilter）
- 衬衫另配独立面料集 `STYLBIELLA_SHIRT_FABRICS`
- **完整 630 条明细（货号/名称/色系/色值/价格）见 [FABRIC-CATALOG.md](FABRIC-CATALOG.md)**

---

## 二、定制下单流程（/customize，逐步骤）

### 2.1 品类与量体字段（31 个字段，净体/成衣双列）

| 品类 | 量体字段（净体, 成衣默认值 cm） |
|---|---|
| 西装上衣 | 夹宽(44,46) 肩宽(45,45.5) 臂围(34,36) 袖长(61,62) 胸围(98,106) 中腰(88,96) 腰围(90,98) 下摆(100,108) 前长(74,75) 后长(71,72) |
| 西裤 | 裤腰(86,88) 臀围(98,102) 横档(27,29) 腿围(56,58) 全档(74,76) 裤长(101,102) 脚口(36,37) |
| 马甲 | 胸围(98,102) 腰围(90,94) 前长(61,62) 后长(55,56) |
| 衬衫 | 领围(39,40) 肩宽(45,46) 胸围(98,110) 肚围(90,102) 摆围(100,110) 袖肥(34,37) 腕围(18,20) 长袖长(61,62) 前衣长(74,75) 后衣长(76,77) |

每个尺寸存 `[净体, 成衣]` 二元组，历史存客户档案（JSON：`{"jacket:胸围": ["净体","成衣"], ...}`）。

### 2.2 体态登记（5 组微调）

| 组 | 选项（cm） |
|---|---|
| 驼背 | 正常背 ｜ 背长加长 1 / 1.5 / 2 / 2.5cm |
| 凸肚 | 正常肚 ｜ 前肚围加大 1 / 2 / 3 / 4cm |
| 挺胸 | 正常胸 ｜ 前腰节长加 1 / 1.5 / 2 / 2.5cm |
| 左平溜肩 | 平肩上提 2 / 1.5 / 1 / 0.5cm ｜ 正常肩 ｜ 微溜肩下调 0.5 ｜ 中溜肩下调 0.8 ｜ 重溜肩下调 1.2cm |
| 右平溜肩 | 同上（左右独立设置） |

### 2.3 款式配置（4 品类全部选项组与选项）

**西装上衣（11 组 · 44 个选项）**

| 组 | 选项 |
|---|---|
| 正面款式(8) | 单排两粒扣 / 单排一粒扣 / 单排三粒扣 / 单排四粒扣 / 双排四扣四 / 双排四扣二 / 双排六扣四 / 双排六扣二 |
| 胸兜款式(3) | 直兜 / 双牙兜 / 弧形兜 |
| 下摆开角大小(3) | 标准下摆 / 大开角下摆 / 小开角下摆 |
| 肩膀样式(2) | 自然肩 / 法式翘肩 |
| 口袋款式(8) | 标准兜 / 标准兜票据兜 / 明贴兜 / 双牙兜 / 双牙兜票据兜 / 双牙斜兜票据兜 / 斜兜 / 斜兜票据兜 |
| 西服背面款式(4) | 常规后背 / T型后背 / 后腰带捏褶 / 后腰固定腰带 |
| 西服开衩选择(3) | 双开衩 / 不开衩 / 单开衩 |
| 毛衬(3) | 粘合衬 / 半麻衬 / 全麻衬 |
| 里布位置(4) | 全里布 / 二分之一里布 / 三分之一里布 / 四分之一里布 |
| 驳头款式(3) | 平驳领 / 青果领 / 戗驳领 |
| 袖叉款式(3) | 假扣眼 / 无扣眼 / 真扣眼 |

**西裤（5 组 · 20 个选项）**：扣型(圆腰头/双扣意式腰头/好莱坞腰头/宝剑头/平腰头/廓尔格腰头)、褶皱(三/无/单/双)、裤脚(内折边/毛边/外翻翘/靴裤脚口)、裤型(喇叭/锥状/标准/直筒)、裤脚口(打开/三角开口)

**马甲（4 组 · 16 个选项）**：马甲款式(标准五粒扣/圆形三粒扣/双排六扣三/青果领三粒扣/平驳领五粒扣/平驳领六扣三/戗驳领五粒扣/戗驳领六扣三)、马甲口袋数量(无/单/双胸兜)、马甲口袋款式(标准兜/带兜盖/双牙兜)、马甲下摆(平摆/尖摆)

**衬衫（17 组 · 82 个选项）**

| 组 | 选项 |
|---|---|
| 领型(15) | 标准领 ｜ 小八领(5.7) ｜ 中八领(7.1) ｜ 大八领(8.0) ｜ 法式温莎领(8.0) ｜ 意式温莎领(8.2) ｜ 雅致一字领(8.5×3.5) ｜ 伊顿领(6.0) ｜ 大尖领(8.0) ｜ 意式长尖领(10) ｜ 古巴领 ｜ 意式一片领(9.5) ｜ 针孔领(11.5) ｜ 燕子领(5.9) ｜ 立领圆角带扣(3.4) |
| 领插片(5) | 无插片 / 固定内插片 / 活动外插片 / 领尖外扣 / 领尖底扣 |
| 领硬度(3) | 硬 / 中 / 软手感 |
| 袖口折(4) | 单折 / 双折 / 意式三折 / 意式碎折 |
| 口袋(4) | 无口袋 / 圆口袋 / 六角袋 / 三角袋 |
| 袖口(17) | 圆角单扣 / 直角单扣 / 斜角单扣 ｜ 圆角/直角/斜角双扣 ｜ 圆角/直角/斜角三扣 ｜ 方角月牙袖口 / 大圆角 ｜ 直角法式袖 / 圆角法式袖口 / 斜角法袖 / 单层圆角法式 ｜ 意式法式袖3# / 意式法式袖2# |
| 前幅门襟(4) | 明门襟默认3.0 / 明门襟2.5 / 翻门襟 / 暗门襟 |
| 下摆(4) | 圆摆 / 圆摆贴三角 / 圆摆宝剑头贴 / 平摆 |
| 后担干(2) | 正常担干 / 担干八字拼接 |
| 后幅(7) | 无折无省 / 打双折 / 后腰收腰省 / 工字折 / 意式后片碎折 / 后反字折 / 后工字折到底 |
| 侧缝工艺(1)* | 手工包缝 |
| 袖山意式碎折(1)* | 袖山意式碎折 |
| 错位上袖(1)* | 需要 |
| 鸡爪扣钉(1)* | 需要 |
| 礼服打条(1)* | 礼服打条 |
| 字体(5) | 509 / 511 / 512 / 不需要 / 图片 |
| 文字位置(7) | 左领尖 / 左前胸 / 口袋 / 领下底门襟 / 后领中 / 左袖口左 / 左袖口中 |

\* 带星号为"可选加项"（OPTIONAL_SHIRT_GROUPS），默认不选。
每项选项可配参考图（`public/style-options/`，映射表见 `suit-option-images.ts` / `shirt-option-images.ts`）；**选项加价存数据库 `style_options.surcharge`（管理端维护），不在代码里**。

### 2.4 PI 数据模型（Proforma Invoice）

每行 PI 项 `PiItem` 字段：`key / kind(product|fabric) / garmentType / garmentName / fabricCode / fabricName / fabricMill / meters(用料米数) / basePrice(基础价) / fabricPrice(面料价) / optionExtra(选项加价合计) / shippingFee(运费) / productPrice(成品价) / weightKg(重量) / options[{group,item,price}] / measurements[{field,net,finished}]`。

计价：**productPrice = basePrice + fabricPrice + optionExtra + shippingFee**；总价 = 各 PI 行合计（默认 CNY），按币种换算显示。

### 2.5 支付流程

1. 提交订单 → 生成 QR 收款码（payload 格式 `ORDER:{id};AMOUNT:{金额}`）
2. 前端每 **5 秒**轮询 `/api/orders/{id}/payment-status`
3. 状态 unpaid → paid 后自动关闭弹窗并标记完成
4. ⚠️ 当前为**占位实现**：QR 内容是占位串，代码中已注释预留支付宝当面付 / 微信 Native 的接入点

### 2.6 AI 预览（可选）

- 接口：`POST /api/generate-image`（OpenAI 兼容 Images API；未配置密钥时返回 `public/ai-previews/` 演示图）
- 输入：款式参考图（最多 4 张）+ 模式（穿着 wear / 平铺 flat）
- Prompt 结构：`{款式文字摘要} {尺寸} {体态}, ultra detailed, high resolution, realistic fabric texture, professional menswear photography, soft studio lighting, no visible face, no facial features, no head in frame, no text, no watermark, no logo`

---

## 三、数据模型（D1 SQLite，db/schema.ts）

### users（账号）
`id / username(唯一) / passwordHash / role(master|store) / storeName / token / tokenExpiresAt / createdAt`

### fabrics（管理端面料库，与静态 STYLBIELLA_FABRICS 并行）
`id / code(唯一) / name / mill(厂牌) / book(册) / tone(色调,默认navy) / meta / stock(默认"现货") / price / imageUrl / garmentType(默认jacket) / sortOrder / active / createdAt`

### style_options（款式选项库）
`id / garmentType / groupTitle / item / surcharge(加价CNY) / imageUrl / sortOrder / active / createdAt`

### customers（客户档案）
`id / ownerId / name / height / weight / channelCode(渠道码) / avatarUrl / country / region / city / street / postalCode / notes / measurements(JSON) / measurementsSavedAt / totalOrders / totalSpent / lastOrderAt / createdAt / updatedAt`

### orders（订单，下单时全部快照）
`id / ownerId / orderNo(唯一) / customerId(FK) / customerSnapshot(JSON) / status(默认pending) / paymentStatus(unpaid|paid) / garmentType / garmentName / fabricCode / fabricName / fabricMill / basePrice / fabricPrice / optionExtra / shippingFee / totalPrice / currency(默认CNY) / weightKg / options(JSON) / measurements(JSON) / shippingAddress(JSON) / channelCode / createdAt / updatedAt`

---

## 四、API 端点全清单

| 方法 | 路径 | 功能 | 鉴权 |
|---|---|---|---|
| GET | /api/orders | 订单列表（按 ownerId 隔离） | 登录 |
| POST | /api/orders | 创建订单 | 登录 |
| GET/PATCH/DELETE | /api/orders/[id] | 订单详情/更新/删除 | 登录 |
| GET | /api/orders/[id]/payment-status | 支付状态轮询（返回 qrPayload/qrDataUrl） | 登录 |
| POST | /api/auth/login | 登录（SHA-256 加盐哈希校验） | 公开 |
| POST | /api/auth/logout | 登出 | 登录 |
| GET | /api/auth/me | 当前用户 | 登录 |
| GET/POST | /api/admin/fabrics | 面料列表/批量上架 | master |
| PATCH/DELETE | /api/admin/fabrics/[id] | 面料编辑/删除 | master |
| GET/POST | /api/admin/styles | 款式选项列表/批量导入 | master |
| PATCH/DELETE | /api/admin/styles/[id] | 选项编辑/删除 | master |
| GET/POST | /api/admin/users | 账号列表/创建 | master |
| PATCH/DELETE | /api/admin/users/[id] | 账号编辑/删除 | master |
| GET/POST | /api/customers | 客户列表/创建 | 登录 |
| GET/PATCH/DELETE | /api/customers/[id] | 客户详情/更新/删除 | 登录 |
| POST | /api/contact | 首页联系表单 | 公开 |
| GET | /api/exchange-rates | 汇率（open.er-api.com，基准 CNY，缓存 1h/6h） | 公开 |
| POST | /api/generate-image | AI 生成穿着/平铺效果图 | 登录 |

---

## 五、支撑能力细节

### 5.1 多语言（14 语种）

语种集：`zh / en / de / ja / fr / it / es / pt / nl / pl / sv / da / no / cs`。
- UI 文案：`i18n.ts`（zh/en/de/ja）+ `eu-translations.ts`（欧系 10 语）
- 术语：`tailoring-terms.ts` 分层（englishTerms / localizedTailoringTerms 特例 / japaneseTailoringTerms / garments·groups 欧系 / fabricEnglish 面料名 / materialLocale·fibreEnglish 成分）
- 持久化：cookie + localStorage；右上角 LanguageSwitcher 切换

### 5.2 货币与汇率

- 语言→币种映射：zh→CNY、en→GBP、de/fr/it/es/pt/nl→EUR、ja→JPY、pl→PLN、sv→SEK、da→DKK、no→NOK、cs→CZK
- 汇率：`/api/exchange-rates`（ExchangeRate-API，基准 CNY），失败时用内置兜底汇率；localStorage 缓存 key `tailorsupply-fx`
- 显示：Intl.NumberFormat，JPY/CNY 取整、其余两位小数

### 5.3 登录与身份

- 账号密码登录，SHA-256 加盐哈希存库，token 会话（含过期时间）
- 角色：master（主账号）/ store（门店子账号）；数据按 ownerId 隔离
- 支持 ChatGPT 登录头（`oai-authenticated-user-id` / `oai-authenticated-email`）：站点可挂在 ChatGPT/GPTs 环境内带身份访问

### 5.4 白标模式

- `TailoringApp` 的 `whiteLabel` 属性：切换品牌化展示（门店名/logo），白标门店直接复用整套下单流程

### 5.5 参考图体系

- 下单表参考图：`style-options/`（西装）+ `garment-options/`（衬衫）分类目录，key 格式 `组:选项`
- 英文名参考表：`public/style-options/english-name-reference.tsv`（品类/组/选项/图片路径四列，供翻译与图名对应）

---

## 六、页面/路由全清单

| 路由 | 类型 | 说明 |
|---|---|---|
| / | 公开 | 首页（hero、服务优势、合作表单、联系方式） |
| /private-label-suits、/made-to-measure-suits、/custom-tailoring-supplier | 公开·SEO | 落地页（SeoServicePage 模板，独立 metadata） |
| /news、/news/[slug] | 公开·SEO | 10 篇文章（articles.ts） |
| /company、/quality、/client-stories | 公开 | 品牌/质检/客户案例 |
| /customize | 登录 | 定制下单主流程（本文件 §二） |
| /customers | 登录 | 客户档案管理（量体历史/消费统计） |
| /orders | 登录 | 订单历史与详情 |
| /login | 公开 | 登录页 |
| /admin | master | 管理端（面料/款式/账号三面板） |
| 业务页（customize/customers/orders/admin） | — | 均 robots noindex，不收录 |

---

*本文档与代码一一对应；数据改动后建议重跑 `scripts/audit_content_assets.py` 守护一致性。*
