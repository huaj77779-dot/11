"use client";
import { LandingSubpage } from "../_components/LandingSubpage";
import { useLocale } from "../lib/i18n";

const NEWS = [
  { dateKey:"landing.news1Date",tagKey:"landing.news1Tag",titleKey:"landing.news1Title",excerptKey:"landing.news1Excerpt",tone:"navy" },
  { dateKey:"landing.news2Date",tagKey:"landing.news2Tag",titleKey:"landing.news2Title",excerptKey:"landing.news2Excerpt",tone:"gold" },
  { dateKey:"landing.news3Date",tagKey:"landing.news3Tag",titleKey:"landing.news3Title",excerptKey:"landing.news3Excerpt",tone:"green" },
  { dateKey:"landing.news4Date",tagKey:"landing.news4Tag",titleKey:"landing.news4Title",excerptKey:"landing.news4Excerpt",tone:"charcoal" },
];

export default function NewsPage() {
  const { t } = useLocale();
  return <LandingSubpage><section className="landing-section landing-subpage"><div className="landing-wrap">
    <div className="landing-section-head"><p className="eyebrow">{t("landing.secNewsEyebrow")}</p><h1>{t("landing.secNewsTitle")}</h1></div>
    <div className="landing-news-grid">{NEWS.map(item => <article className="news-card" key={item.titleKey}><div className={`news-thumb ${item.tone}`}><span className={`mini-swatch ${item.tone}`} /></div><div className="news-meta"><time>{t(item.dateKey)}</time><em>{t(item.tagKey)}</em></div><h3>{t(item.titleKey)}</h3><p>{t(item.excerptKey)}</p><a href="/news">{t("landing.readMore")}</a></article>)}</div>
  </div></section></LandingSubpage>;
}
