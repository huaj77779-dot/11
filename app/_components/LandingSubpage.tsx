"use client";

import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { useLocale } from "../lib/i18n";

export function LandingSubpage({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <main className="landing">
      <header className="landing-nav">
        <a className="landing-brand" href="/"><BrandLogo /></a>
        <nav className="landing-nav-links">
          <a href="/">{t("landing.navHome")}</a>
          <a href="/company">{t("landing.navCompany")}</a>
          <a href="/quality">{t("landing.navQuality")}</a>
          <a href="/news">{t("landing.navNews")}</a>
          <a href="/client-stories">{t("landing.navJourney")}</a>
          <a href="/#contact">{t("landing.navContact")}</a>
          <a href="/customize">{t("landing.navCustomize")}</a>
        </nav>
        <div className="landing-nav-actions"><LanguageSwitcher /><a className="landing-link" href="/login">{t("landing.navLogin")}</a><a className="landing-register-link" href="/register">注册账号</a></div>
      </header>
      {children}
      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <a className="landing-brand" href="/"><BrandLogo /></a>
          <p>{t("landing.footRights")}</p>
        </div>
      </footer>
    </main>
  );
}
