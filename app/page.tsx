"use client";

import { useState } from "react";
import { LanguageSwitcher } from "./_components/LanguageSwitcher";
import { BrandLogo } from "./_components/BrandLogo";
import { localizeStoreName, useLocale } from "./lib/i18n";
import { useAuthGuard } from "./lib/useAuthGuard";
import { clearAuth } from "./lib/api";

const NEWS = [
  { dateKey: "landing.news1Date", tagKey: "landing.news1Tag", titleKey: "landing.news1Title", excerptKey: "landing.news1Excerpt", tone: "navy" },
  { dateKey: "landing.news2Date", tagKey: "landing.news2Tag", titleKey: "landing.news2Title", excerptKey: "landing.news2Excerpt", tone: "gold" },
  { dateKey: "landing.news3Date", tagKey: "landing.news3Tag", titleKey: "landing.news3Title", excerptKey: "landing.news3Excerpt", tone: "green" },
  { dateKey: "landing.news4Date", tagKey: "landing.news4Tag", titleKey: "landing.news4Title", excerptKey: "landing.news4Excerpt", tone: "charcoal" },
];

const SOCIAL_LINKS = [
  { name: "WhatsApp", href: "https://wa.me/18169255770", icon: "☎" },
  { name: "Facebook", href: "https://www.facebook.com/", icon: "f" },
  { name: "Instagram", href: "https://www.instagram.com/", icon: "◎" },
  { name: "TikTok", href: "https://www.tiktok.com/", icon: "♪" },
  { name: "LinkedIn", href: "https://www.linkedin.com/", icon: "in" },
];

