"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";
import "./quality.css";

export default function QualityPage() {
  const { t } = useLocale();
  return <LandingSubpage><main className="quality-page">
    <section className="quality-page-hero"><div className="landing-wrap">
      <p className="eyebrow">{t("landing.secQualityEyebrow")}</p>
      <h1>{t("landing.secQualityTitle")}</h1>
      <div className="quality-hero-line"><span>01—04</span><i /></div>
    </div></section>
    <section className="quality-page-body"><div className="landing-wrap">
      <div className="landing-quality-grid">{[1, 2, 3, 4].map(n => <article className="quality-card" key={n}><i>0{n}</i><h3>{t(`landing.quality${n}`)}</h3><p>{t(`landing.quality${n}Sub`)}</p></article>)}</div>
      <div className="landing-certs"><span><b>ISO 9001</b><small>{t("landing.cert1Sub")}</small></span><span><b>SGS</b><small>{t("landing.cert2Sub")}</small></span><span><b>◈</b><small>{t("landing.cert3Sub")}</small></span><span><b>QC</b><small>{t("landing.cert4Sub")}</small></span></div>
    </div></section>
  </main></LandingSubpage>;
}
