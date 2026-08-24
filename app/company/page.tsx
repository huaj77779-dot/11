"use client";
import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";

export default function CompanyPage() {
  const { t } = useLocale();
  return <LandingSubpage><section className="landing-section landing-subpage"><div className="landing-wrap">
    <div className="landing-section-head"><p className="eyebrow">{t("landing.secCompanyEyebrow")}</p><h1>{t("landing.secCompanyTitle")}</h1></div>
    <div className="landing-company"><div className="landing-company-copy"><p className="landing-lead">{t("landing.secCompanyLead")}</p><ul className="landing-points">
      <li><i>01</i>{t("landing.companyPoint1")}</li><li><i>02</i>{t("landing.companyPoint2")}</li><li><i>03</i>{t("landing.companyPoint3")}</li><li><i>04</i>{t("landing.companyPoint4")}</li>
    </ul><a className="landing-cta sm" href="/customize">{t("landing.heroCta")} →</a></div>
    <div className="landing-company-visual"><div className="mill-card"><span className="swatch navy" /><div><b>Vitale Barberis Canonico</b><small>VBC-110-NV · 深海军蓝精纺</small></div></div><div className="mill-card"><span className="swatch white" /><div><b>Albini</b><small>SH-100-WH · 经典白色府绸</small></div></div></div></div>
  </div></section></LandingSubpage>;
}
