"use client";

import { useState } from "react";
import { LanguageSwitcher } from "./_components/LanguageSwitcher";
import { useLocale } from "./lib/i18n";
import { useAuthGuard } from "./lib/useAuthGuard";
import { clearAuth } from "./lib/api";

const NEWS = [
  { dateKey: "landing.news1Date", tagKey: "landing.news1Tag", titleKey: "landing.news1Title", excerptKey: "landing.news1Excerpt", tone: "navy" },
  { dateKey: "landing.news2Date", tagKey: "landing.news2Tag", titleKey: "landing.news2Title", excerptKey: "landing.news2Excerpt", tone: "gold" },
  { dateKey: "landing.news3Date", tagKey: "landing.news3Tag", titleKey: "landing.news3Title", excerptKey: "landing.news3Excerpt", tone: "green" },
  { dateKey: "landing.news4Date", tagKey: "landing.news4Tag", titleKey: "landing.news4Title", excerptKey: "landing.news4Excerpt", tone: "charcoal" },
];

const SOCIAL_LINKS = [
  { name: "WhatsApp", href: "https://wa.me/8613800000000", icon: "☎" },
  { name: "Facebook", href: "https://www.facebook.com/", icon: "f" },
  { name: "Instagram", href: "https://www.instagram.com/", icon: "◎" },
  { name: "TikTok", href: "https://www.tiktok.com/", icon: "♪" },
  { name: "LinkedIn", href: "https://www.linkedin.com/", icon: "in" },
];

