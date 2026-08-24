"use client";

import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "../lib/i18n";

export function LandingSubpage({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <main className="landing">
      <header className="landing-nav">
        <a className="landing-brand" href="/"><i>TS</i><span><b>TAILORSUPPLY OS</b><small>MADE-TO-MEASURE SUPPLY</small></span></a>
        <nav className="landing-nav-links">
          <a href="/">{t("landing.navHome")}</a>
          <a href="/company">{t("landing.navCompany")}</a>
          <a href="/quality">{t("landing.navQuality")}</a>
          <a href="/news">{t("landing.navNews")}</a>
          <a href="/client-stories">Client Stories</a>
          <a href="/#contact">{t("landing.navContact")}</a>
          <a href="/customize">{t("landing.navCustomize")}</a>
        </nav>
        <div className="landing-nav-actions"><LanguageSwitcher /><a className="landing-link" href="/login">{t("landing.navLogin")}</a></div>
      </header>
      {children}
      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <a className="landing-brand" href="/"><i>TS</i><span><b>TAILORSUPPLY OS</b><small>MADE-TO-MEASURE SUPPLY</small></span></a>
          <nav><a href="/private-label-suits">Private Label Suits</a><a href="/made-to-measure-suits">Made-to-Measure</a><a href="/custom-tailoring-supplier">For Tailoring Shops</a><a href="/client-stories">Client Stories</a><a href="/company">{t("landing.navCompany")}</a><a href="/quality">{t("landing.navQuality")}</a><a href="/news">{t("landing.navNews")}</a><a href="/#contact">{t("landing.navContact")}</a><a href="/customize">{t("landing.navCustomize")}</a></nav>
          <p>{t("landing.footRights")}</p>
        </div>
      </footer>
    </main>
  );
}
