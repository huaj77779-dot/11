"use client";
import type { SeoArticle } from "../lib/articles";
import { useLocale } from "../lib/i18n";

export function ArticleBody({ article }: { article: SeoArticle }) {
  const { locale } = useLocale();
  const zh = locale === "zh-CN";
  const published = new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${article.published}T00:00:00Z`));
  return <article className="article-page">
    <header className="article-hero"><div className="landing-wrap article-narrow">
      <a className="back-link" href="/news">← {zh ? "全部文章" : "All insights"}</a>
      <p className="eyebrow">{article.category} · <time dateTime={article.published}>{published}</time></p>
      <h1>{zh ? article.titleZh : article.title}</h1>
      <p className="article-deck">{zh ? article.descriptionZh : article.description}</p>
      <div className="article-byline"><span>verosuits Editorial</span><span>{article.readingTime}</span><span>{article.primaryKeyword}</span></div>
    </div></header>
    <div className="landing-wrap article-narrow article-copy">
      {article.images?.[0] && <figure className="article-lead-image"><img src={article.images[0].src} alt={article.images[0].alt} /><figcaption>{article.images[0].caption}</figcaption></figure>}
      {zh && <aside className="translation-note">本页中文标题与摘要已适配；正文保留英文专业原文，避免行业术语直译失真。</aside>}
      {article.sections.map((section, index) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}{article.images?.[index + 1] && <figure className="article-inline-image"><img src={article.images[index + 1].src} alt={article.images[index + 1].alt} /><figcaption>{article.images[index + 1].caption}</figcaption></figure>}</section>)}
      <aside className="article-cta"><p className="eyebrow">VEROSUITS</p><h2>{zh ? "把这套流程用于你的门店" : "Put this workflow to work in your store"}</h2><p>{zh ? "查看从沟通、PI 确认到生产和交付的合作流程。" : "See how enquiry, PI approval, production and delivery connect in one B2B ordering workflow."}</p><a href="/client-stories">{zh ? "查看合作流程 →" : "See the cooperation process →"}</a></aside>
    </div>
  </article>;
}
