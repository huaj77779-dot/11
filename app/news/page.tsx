"use client";

import { LandingSubpage } from "../_components/LandingSubpage";
import { SEO_ARTICLES } from "../lib/articles";
import { useLocale } from "../lib/i18n";

const fallbackCardImage = (category: string) => {
  if (/shipping|delivery/i.test(category)) {
    return { src: "/brand/client-journey/05-dispatch-tracking.webp", alt: "Tailored garments prepared for international dispatch at verosuits" };
  }
  if (/quality/i.test(category)) {
    return { src: "/brand/quality-china-01.webp", alt: "Tailored garment quality inspection at the verosuits workshop" };
  }
  if (/ordering|retail operations/i.test(category)) {
    return { src: "/brand/client-journey/02-measurement-style.webp", alt: "Made-to-measure style and measurement consultation at verosuits" };
  }
  if (/private label|business model/i.test(category)) {
    return { src: "/brand/advantage-white-label.webp", alt: "Private-label tailoring workflow at verosuits" };
  }
  return { src: "/brand/tailorsupply-workshop-hero.webp", alt: "Tailoring production in the verosuits workshop" };
};

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
      {SEO_ARTICLES.map((article) => {
        const cardImage = article.images?.[0] ?? fallbackCardImage(article.category);
        const fallbackImage = fallbackCardImage(article.category);
        return (
          <article className="article-card" key={article.slug}>
            <a className="article-card-image" href={`/news/${article.slug}`} aria-label={zh ? article.titleZh : article.title}>
              <img
                src={cardImage.src}
                alt={cardImage.alt}
                width="1200"
                height="1600"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImage.src;
                  event.currentTarget.alt = fallbackImage.alt;
                }}
              />
            </a>
            <div className="article-card-meta"><span>{article.category}</span><time dateTime={article.published}>{formatDate(article.published)}</time></div>
            <h2><a href={`/news/${article.slug}`}>{zh ? article.titleZh : article.title}</a></h2>
            <p>{zh ? article.descriptionZh : article.description}</p>
            <div className="article-card-foot"><small>{article.readingTime}</small><a href={`/news/${article.slug}`}>{t("pages.readGuide")}</a></div>
          </article>
        );
      })}
    </div></section>
  </LandingSubpage>;
}
