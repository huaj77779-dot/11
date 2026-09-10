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
  const image = article.images?.[0];
  const keywords = [article.primaryKeyword, ...(article.keywords ?? []), "verosuits"].filter((value, index, values) => values.indexOf(value) === index);
  return { title: article.title, description: article.description, keywords, alternates: { canonical: `/news/${article.slug}` }, openGraph: { type: "article", title: article.title, description: article.description, url: `/news/${article.slug}`, publishedTime: article.published, modifiedTime: article.updated, images: image ? [{ url: absoluteUrl(image.src), alt: image.alt }] : [] }, twitter: { card: image ? "summary_large_image" : "summary", title: article.title, description: article.description, images: image ? [absoluteUrl(image.src)] : [] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const keywords = [article.primaryKeyword, ...(article.keywords ?? []), "verosuits", "B2B tailoring", "made-to-measure suits"].filter((value, index, values) => values.indexOf(value) === index);
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.published, dateModified: article.updated, articleSection: article.category, image: article.images?.map(({ src }) => absoluteUrl(src)), author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME }, mainEntityOfPage: absoluteUrl(`/news/${article.slug}`), keywords };
  return <LandingSubpage><ArticleBody article={article} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></LandingSubpage>;
}
