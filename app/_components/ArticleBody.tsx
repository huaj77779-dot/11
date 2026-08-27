"use client";
import type { SeoArticle } from "../lib/articles";
import { useLocale } from "../lib/i18n";

export function ArticleBody({ article }: { article: SeoArticle }) {
  const { locale } = useLocale();
  const zh = locale === "zh-CN";
  return <article className="article-page">
    <header className="article-hero"><div className="landing-wrap article-narrow">
      <a className="back-link" href="/news">← {zh ? "全部文章" : "All insights"}</a>
      <p className="eyebrow">{article.category} · {article.published}</p>
      <h1>{zh ? article.titleZh : article.title}</h1>
      <p className="article-deck">{zh ? article.descriptionZh : article.description}</p>
      <div className="article-byline"><span>TailorSupply OS Editorial</span><span>{article.readingTime}</span><span>{article.primaryKeyword}</span></div>
    </div></header>
    <div className="landing-wrap article-narrow article-copy">
      {zh && <aside className="translation-note">本页中文标题与摘要已适配；正文保留英文专业原文，避免行业术语直译失真。</aside>}
      {article.images && <div className="article-gallery">
        {article.images.map((image, index) => <figure className={index === 0 ? "article-photo article-photo-featured" : "article-photo"} key={image.src}>
          <img src={image.src} alt={image.alt} width="1200" height="1600" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          <figcaption>{image.caption}</figcaption>
        </figure>)}
      </div>}
      {article.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}
      <aside className="article-cta"><p className="eyebrow">TAILORSUPPLY OS</p><h2>{zh ? "把这套流程用于你的门店" : "Put this workflow to work in your store"}</h2><p>{zh ? "查看从沟通、PI 确认到生产和交付的合作流程。" : "See how enquiry, PI approval, production and delivery connect in one B2B ordering workflow."}</p><a href="/client-stories">{zh ? "查看合作流程 →" : "See the cooperation process →"}</a></aside>
    </div>
  </article>;
}
