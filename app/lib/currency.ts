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
  // 初始 state 固定为 null（服务端/客户端首帧一致，均走 FALLBACK_RATES），
  // 避免 hydration mismatch：之前这里在 useState 初始化时读 localStorage，
  // 服务端返回 null、客户端首帧返回缓存汇率 → 首帧价格不同 → React 报错。
  // 缓存读取已移到 useEffect（水合完成后更新，React 标准模式）。
  const [payload, setPayload] = useState<FxPayload | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("tailorsupply-fx") ?? "null",
      ) as FxPayload | null;
      if (saved) setPayload(saved);
    } catch {}
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
