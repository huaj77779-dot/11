# TailorSupply OS 项目知识库

这里是项目的统一知识入口。以后新增需求、修改规则或排查问题，先在这里确认对应模块，避免页面、PI、客户档案和多语言之间出现不一致。

## 快速导航

| 文档 | 用途 |
| --- | --- |
| [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md) | 品牌定位、客户、产品范围和设计方向 |
| [02-BUSINESS-WORKFLOW.md](./02-BUSINESS-WORKFLOW.md) | 从客户建档到生产、发货的完整业务流程 |
| [03-PRODUCT-RULES.md](./03-PRODUCT-RULES.md) | 面料、量体、体态、款式、PI 的核心规则 |
| [04-DATA-AND-PRICING.md](./04-DATA-AND-PRICING.md) | 数据来源、保存、价格、汇率和同步原则 |
| [05-DESIGN-AND-I18N.md](./05-DESIGN-AND-I18N.md) | 棕色老钱风设计与多语言规范 |
| [06-OPERATIONS-CHECKLIST.md](./06-OPERATIONS-CHECKLIST.md) | 修改、测试、发布前检查清单 |
| [DECISIONS.md](./DECISIONS.md) | 已确认且不应被随意改回的产品决策 |
| [CHANGELOG.md](./CHANGELOG.md) | 重要改动记录 |

## 详细参考资料

- [SITE-DETAILS.md](./SITE-DETAILS.md)：页面、组件、路由、数据库、API 和功能明细。
- [FABRIC-CATALOG.md](./FABRIC-CATALOG.md)：面料册及面料编号目录。
- [CONTENT-KB.md](./CONTENT-KB.md)：图片、PDF、内容资产与依赖关系。
- [fabric-name-en-draft.csv](./fabric-name-en-draft.csv)：面料英文名称草稿及校对素材。
- [SEO与门店下单优化方案.md](../SEO与门店下单优化方案.md)：SEO 与下单体验优化方案。

## 维护方法

1. 新需求先记录到对应主题文档；影响多个页面时，同时更新 `DECISIONS.md`。
2. 面料、价格和款式选项以代码中的结构化数据为唯一事实源，文档只解释规则，不复制一份容易过期的数据。
3. 删除款式时，要同时检查默认值、已选状态、PI 摘要、历史订单映射和翻译词条。
4. 修改文案时必须覆盖全部语言，不能只改中文或英文。
5. 每次完成一组较大的功能后，在 `CHANGELOG.md` 留下日期、范围和验证结果。

