const TARGETS = ["GBP", "USD", "EUR", "JPY", "PLN", "SEK", "DKK", "NOK", "CZK"];

export async function GET() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/CNY", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const payload = (await response.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
      time_next_update_utc?: string;
    };
    if (payload.result !== "success" || !payload.rates) {
      throw new Error("FX provider returned an invalid response");
    }
    const rates = Object.fromEntries(
      ["CNY", ...TARGETS].map((code) => [code, payload.rates?.[code] ?? (code === "CNY" ? 1 : undefined)]),
    );
    return Response.json(
      {
        base: "CNY",
        rates,
        updatedAt: payload.time_last_update_utc ?? new Date().toISOString(),
        nextUpdateAt: payload.time_next_update_utc ?? null,
        source: "ExchangeRate-API",
      },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600" } },
    );
  } catch (error) {
    console.error("Exchange rate refresh failed", error);
    return Response.json({ error: "Exchange rates are temporarily unavailable" }, { status: 503 });
  }
}