export default function LandingPage() {
  const { t, loc } = useLocale();
  const zh = loc === "zh";
  const { user, ready } = useAuthGuard(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    clearAuth();
    window.location.href = "/";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试");
      setSent(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  const summary = `${form.name} / ${form.contact}\n${form.message}`;

  return (
    <main className="landing">
      {/* ===== 顶部导航 ===== */}
      <header className="landing-nav">
        <a className="landing-brand" href="#top"><BrandLogo /></a>
        <nav className="landing-nav-links">
          <a href="#top">{t("landing.navHome")}</a>
          <a href="/company">{t("landing.navCompany")}</a>
          <a href="/quality">{t("landing.navQuality")}</a>
          <a href="/news">{t("landing.navNews")}</a>
          <a href="/client-stories">{t("landing.navJourney")}</a>
          <a href="#contact">{t("landing.navContact")}</a>
          <a href="/customize">{t("landing.navCustomize")}</a>
        </nav>
        <div className="landing-nav-actions">
          <LanguageSwitcher />
          {ready && user ? (
            <>
              <a className="landing-link" href="/orders">{t("landing.navOrders")}</a>
              <a className="landing-link" href="/customers">{t("landing.navCustomers")}</a>
              {user.role === "master" && <a className="landing-link" href="/admin">{t("landing.navAdmin")}</a>}
              <button className="landing-account" onClick={logout} title={t("landing.navLogout")}>
                <span>{localizeStoreName(user.storeName || user.username, loc)}</span>
                <i aria-hidden="true">⇥</i>
              </button>
            </>
          ) : (
            <a className="landing-link" href="/login">{t("landing.navLogin")}</a>
          )}
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="top" className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="eyebrow">{t("landing.heroEyebrow")}</p>
            <h1>
              {t("landing.heroTitleA")}
              <br />
              <em>{t("landing.heroTitleB")}</em>
            </h1>
            <p className="landing-hero-sub">{t("landing.heroSub")}</p>
            <div className="landing-hero-ctas">
              <a className="landing-cta" href="/customize">
                <b>{t("landing.heroCta")}</b>
                <small>{t("landing.heroCtaSub")}</small>
              </a>
              <a className="landing-cta ghost" href="#contact">
                {t("landing.heroCta2")}
              </a>
            </div>
            <div className="landing-hero-badges">
              <span>✂　{t("landing.heroBadge1")}</span>
              <span>◈　{t("landing.heroBadge2")}</span>
              <span>✈　{t("landing.heroBadge3")}</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="hero-frame">
              <img src="/brand/tailorsupply-workshop-hero.webp" alt="Faceless master tailor marking a bespoke pattern on navy wool" />
            </div>
          </div>
        </div>
        <div className="landing-stats">
          <span><b>15+</b>{t("landing.statYears")}</span>
          <span><b>30+</b>{t("landing.statMarkets")}</span>
          <span><b>{t("landing.statLeadValue")}</b>{t("landing.statLead")}</span>
          <span><b>6+</b>{t("landing.statMills")}</span>
        </div>
      </section>

      {/* ===== 公司简介 ===== */}
      <section className="atelier-story">
        <div className="landing-wrap atelier-story-head">
          <div><p className="eyebrow">DESIGNED FOR INDEPENDENT TAILORS</p><h2>{t("landing.storyTitle")}</h2></div>
          <p>{t("landing.storyLead")}</p>
        </div>
        <div className="landing-wrap factory-collage">
          <figure className="factory-main"><img src="/brand/custom-cutting-process.png" alt="Custom suit paper pattern aligned on wool fabric" loading="lazy" decoding="async"/><figcaption><span>01</span><div><b>{t("landing.cuttingTitle")}</b><small>{t("landing.cuttingText")}</small></div></figcaption></figure>
          <figure className="factory-side"><img src="/brand/jacket-quality-control.webp" alt="Faceless artisan inspecting the lapel and handwork of a brown jacket" loading="lazy" decoding="async"/><figcaption><span>02</span><div><b>{t("landing.qcTitle")}</b><small>{t("landing.qcText")}</small></div></figcaption></figure>
          <aside className="factory-quote"><p>“</p><h3>{t("landing.storyQuote")}</h3><a href="/client-stories">{t("landing.storyLink")}</a></aside>
        </div>
      </section>

      <section className="custom-advantages"><div className="landing-wrap">
        <div className="landing-section-head"><p className="eyebrow">OUR CUSTOMISATION ADVANTAGE</p><h2>{t("landing.advantageTitle")}</h2></div>
        <div className="advantage-grid">
          <article><img src="/brand/advantage-one-piece-v2.png" alt="Tailor marking a single made-to-measure jacket pattern on navy wool" loading="lazy"/><div className="advantage-copy"><span>01</span><h3>{t("landing.advantage1")}</h3><p>{t("landing.advantage1Text")}</p></div></article>
          <article><img src="/brand/advantage-four-layers.png" alt="Made-to-measure garments and tailoring forms in the atelier" loading="lazy"/><div className="advantage-copy"><span>02</span><h3>{t("landing.advantage2")}</h3><p>{t("landing.advantage2Text")}</p></div></article>
          <article><img src="/brand/advantage-white-label.png" alt="Private-label suit prepared for delivery" loading="lazy"/><div className="advantage-copy"><span>03</span><h3>{t("landing.advantage3")}</h3><p>{t("landing.advantage3Text")}</p></div></article>
          <article><img src="/brand/advantage-reorder.png" alt="Tailoring records and fabric swatches for repeat orders" loading="lazy"/><div className="advantage-copy"><span>04</span><h3>{t("landing.advantage4")}</h3><p>{t("landing.advantage4Text")}</p></div></article>
        </div>
      </div></section>

      {false && <section id="company" className="landing-section">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <p className="eyebrow">{t("landing.secCompanyEyebrow")}</p>
            <h2>{t("landing.secCompanyTitle")}</h2>
          </div>
          <div className="landing-company">
            <div className="landing-company-copy">
              <p className="landing-lead">{t("landing.secCompanyLead")}</p>
              <ul className="landing-points">
                <li><i>01</i>{t("landing.companyPoint1")}</li>
                <li><i>02</i>{t("landing.companyPoint2")}</li>
                <li><i>03</i>{t("landing.companyPoint3")}</li>
                <li><i>04</i>{t("landing.companyPoint4")}</li>
              </ul>
              <a className="landing-cta sm" href="/customize">{t("landing.heroCta")} →</a>
            </div>
            <div className="landing-company-visual">
              <div className="mill-card">
                <span className="swatch navy" />
                <div><b>Vitale Barberis Canonico</b><small>VBC-110-NV · 深海军蓝精纺</small></div>
              </div>
              <div className="mill-card">
                <span className="swatch white" />
                <div><b>Albini</b><small>SH-100-WH · 经典白色府绸</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* ===== 工厂与品质 ===== */}
      {false && <section id="quality" className="landing-section landing-dark">
        <div className="landing-wrap">
          <div className="landing-section-head light">
            <p className="eyebrow">{t("landing.secQualityEyebrow")}</p>
            <h2>{t("landing.secQualityTitle")}</h2>
          </div>
          <div className="landing-quality-grid">
            <article className="quality-card">
              <i>01</i>
              <h3>{t("landing.quality1")}</h3>
              <p>{t("landing.quality1Sub")}</p>
            </article>
            <article className="quality-card">
              <i>02</i>
              <h3>{t("landing.quality2")}</h3>
              <p>{t("landing.quality2Sub")}</p>
            </article>
            <article className="quality-card">
              <i>03</i>
              <h3>{t("landing.quality3")}</h3>
              <p>{t("landing.quality3Sub")}</p>
            </article>
            <article className="quality-card">
              <i>04</i>
              <h3>{t("landing.quality4")}</h3>
              <p>{t("landing.quality4Sub")}</p>
            </article>
          </div>
          <div className="landing-certs">
            <span><b>ISO 9001</b><small>{t("landing.cert1Sub")}</small></span>
            <span><b>SGS</b><small>{t("landing.cert2Sub")}</small></span>
            <span><b>◈</b><small>{t("landing.cert3Sub")}</small></span>
            <span><b>QC</b><small>{t("landing.cert4Sub")}</small></span>
          </div>
        </div>
      </section>}

      {/* ===== 公司动态 ===== */}
      {false && <section id="news" className="landing-section">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <p className="eyebrow">{t("landing.secNewsEyebrow")}</p>
            <h2>{t("landing.secNewsTitle")}</h2>
          </div>
          <div className="landing-news-grid">
            {NEWS.map((item) => (
              <article className="news-card" key={item.titleKey}>
                <div className={`news-thumb ${item.tone}`}>
                  <span className={`mini-swatch ${item.tone}`} />
                </div>
                <div className="news-meta">
                  <time>{t(item.dateKey)}</time>
                  <em>{t(item.tagKey)}</em>
                </div>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.excerptKey)}</p>
                <a href="#news">{t("landing.readMore")}</a>
              </article>
            ))}
          </div>
        </div>
      </section>}

      {/* ===== 联系合作 ===== */}
      <section id="contact" className="landing-section landing-contact">
        <div className="landing-wrap">
          <div className="landing-section-head">
            <p className="eyebrow">{t("landing.secContactEyebrow")}</p>
            <h2>{t("landing.secContactTitle")}</h2>
          </div>
          <div className="landing-contact-grid">
            <div className="contact-info">
              <span><i>✉</i><div><small>{t("landing.contactEmailLabel")}</small><b>verosuits@gmail.com</b></div></span>
              <span><i>✆</i><div><small>{t("landing.contactWaLabel")}</small><b>+1 816 925 5770</b></div></span>
              <span><i>◈</i><div><small>{t("landing.contactAddrLabel")}</small><b>{t("landing.contactAddr")}</b></div></span>
              <span><i>◷</i><div><small>{t("landing.contactHoursLabel")}</small><b>{t("landing.contactHours")}</b></div></span>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <h3>{t("landing.contactFormTitle")}</h3>
              {sent ? (
                <div className="contact-done">
                  <b>{t("landing.contactDone")}</b>
                  <pre>{summary || "—"}</pre>
                  <a className="landing-cta sm" href={`mailto:verosuits@gmail.com?subject=${encodeURIComponent("合作需求 · " + (form.name || "新客户"))}&body=${encodeURIComponent(summary || "")}`}>
                    ✉ 通过邮箱发送
                  </a>
                </div>
              ) : (
                <>
                  <label><span>{t("landing.contactName")} <i>*</i></span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label><span>{t("landing.contactEmail")} <i>*</i></span><input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
                  <label><span>{t("landing.contactMsg")}</span><textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
                  {submitError && <p className="contact-error" role="alert">{submitError}</p>}
                  <button className="landing-cta" type="submit" disabled={sending}>{sending ? t("landing.contactSending") : t("landing.contactSubmit")}</button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <aside className="landing-socials" aria-label="社交媒体">
        {SOCIAL_LINKS.map((item) => (
          <a key={item.name} className={`social-icon social-${item.name.toLowerCase()}`} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name} title={item.name}>
            {item.name === "LinkedIn" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45Z" />
              </svg>
            ) : (
              <img src={`https://cdn.simpleicons.org/${item.name.toLowerCase()}/fff`} alt="" aria-hidden="true" />
            )}
          </a>
        ))}
      </aside>

      {/* ===== 页脚 ===== */}
      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <a className="landing-brand" href="#top"><BrandLogo /></a>
            <a href="/client-stories">{t("landing.navJourney")}</a>
          <p>{t("landing.footRights")}</p>
        </div>
      </footer>
    </main>
  );
}
