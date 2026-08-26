import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../_components/ArticleBody";
import { LandingSubpage } from "../../_components/LandingSubpage";
import { getArticle, SEO_ARTICLES } from "../../lib/articles";
import { absoluteUrl, SITE_NAME } from "../../lib/seo";

export function generateStaticParams() { return SEO_ARTICLES.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: `/news/${article.slug}` }, openGraph: { type: "article", title: article.title, description: article.description, url: `/news/${article.slug}`, publishedTime: article.published, modifiedTime: article.updated } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.published, dateModified: article.updated, author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME }, mainEntityOfPage: absoluteUrl(`/news/${article.slug}`), keywords: [article.primaryKeyword, "B2B tailoring", "made-to-measure suits"] };
  return <LandingSubpage><ArticleBody article={article} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></LandingSubpage>;
}
