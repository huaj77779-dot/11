"use client";

import { useEffect, useState } from "react";
import { LOCALES, getLocale, setLocale, subscribeLocale, type Locale } from "../lib/i18n";

const SHORT_LABELS: Record<Locale, string> = {
  zh: "中文",
  en: "EN",
  de: "DE",
  ja: "日本語",
  fr: "FR",
  it: "IT",
  es: "ES",
  pt: "PT",
  nl: "NL",
  pl: "PL",
  sv: "SV",
  da: "DA",
  no: "NO",
  cs: "CS",
};

export function LanguageSwitcher() {
  const [loc, setLoc] = useState<Locale>("zh");
  useEffect(() => {
    const cookieLocale = document.cookie.match(/(?:^|; )atelier_locale=([^;]+)/)?.[1] as Locale | undefined;
    const saved = (window.localStorage.getItem("locale") as Locale | null) ?? cookieLocale ?? null;
    if (saved && LOCALES.some((item) => item.code === saved)) {
      setLocale(saved);
      setLoc(saved);
    }
    return subscribeLocale(() => setLoc(getLocale()));
  }, []);
  return <label className="lang-switcher-compact" title="更换语言">
    <select className="lang-select" value={loc} onChange={(e) => {
      const next = e.target.value as Locale;
      window.localStorage.setItem("locale", next);
      document.cookie = `atelier_locale=${next}; path=/; max-age=31536000; samesite=lax`;
      setLocale(next);
    }} aria-label="更换语言">
      {LOCALES.map((item) => <option key={item.code} value={item.code}>{SHORT_LABELS[item.code]}</option>)}
    </select>
  </label>;
}
