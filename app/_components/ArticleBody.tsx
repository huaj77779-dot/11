"use client";
import type { SeoArticle } from "../lib/articles";
import { useLocale } from "../lib/i18n";
import { useLocalizedArticle } from "../lib/article-translation";

const ARTICLE_UI = {
  zh: { back: "全部文章", loading: "正在适配文章语言…", ctaTitle: "把这套流程用于你的门店", ctaText: "查看从沟通、PI 确认到生产和交付的合作流程。", ctaLink: "查看合作流程 →", related: "相关服务：" },
  en: { back: "All insights", loading: "Adapting article language…", ctaTitle: "Put this workflow to work in your store", ctaText: "See how enquiry, PI approval, production and delivery connect in one B2B ordering workflow.", ctaLink: "See the cooperation process →", related: "Related service: " },
  de: { back: "Alle Beiträge", loading: "Artikel wird übersetzt…", ctaTitle: "Setzen Sie diesen Ablauf in Ihrem Geschäft ein", ctaText: "Erfahren Sie, wie Anfrage, PI-Freigabe, Produktion und Lieferung zusammenwirken.", ctaLink: "Kooperationsablauf ansehen →", related: "Zugehörige Dienstleistung: " },
  ja: { back: "すべての記事", loading: "記事を翻訳しています…", ctaTitle: "このワークフローを店舗で活用する", ctaText: "問い合わせ、PI確認、生産、納品までの流れをご覧ください。", ctaLink: "協業プロセスを見る →", related: "関連サービス：" },
  fr: { back: "Tous les articles", loading: "Traduction de l’article…", ctaTitle: "Appliquez ce processus dans votre boutique", ctaText: "Découvrez comment la demande, la validation de la PI, la production et la livraison s’enchaînent.", ctaLink: "Voir le processus de collaboration →", related: "Service associé : " },
  it: { back: "Tutti gli articoli", loading: "Traduzione dell’articolo…", ctaTitle: "Applica questo flusso al tuo negozio", ctaText: "Scopri come richiesta, conferma PI, produzione e consegna lavorano insieme.", ctaLink: "Vedi il processo di collaborazione →", related: "Servizio correlato: " },
  es: { back: "Todos los artículos", loading: "Traduciendo el artículo…", ctaTitle: "Aplique este flujo a su tienda", ctaText: "Vea cómo se conectan la consulta, la aprobación de la PI, la producción y la entrega.", ctaLink: "Ver el proceso de colaboración →", related: "Servicio relacionado: " },
  pt: { back: "Todos os artigos", loading: "A traduzir o artigo…", ctaTitle: "Aplique este processo à sua loja", ctaText: "Veja como consulta, aprovação da PI, produção e entrega se ligam.", ctaLink: "Ver o processo de colaboração →", related: "Serviço relacionado: " },
  nl: { back: "Alle artikelen", loading: "Artikel wordt vertaald…", ctaTitle: "Gebruik deze workflow in uw winkel", ctaText: "Bekijk hoe aanvraag, PI-goedkeuring, productie en levering samenkomen.", ctaLink: "Bekijk het samenwerkingsproces →", related: "Gerelateerde service: " },
  pl: { back: "Wszystkie artykuły", loading: "Tłumaczenie artykułu…", ctaTitle: "Wykorzystaj ten proces w swoim salonie", ctaText: "Zobacz, jak zapytanie, akceptacja PI, produkcja i dostawa tworzą jeden proces.", ctaLink: "Zobacz proces współpracy →", related: "Powiązana usługa: " },
  sv: { back: "Alla artiklar", loading: "Översätter artikeln…", ctaTitle: "Använd arbetsflödet i din butik", ctaText: "Se hur förfrågan, PI-godkännande, produktion och leverans hänger ihop.", ctaLink: "Se samarbetsprocessen →", related: "Relaterad tjänst: " },
  da: { back: "Alle artikler", loading: "Oversætter artikel…", ctaTitle: "Brug arbejdsgangen i din butik", ctaText: "Se, hvordan forespørgsel, PI-godkendelse, produktion og levering hænger sammen.", ctaLink: "Se samarbejdsprocessen →", related: "Relateret service: " },
  no: { back: "Alle artikler", loading: "Oversetter artikkelen…", ctaTitle: "Bruk denne arbeidsflyten i butikken", ctaText: "Se hvordan forespørsel, PI-godkjenning, produksjon og levering henger sammen.", ctaLink: "Se samarbeidsprosessen →", related: "Relatert tjeneste: " },
  cs: { back: "Všechny články", loading: "Překládání článku…", ctaTitle: "Využijte tento postup ve své prodejně", ctaText: "Podívejte se, jak na sebe navazují poptávka, schválení PI, výroba a dodání.", ctaLink: "Zobrazit proces spolupráce →", related: "Související služba: " },
};

export function ArticleBody({ article }: { article: SeoArticle }) {
  const { loc } = useLocale();
  const { article: localized, loading } = useLocalizedArticle(article, loc);
  const zh = loc === "zh";
  const ui = ARTICLE_UI[loc];
  const displayArticle = localized ?? article;
  const title = zh && !localized ? article.titleZh : displayArticle.title;
  const description = zh && !localized ? article.descriptionZh : displayArticle.description;
  const published = new Intl.DateTimeFormat(zh ? "zh-CN" : loc, {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${article.published}T00:00:00Z`));
  return <article className="article-page">
    <header className="article-hero"><div className="landing-wrap article-narrow">
      <a className="back-link" href="/news">← {ui.back}</a>
      <p className="eyebrow">{displayArticle.category} · <time dateTime={article.published}>{published}</time></p>
      <h1>{title}</h1>
      <p className="article-deck">{description}</p>
      <div className="article-byline"><span>verosuits Editorial</span><span>{article.readingTime}</span><span>{article.primaryKeyword}</span></div>
    </div></header>
    <div className="landing-wrap article-narrow article-copy">
      {loading && <p className="translation-note" role="status">{ui.loading}</p>}
      {displayArticle.images?.[0] && <figure className="article-lead-image"><img src={displayArticle.images[0].src} alt={displayArticle.images[0].alt} /><figcaption>{displayArticle.images[0].caption}</figcaption></figure>}
      {displayArticle.sections.map((section, index) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}{displayArticle.images?.[index + 1] && <figure className="article-inline-image"><img src={displayArticle.images[index + 1].src} alt={displayArticle.images[index + 1].alt} /><figcaption>{displayArticle.images[index + 1].caption}</figcaption></figure>}</section>)}
      <aside className="article-cta"><p className="eyebrow">VEROSUITS</p><h2>{ui.ctaTitle}</h2><p>{ui.ctaText}</p><a href="/client-stories">{ui.ctaLink}</a></aside>
      {article.relatedService && <p className="article-related-link"><span>{ui.related}</span><a href={article.relatedService.href}>{zh ? article.relatedService.labelZh : article.relatedService.label} →</a></p>}
    </div>
  </article>;
}
