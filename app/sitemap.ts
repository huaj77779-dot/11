import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";
import { SEO_ARTICLES } from "./lib/articles";

const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/private-label-suits", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/made-to-measure-suits", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/custom-tailoring-supplier", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/company", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/quality", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/news", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/client-stories", priority: 0.8, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicRoutes,
    ...SEO_ARTICLES.map((article) => ({
      path: `/news/${article.slug}`,
      priority: 0.65,
      changeFrequency: "monthly" as const,
      lastModified: new Date(`${article.updated}T00:00:00.000Z`),
    })),
  ].map((route) => ({
    url: absoluteUrl(route.path),
    ...(route.lastModified ? { lastModified: route.lastModified } : {}),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
