"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";
import "./quality.css";

const QUALITY_IMAGES = [
  ["/brand/quality-china-01.png", "Chinese factory inspector checking and identifying a navy wool roll"],
  ["/brand/quality-china-02.png", "Cutting, sewing and pressing zones in a modern Chinese suit factory"],
  ["/brand/quality-china-03.png", "Chinese quality specialists checking the measurements of a finished suit jacket"],
  ["/brand/quality-china-04.png", "Chinese production team reviewing capacity and delivery plans on the factory floor"],
] as const;

export default function QualityPage() {
  const { t } = useLocale();
  return <LandingSubpage><main className="quality-page">
    <section className="quality-page-hero"><div className="landing-wrap">
      <p className="eyebrow">{t("landing.secQualityEyebrow")}</p>
      <h1>{t("landing.secQualityTitle")}</h1>
      <div className="quality-hero-line"><span>01—04</span><i /></div>
    </div></section>
    <section className="quality-page-body"><div className="landing-wrap">
      <div className="landing-quality-grid">{QUALITY_IMAGES.map(([src, alt], index) => { const n = index + 1; return <article className="quality-card" key={src}><img src={src} alt={alt} loading="lazy"/><div className="quality-card-copy"><i>0{n}</i><h3>{t(`landing.quality${n}`)}</h3><p>{t(`landing.quality${n}Sub`)}</p></div></article>; })}</div>
      <div className="landing-certs"><span><b>ISO 9001</b><small>{t("landing.cert1Sub")}</small></span><span><b>SGS</b><small>{t("landing.cert2Sub")}</small></span><span><b>◈</b><small>{t("landing.cert3Sub")}</small></span><span><b>QC</b><small>{t("landing.cert4Sub")}</small></span></div>
    </div></section>
  </main></LandingSubpage>;
}
