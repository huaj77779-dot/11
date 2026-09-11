"use client";

import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "./BrandLogo";
import { useLocale } from "../lib/i18n";
import { CustomizeLoginLink } from "./CustomizeLoginLink";

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
          <CustomizeLoginLink>{t("landing.navCustomize")}</CustomizeLoginLink>
        </nav>
        <div className="landing-nav-actions"><LanguageSwitcher /></div>
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
