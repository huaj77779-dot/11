"use client";

import { useEffect, useState } from "react";
import type { SeoArticle } from "./articles";
import type { Locale } from "./i18n";

type LocalizedArticle = Pick<SeoArticle, "title" | "description" | "category" | "readingTime" | "images" | "sections">;
type TextEntry = { key: string; value: string };

const TARGET_LANGUAGE: Record<Locale, string> = {
  zh: "zh-CN", en: "en", de: "de", ja: "ja", fr: "fr", it: "it", es: "es",
  pt: "pt", nl: "nl", pl: "pl", sv: "sv", da: "da", no: "no", cs: "cs",
};

function sourceEntries(article: SeoArticle): TextEntry[] {
  const entries: TextEntry[] = [
    { key: "title", value: article.title },
    { key: "description", value: article.description },
    { key: "category", value: article.category },
    { key: "readingTime", value: article.readingTime },
  ];
  article.images?.forEach((image, index) => {
    entries.push({ key: `image.${index}.alt`, value: image.alt }, { key: `image.${index}.caption`, value: image.caption });
  });
  article.sections.forEach((section, sectionIndex) => {
    entries.push({ key: `section.${sectionIndex}.heading`, value: section.heading });
    section.paragraphs.forEach((paragraph, paragraphIndex) => entries.push({ key: `section.${sectionIndex}.paragraph.${paragraphIndex}`, value: paragraph }));
    section.bullets?.forEach((bullet, bulletIndex) => entries.push({ key: `section.${sectionIndex}.bullet.${bulletIndex}`, value: bullet }));
  });
  return entries;
}

function splitEntries(entries: TextEntry[], limit = 1200): TextEntry[][] {
  const chunks: TextEntry[][] = [];
  let current: TextEntry[] = [];
  let length = 0;
  entries.forEach((entry) => {
    const nextLength = entry.value.length + entry.key.length + 24;
    if (current.length && length + nextLength > limit) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(entry);
    length += nextLength;
  });
  if (current.length) chunks.push(current);
  return chunks;
}

async function translateChunk(entries: TextEntry[], locale: Locale): Promise<Map<string, string>> {
  const source = entries.map((entry, index) => `[[[${index}]]]\n${entry.value}`).join("\n\n");
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${TARGET_LANGUAGE[locale]}&dt=t&q=${encodeURIComponent(source)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Translation request failed");
  const payload = await response.json() as Array<Array<[string]>>;
  const translated = payload[0]?.map((part) => part[0]).join("") ?? "";
  const result = new Map<string, string>();
  entries.forEach((entry, index) => {
    const marker = `[[[${index}]]]`;
    const start = translated.indexOf(marker);
    if (start < 0) return;
    const nextMarker = index < entries.length - 1 ? `[[[${index + 1}]]]` : undefined;
    const end = nextMarker ? translated.indexOf(nextMarker, start + marker.length) : translated.length;
    const value = translated.slice(start + marker.length, end < 0 ? translated.length : end).trim();
    if (value) result.set(entry.key, value);
  });
  if (result.size !== entries.length) throw new Error("Incomplete translation response");
  return result;
}

async function translateWithRetry(entries: TextEntry[], locale: Locale): Promise<Map<string, string>> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await translateChunk(entries, locale);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    }
  }
  throw lastError;
}

function applyTranslation(article: SeoArticle, translated: Map<string, string>): LocalizedArticle {
  const images = article.images?.map((image, index) => ({
    ...image,
    alt: translated.get(`image.${index}.alt`) ?? image.alt,
    caption: translated.get(`image.${index}.caption`) ?? image.caption,
  }));
  const sections = article.sections.map((section, sectionIndex) => ({
    ...section,
    heading: translated.get(`section.${sectionIndex}.heading`) ?? section.heading,
    paragraphs: section.paragraphs.map((paragraph, paragraphIndex) => translated.get(`section.${sectionIndex}.paragraph.${paragraphIndex}`) ?? paragraph),
    bullets: section.bullets?.map((bullet, bulletIndex) => translated.get(`section.${sectionIndex}.bullet.${bulletIndex}`) ?? bullet),
  }));
  return {
    title: translated.get("title") ?? article.title,
    description: translated.get("description") ?? article.description,
    category: translated.get("category") ?? article.category,
    readingTime: translated.get("readingTime") ?? article.readingTime,
    images,
    sections,
  };
}

export function useLocalizedArticle(article: SeoArticle, locale: Locale): { article: LocalizedArticle | null; loading: boolean } {
  const [localized, setLocalized] = useState<LocalizedArticle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (locale === "en") {
      setLocalized(null);
      setLoading(false);
      return () => { active = false; };
    }
    const cacheKey = `verosuits-article-v2:${locale}:${article.slug}:${article.updated}`;
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setLocalized(JSON.parse(cached) as LocalizedArticle);
        setLoading(false);
        return () => { active = false; };
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }
    setLoading(true);
    const run = async () => {
      try {
        const translated = new Map<string, string>();
        for (const chunk of splitEntries(sourceEntries(article))) {
          const part = await translateWithRetry(chunk, locale);
          part.forEach((value, key) => translated.set(key, value));
        }
        const result = applyTranslation(article, translated);
        window.localStorage.setItem(cacheKey, JSON.stringify(result));
        if (active) setLocalized(result);
      } catch {
        if (active) setLocalized(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => { active = false; };
  }, [article, locale]);

  return { article: localized, loading };
}

export function useLocalizedArticlePreviews(articles: SeoArticle[], locale: Locale): Map<string, Pick<SeoArticle, "title" | "description" | "category" | "readingTime">> {
  const [localized, setLocalized] = useState<Map<string, Pick<SeoArticle, "title" | "description" | "category" | "readingTime">>>(new Map());

  useEffect(() => {
    let active = true;
    if (locale === "en" || locale === "zh") {
      setLocalized(new Map());
      return () => { active = false; };
    }
    const cacheKey = `verosuits-article-previews-v2:${locale}:${articles.map((article) => `${article.slug}:${article.updated}`).join("|")}`;
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setLocalized(new Map(Object.entries(JSON.parse(cached) as Record<string, Pick<SeoArticle, "title" | "description" | "category" | "readingTime">>)));
        return () => { active = false; };
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }
    const entries = articles.flatMap((article) => [
      { key: `${article.slug}.title`, value: article.title },
      { key: `${article.slug}.description`, value: article.description },
      { key: `${article.slug}.category`, value: article.category },
      { key: `${article.slug}.readingTime`, value: article.readingTime },
    ]);
    const run = async () => {
      try {
        const translated = new Map<string, string>();
        for (const chunk of splitEntries(entries)) {
          const part = await translateWithRetry(chunk, locale);
          part.forEach((value, key) => translated.set(key, value));
        }
        const result = new Map<string, Pick<SeoArticle, "title" | "description" | "category" | "readingTime">>();
        articles.forEach((article) => result.set(article.slug, {
          title: translated.get(`${article.slug}.title`) ?? article.title,
          description: translated.get(`${article.slug}.description`) ?? article.description,
          category: translated.get(`${article.slug}.category`) ?? article.category,
          readingTime: translated.get(`${article.slug}.readingTime`) ?? article.readingTime,
        }));
        window.localStorage.setItem(cacheKey, JSON.stringify(Object.fromEntries(result)));
        if (active) setLocalized(result);
      } catch {
        if (active) setLocalized(new Map());
      }
    };
    void run();
    return () => { active = false; };
  }, [articles, locale]);

  return localized;
}
