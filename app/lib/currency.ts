"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Locale, useLocale } from "./i18n";

export type DisplayCurrency = "CNY" | "GBP" | "EUR" | "JPY" | "PLN" | "SEK" | "DKK" | "NOK" | "CZK";

const CURRENCY_BY_LOCALE: Record<Locale, DisplayCurrency> = {
  zh: "CNY",
  en: "GBP",
  de: "EUR",
  ja: "JPY",
  fr: "EUR",
  it: "EUR",
  es: "EUR",
  pt: "EUR",
  nl: "EUR",
  pl: "PLN",
  sv: "SEK",
  da: "DKK",
  no: "NOK",
  cs: "CZK",
};

const FALLBACK_RATES: Record<DisplayCurrency, number> = {
  CNY: 1,
  GBP: 0.105,
  EUR: 0.119,
  JPY: 20.5,
  PLN: 0.51,
  SEK: 1.30,
  DKK: 0.89,
  NOK: 1.39,
  CZK: 2.91,
};

type FxPayload = {
  rates: Partial<Record<DisplayCurrency, number>>;
  updatedAt?: string;
  source?: string;
};

let cachedPayload: FxPayload | null = null;
let pendingRequest: Promise<FxPayload | null> | null = null;

async function loadRates(): Promise<FxPayload | null> {
  if (cachedPayload) return cachedPayload;
  if (pendingRequest) return pendingRequest;
  pendingRequest = fetch("/api/exchange-rates")
    .then(async (response) => {
      if (!response.ok) throw new Error(`FX response ${response.status}`);
      const payload = (await response.json()) as FxPayload;
      cachedPayload = payload;
      try {
        window.localStorage.setItem("tailorsupply-fx", JSON.stringify(payload));
      } catch {}
      return payload;
    })
    .catch(() => null)
    .finally(() => {
      pendingRequest = null;
    });
  return pendingRequest;
}

export function useCurrency() {
  const { loc } = useLocale();
  const currency = CURRENCY_BY_LOCALE[loc];
  const [payload, setPayload] = useState<FxPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(window.localStorage.getItem("tailorsupply-fx") ?? "null") as FxPayload | null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    void loadRates().then((next) => next && setPayload(next));
  }, []);

  const rate = payload?.rates?.[currency] ?? FALLBACK_RATES[currency];
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(loc === "zh" ? "zh-CN" : loc, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
        minimumFractionDigits: currency === "JPY" || currency === "CNY" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" || currency === "CNY" ? 0 : 2,
      }),
    [currency, loc],
  );
  const money = useCallback(
    (cnyValue: number) => formatter.format((Number(cnyValue) || 0) * rate),
    [formatter, rate],
  );

  return {
    currency,
    rate,
    money,
    updatedAt: payload?.updatedAt ?? null,
    source: payload?.source ?? "ExchangeRate-API",
  };
}
