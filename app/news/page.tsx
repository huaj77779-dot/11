"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { SEO_ARTICLES } from "../lib/articles";
import { useLocale } from "../lib/i18n";

export default function NewsPage() {
  const { loc, t } = useLocale();
  const zh = loc === "zh";
  const formatDate = (date: string) => new Intl.DateTimeFormat(loc === "zh" ? "zh-CN" : loc, {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  return <LandingSubpage>
    <section className="content-hero"><div className="landing-wrap">
      <p className="eyebrow">VEROSUITS · INSIGHTS</p>
      <h1>{t("pages.newsTitle")}</h1>
      <p>{t("pages.newsLead")}</p>
    </div></section>
    <section className="content-section"><div className="landing-wrap article-grid">
      {SEO_ARTICLES.map(article => <article className="article-card" key={article.slug}>
        {article.images?.[0] && <a className="article-card-image" href={`/news/${article.slug}`} aria-label={zh ? article.titleZh : article.title}>
          <img src={article.images[0].src} alt={article.images[0].alt} width="1200" height="1600" loading="lazy" decoding="async" />
        </a>}
        <div className="article-card-meta"><span>{article.category}</span><time dateTime={article.published}>{formatDate(article.published)}</time></div>
        <h2><a href={`/news/${article.slug}`}>{zh ? article.titleZh : article.title}</a></h2>
        <p>{zh ? article.descriptionZh : article.description}</p>
        <div className="article-card-foot"><small>{article.readingTime}</small><a href={`/news/${article.slug}`}>{t("pages.readGuide")}</a></div>
      </article>)}
    </div></section>
  </LandingSubpage>;
}
