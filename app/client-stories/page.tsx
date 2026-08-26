"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";
import "./client-stories.css";

const STEPS = [
  ["01", "Enquiry & requirements", "询价及要求", "We confirm the store model, garment category, destination, expected volume and service requirements before quoting.", "报价前，我们会确认店铺模式、服装类别、目的地、预计销量和服务要求。"],
  ["02", "Fabric, measurements & style", "面料、尺寸和款式", "The store records the customer profile, chooses an exact fabric code and completes the visual style specification.", "门店建立客户档案，选择准确的面料编号，并完成可视化款式配置。"],
  ["03", "PI review & approval", "PI 审核与确认", "The PI brings customer, fabric, craft, quantity, price, address and payment details into one checkpoint.", "PI 将客户、面料、工艺、数量、价格、地址和付款信息集中确认。"],
  ["04", "Production & quality control", "生产与质量控制", "Production follows the approved record. QC verifies identity, measurements, construction and visible finish before dispatch.", "生产按已确认记录执行，发货前核对身份、尺寸、工艺和外观。"],
  ["05", "Dispatch & tracking", "发货与追踪", "Tracking, package count and dispatch date remain attached to the order so the store can update its customer.", "物流单号、包裹数量和发货日期会同步到订单，方便门店向客户更新进度。"],
  ["06", "Delivery, feedback & reorder", "签收、反馈与复购", "With permission, delivery evidence and fit feedback close the order. Accepted measurements become the reference for reorders.", "经客户授权后保存签收与试穿反馈；确认后的尺寸可作为后续复购依据。"],
];

const STEP_IMAGES = [
  { src: "/brand/client-journey/01-enquiry.webp", en: "Private-label tailoring enquiry and fabric consultation", zh: "私牌定制询价与面料沟通流程示意" },
  { src: "/brand/client-journey/02-measurement-style.webp", en: "Customer measurements and garment style selection", zh: "客户量体与服装款式选择流程示意" },
  { src: "/brand/client-journey/03-pi-approval.webp", en: "Redacted proforma invoice review and approval", zh: "隐去敏感信息的 PI 审核流程示意" },
  { src: "/brand/client-journey/04-quality-control.webp", en: "Tailored garment production quality inspection", zh: "定制服装生产与质量检查流程示意" },
  { src: "/brand/client-journey/05-dispatch-tracking.webp", en: "Garment packing, dispatch and shipment tracking", zh: "成衣包装、发货与物流追踪流程示意" },
  { src: "/brand/client-journey/06-delivery-reorder.webp", en: "Delivered garment fitting, feedback and reorder", zh: "成衣交付、试穿反馈与复购流程示意" },
];

export default function ClientStoriesPage() {
  const { locale } = useLocale();
  const zh = locale === "zh-CN";

  return <LandingSubpage>
    <section className="content-hero process-hero"><div className="landing-wrap">
      <p className="eyebrow">TAILORSUPPLY OS · VERIFIED WORKFLOW</p>
      <h1>{zh ? "从第一次沟通到客户签收" : "From First Message to Delivered Garments"}</h1>
      <p>{zh ? "用清晰的节点说明每一步由谁处理、确认什么，以及保留哪些记录。" : "A transparent B2B order journey designed to show what is confirmed, who acts next and what evidence is retained."}</p>
      <div className="trust-strip"><span>{zh ? "隐私处理" : "Privacy redacted"}</span><span>{zh ? "节点可追踪" : "Traceable checkpoints"}</span><span>{zh ? "真实资料替换" : "Real evidence only"}</span></div>
    </div></section>
    <section className="content-section"><div className="landing-wrap">
      <div className="process-intro"><div><p className="eyebrow">HOW COOPERATION WORKS</p><h2>{zh ? "顾客知道接下来会发生什么，商店也知道订单的进展。" : "Customers know what happens next. Stores know where the order stands."}</h2></div><p>{zh ? "以下图片为 AI 流程示意，不作为真实客户证据。正式发布客户资料时，只使用已获授权并完成隐私处理的内容。" : "The images below are AI workflow illustrations, not client evidence. Published client material must be permission-cleared and privacy-redacted."}</p></div>
      <div className="process-grid">{STEPS.map((step, index) => <article className="process-card" key={step[0]}>
        <div className="process-copy"><span className="step-no">{step[0]}</span><h2>{zh ? step[2] : step[1]}</h2><p>{zh ? step[4] : step[3]}</p></div>
        <figure className="proof-slot proof-filled"><img src={STEP_IMAGES[index].src} alt={zh ? STEP_IMAGES[index].zh : STEP_IMAGES[index].en} loading="lazy" /><span className="illustration-badge">{zh ? "AI 流程示意图" : "AI workflow illustration"}</span><figcaption>{zh ? "发布真实资料前，请遮挡姓名、电话、地址、付款和物流信息。" : "Redact names, phones, addresses, payment and tracking details before publishing real material."}</figcaption></figure>
      </article>)}</div>
    </div></section>
    <section className="case-standard"><div className="landing-wrap case-standard-inner"><div><p className="eyebrow">PUBLISHING STANDARD</p><h2>{zh ? "什么样的客户案例才可信" : "What makes a client story credible"}</h2></div><ul><li>{zh ? "说明客户类型、国家和产品，不虚构身份。" : "State customer type, country and product without inventing identities."}</li><li>{zh ? "隐去 PI、物流和成衣资料中的全部敏感信息。" : "Redact all sensitive data from PI, shipping and garment evidence."}</li><li>{zh ? "明确区分真实案例、流程示意和 AI 预览。" : "Clearly separate verified cases, workflow examples and AI previews."}</li><li>{zh ? "仅在获得书面许可后发布沟通和交付资料。" : "Publish messages and delivery evidence only with written permission."}</li></ul><a href="/#contact">{zh ? "开始沟通 →" : "Start a conversation →"}</a></div></section>
  </LandingSubpage>;
}