export default function LandingPage() {
  const { t, locale } = useLocale();
  const zh = locale === "zh-CN";
  const { user, ready } = useAuthGuard(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  const logout = () => {
    void fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
    }).catch(() => undefined);
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
        <a className="landing-brand" href="#top">
          <i>TS</i>
          <span>
            <b>TAILORSUPPLY OS</b>
            <small>MADE-TO-MEASURE SUPPLY</small>
          </span>
        </a>
        <nav className="landing-nav-links">
          <a href="#top">{t("landing.navHome")}</a>
          <a href="/company">{t("landing.navCompany")}</a>
          <a href="/quality">{t("landing.navQuality")}</a>
          <a href="/news">{t("landing.navNews")}</a>
          <a href="/client-stories">{zh ? "合作流程" : "Client Journey"}</a>
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
                <span>{user.storeName || user.username}</span>
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
              <img src="/brand/tailorsupply-workshop-hero.png" alt="TailorSupply OS made-to-measure workshop" />
              <div className="hero-frame-tag">
                <small>VBC · STYLBIELLA</small>
                <b>意大利面料直采</b>
              </div>
            </div>
          </div>
        </div>
        <div className="landing-stats">
          <span><b>15+</b>{t("landing.statYears")}</span>
          <span><b>30+</b>{t("landing.statMarkets")}</span>
          <span><b>4 周</b>{t("landing.statLead")}</span>
          <span><b>6+</b>{t("landing.statMills")}</span>
        </div>
      </section>

      {/* ===== 公司简介 ===== */}
      <section className="atelier-story">
        <div className="landing-wrap atelier-story-head">
          <div><p className="eyebrow">DESIGNED FOR INDEPENDENT TAILORS</p><h2>{zh ? "不是成衣批发，而是为每一位客户建立一件产品" : "Not wholesale stock. One product built for one customer."}</h2></div>
          <p>{zh ? "TailorSupply OS 把门店的量体、面料和款式选择，转化成工厂可以稳定执行的订单。客户看到的是你的品牌，背后由可追踪的定制生产体系完成。" : "TailorSupply OS turns your store's measurements, fabric and style decisions into a production-ready order. Your customer sees your brand; a traceable made-to-measure workflow operates behind it."}</p>
        </div>
        <div className="landing-wrap factory-collage">
          <figure className="factory-main"><img src="/brand/custom-cutting-process.png" alt="Custom suit paper pattern aligned on wool fabric"/><figcaption><span>01</span><div><b>{zh ? "单件裁剪" : "Single-order cutting"}</b><small>{zh ? "面料编号、量体和纸样逐单对应" : "Fabric code, measurements and pattern matched order by order"}</small></div></figcaption></figure>
          <figure className="factory-side"><img src="/brand/jacket-quality-control.png" alt="Tailor inspecting a custom brown jacket"/><figcaption><span>02</span><div><b>{zh ? "成衣质检" : "Garment quality control"}</b><small>{zh ? "核对驳头、对称、工艺和外观" : "Lapel roll, symmetry, craft and finish inspected"}</small></div></figcaption></figure>
          <aside className="factory-quote"><p>“</p><h3>{zh ? "数字系统负责准确，工匠负责质感。" : "The system protects accuracy. Craft gives it character."}</h3><a href="/client-stories">{zh ? "查看完整合作流程 →" : "See the complete client journey →"}</a></aside>
        </div>
      </section>

      <section className="custom-advantages"><div className="landing-wrap">
        <div className="landing-section-head"><p className="eyebrow">OUR CUSTOMISATION ADVANTAGE</p><h2>{zh ? "让门店能卖得更专业，也能下单得更简单" : "More freedom for your client. Less friction for your store."}</h2></div>
        <div className="advantage-grid">
          <article><span>01</span><h3>{zh ? "一件起订" : "One-piece MOQ"}</h3><p>{zh ? "西装上衣、西裤、马甲和衬衫均可按客户单独下单，降低库存压力。" : "Order jackets, trousers, waistcoats and shirts for individual clients without stocking finished garments."}</p></article>
          <article><span>02</span><h3>{zh ? "四维定制" : "Four layers of customisation"}</h3><p>{zh ? "面料、量体、体态和款式工艺形成完整订单，不靠聊天记录猜测。" : "Fabric, measurements, posture and style details become one complete, reviewable order."}</p></article>
          <article><span>03</span><h3>{zh ? "门店白牌" : "Store-first white label"}</h3><p>{zh ? "客户界面与交付过程突出门店品牌，工厂信息不干扰客户关系。" : "Your store remains customer-facing while production operates quietly behind your brand."}</p></article>
          <article><span>04</span><h3>{zh ? "档案复购" : "Reorder-ready records"}</h3><p>{zh ? "保存每次量体、体态、款式和修改时间，为复购建立可靠依据。" : "Dated measurement, posture and style records create a dependable base for repeat orders."}</p></article>
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
              <span><i>✉</i><div><small>{t("landing.contactEmailLabel")}</small><b>sales@tailorsupplyos.com</b></div></span>
              <span><i>✆</i><div><small>{t("landing.contactWaLabel")}</small><b>+86 138 0000 0000</b></div></span>
              <span><i>◈</i><div><small>{t("landing.contactAddrLabel")}</small><b>{t("landing.contactAddr")}</b></div></span>
              <span><i>◷</i><div><small>{t("landing.contactHoursLabel")}</small><b>{t("landing.contactHours")}</b></div></span>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <h3>{t("landing.contactFormTitle")}</h3>
              {sent ? (
                <div className="contact-done">
                  <b>{t("landing.contactDone")}</b>
                  <pre>{summary || "—"}</pre>
                  <a className="landing-cta sm" href={`mailto:sales@tailorsupplyos.com?subject=${encodeURIComponent("合作需求 · " + (form.name || "新客户"))}&body=${encodeURIComponent(summary || "")}`}>
                    ✉ 通过邮箱发送
                  </a>
                </div>
              ) : (
                <>
                  <label><span>{t("landing.contactName")} <i>*</i></span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label><span>{t("landing.contactEmail")} <i>*</i></span><input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
                  <label><span>{t("landing.contactMsg")}</span><textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
                  {submitError && <p className="contact-error" role="alert">{submitError}</p>}
                  <button className="landing-cta" type="submit" disabled={sending}>{sending ? "正在发送…" : t("landing.contactSubmit")}</button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <aside className="landing-socials" aria-label="社交媒体">
        {SOCIAL_LINKS.map((item) => (
          <a key={item.name} className={`social-icon social-${item.name.toLowerCase()}`} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name} title={item.name}>
            <span aria-hidden="true">{item.icon}</span>
          </a>
        ))}
      </aside>

      {/* ===== 页脚 ===== */}
      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <a className="landing-brand" href="#top">
            <i>TS</i>
            <span><b>TAILORSUPPLY OS</b><small>MADE-TO-MEASURE SUPPLY</small></span>
          </a>
          <nav>
            <a href="/private-label-suits">Private Label Suits</a>
            <a href="/made-to-measure-suits">Made-to-Measure</a>
            <a href="/custom-tailoring-supplier">For Tailoring Shops</a>
            <a href="/company">{t("landing.navCompany")}</a>
            <a href="/quality">{t("landing.navQuality")}</a>
            <a href="/news">{t("landing.navNews")}</a>
            <a href="/client-stories">{zh ? "合作流程" : "Client Journey"}</a>
            <a href="#contact">{t("landing.navContact")}</a>
            <a href="/customize">{t("landing.navCustomize")}</a>
          </nav>
          <p>{t("landing.footRights")}</p>
        </div>
      </footer>
    </main>
  );
}
