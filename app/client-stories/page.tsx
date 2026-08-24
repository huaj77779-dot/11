"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";

const STEPS = [
  ["01", "Enquiry & requirements", "沟通需求", "We confirm the store model, garment category, destination, expected volume and service requirements before quoting.", "确认门店模式、产品类别、目的地、预计订单量与服务要求后再报价。", "Client message / meeting note", "客户沟通截图或会议纪要"],
  ["02", "Fabric, measurements & style", "面料、量体与款式", "The store records the customer profile, chooses an exact fabric code and completes the visual style specification.", "门店建立客户档案，选择准确面料编号并完成可视化款式配置。", "Approved measurement and style summary", "已确认量体与款式摘要"],
  ["03", "PI review & approval", "PI 审核确认", "The PI brings customer, fabric, craft, quantity, price, address and payment details into one checkpoint.", "PI 将客户、面料、工艺、数量、价格、地址和付款信息集中确认。", "Redacted PI approval", "已脱敏 PI 确认截图"],
  ["04", "Production & quality control", "生产与质量控制", "Production follows the approved record. QC verifies identity, measurements, construction and visible finish before dispatch.", "生产依据确认记录执行，发货前核对身份、尺寸、工艺和外观。", "QC photo or inspection record", "质检照片或检查记录"],
  ["05", "Dispatch & tracking", "发货与追踪", "Tracking, package count and dispatch date remain attached to the order so the store can update its customer.", "物流单号、包裹数量与发货日期跟随订单保存，方便门店同步客户。", "Shipping label / tracking event", "物流面单或追踪截图"],
  ["06", "Delivery, feedback & reorder", "签收、反馈与复购", "With permission, delivery evidence and fit feedback close the order. Accepted measurements become the reference for reorders.", "经客户授权后保存签收证据与试穿反馈，确认后的尺寸用于后续复购。", "Delivery or fitting photo", "签收或试穿照片"],
];

export default function ClientStoriesPage() {
  const { locale } = useLocale();
  const zh = locale === "zh-CN";
  return <LandingSubpage>
    <section className="content-hero process-hero"><div className="landing-wrap">
      <p className="eyebrow">TAILORSUPPLY OS · VERIFIED WORKFLOW</p>
      <h1>{zh ? "从第一次沟通到客户签收" : "From First Message to Delivered Garments"}</h1>
      <p>{zh ? "让合作证据解释每一步，而不是依靠空泛的质量承诺。" : "A transparent B2B order journey designed to show what is confirmed, who acts next and what evidence is retained."}</p>
      <div className="trust-strip"><span>{zh ? "资料脱敏" : "Privacy redacted"}</span><span>{zh ? "节点可追踪" : "Traceable checkpoints"}</span><span>{zh ? "真实资料替换" : "Real evidence only"}</span></div>
    </div></section>
    <section className="content-section"><div className="landing-wrap">
      <div className="process-intro"><div><p className="eyebrow">HOW COOPERATION WORKS</p><h2>{zh ? "客户知道下一步，门店知道订单在哪里" : "Customers know what happens next. Stores know where the order stands."}</h2></div><p>{zh ? "下面的展示位只接受取得授权并完成隐私遮挡的真实资料。目前不使用虚构聊天记录、评价或签收图片。" : "Every evidence slot below is reserved for permission-cleared, privacy-redacted client material. No invented chats, testimonials or delivery photos are used."}</p></div>
      <div className="process-grid">{STEPS.map(step => <article className="process-card" key={step[0]}>
        <div className="process-copy"><span className="step-no">{step[0]}</span><h2>{zh ? step[2] : step[1]}</h2><p>{zh ? step[4] : step[3]}</p></div>
        <figure className="proof-slot"><div><b>{zh ? "等待真实资料" : "Verified evidence pending"}</b><span>{zh ? step[6] : step[5]}</span></div><figcaption>{zh ? "上传前请遮挡姓名、电话、地址、付款和物流隐私信息" : "Before publishing: hide names, phones, addresses, payment and tracking details."}</figcaption></figure>
      </article>)}</div>
    </div></section>
    <section className="case-standard"><div className="landing-wrap case-standard-inner"><div><p className="eyebrow">PUBLISHING STANDARD</p><h2>{zh ? "什么样的客户案例才可信" : "What makes a client story credible"}</h2></div><ul><li>{zh ? "注明客户类型、国家和产品，不虚构姓名。" : "State customer type, country and product without inventing identities."}</li><li>{zh ? "展示 PI、物流或成衣时遮挡全部敏感信息。" : "Redact all sensitive data from PI, shipping and garment evidence."}</li><li>{zh ? "清楚区分真实案例、流程示例和效果图。" : "Clearly separate verified cases, workflow examples and AI previews."}</li><li>{zh ? "获得客户书面授权后才发布沟通和签收资料。" : "Publish messages and delivery evidence only with written permission."}</li></ul><a href="/#contact">{zh ? "开始合作 →" : "Start a conversation →"}</a></div></section>
  </LandingSubpage>;
}
