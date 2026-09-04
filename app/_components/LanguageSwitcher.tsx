"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, getLocale, setLocale, subscribeLocale, type Locale } from "../lib/i18n";

const FLAG_CODES: Record<Locale, string> = {
  zh: "cn", en: "gb", de: "de", ja: "jp", fr: "fr", it: "it", es: "es",
  pt: "pt", nl: "nl", pl: "pl", sv: "se", da: "dk", no: "no", cs: "cz",
};

function Flag({ locale }: { locale: Locale }) {
  return <img className="language-flag" src={`https://flagcdn.com/24x18/${FLAG_CODES[locale]}.png`} width="24" height="18" alt="" aria-hidden="true" />;
}

export function LanguageSwitcher() {
  const [loc, setLoc] = useState<Locale>(DEFAULT_LOCALE);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((item) => item.code === loc) ?? LOCALES[0];

  useEffect(() => {
    const cookieLocale = document.cookie.match(/(?:^|; )atelier_locale=([^;]+)/)?.[1] as Locale | undefined;
    const saved = (window.localStorage.getItem("locale") as Locale | null) ?? cookieLocale ?? null;
    if (saved && LOCALES.some((item) => item.code === saved)) {
      setLocale(saved);
      setLoc(saved);
    }
    return subscribeLocale(() => setLoc(getLocale()));
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="lang-switcher-compact language-menu" ref={rootRef}>
      <button type="button" className="language-trigger" aria-label="Language" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Flag locale={loc} />
        <span>{current.label}</span>
        <span className="language-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="language-options" role="listbox" aria-label="Language">
          {[...LOCALES]
            .sort((a, b) => a.code === DEFAULT_LOCALE ? -1 : b.code === DEFAULT_LOCALE ? 1 : 0)
            .map((item) => (
              <button type="button" role="option" aria-selected={item.code === loc} className={`language-option${item.code === loc ? " is-active" : ""}`} key={item.code} onClick={() => { setLocale(item.code); setOpen(false); }}>
                <Flag locale={item.code} />
                <span>{item.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
