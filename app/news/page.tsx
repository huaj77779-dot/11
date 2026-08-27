"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { SEO_ARTICLES } from "../lib/articles";
import { useLocale } from "../lib/i18n";

export default function NewsPage() {
  const { locale } = useLocale();
  const zh = locale === "zh-CN";
  return <LandingSubpage>
    <section className="content-hero"><div className="landing-wrap">
      <p className="eyebrow">TAILORSUPPLY OS · INSIGHTS</p>
      <h1>{zh ? "定制男装供应与门店增长指南" : "Practical Guides for Tailoring Businesses"}</h1>
      <p>{zh ? "围绕私牌生产、低起订、面料采购、量体复购、质检和国际交付的真实运营内容。" : "Evidence-led guidance on private-label production, low-MOQ ordering, fabric sourcing, measurements, quality control and international delivery."}</p>
    </div></section>
    <section className="content-section"><div className="landing-wrap article-grid">
      {SEO_ARTICLES.map(article => <article className="article-card" key={article.slug}>
        {article.images?.[0] && <a className="article-card-image" href={`/news/${article.slug}`} aria-label={zh ? article.titleZh : article.title}>
          <img src={article.images[0].src} alt={article.images[0].alt} width="1200" height="1600" loading="lazy" decoding="async" />
        </a>}
        <div className="article-card-meta"><span>{article.category}</span><time>{article.published}</time></div>
        <h2><a href={`/news/${article.slug}`}>{zh ? article.titleZh : article.title}</a></h2>
        <p>{zh ? article.descriptionZh : article.description}</p>
        <div className="article-card-foot"><small>{article.readingTime}</small><a href={`/news/${article.slug}`}>{zh ? "阅读全文 →" : "Read guide →"}</a></div>
      </article>)}
    </div></section>
  </LandingSubpage>;
}
