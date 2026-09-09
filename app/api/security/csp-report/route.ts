type CspReport = {
  "csp-report"?: {
    "blocked-uri"?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "document-uri"?: string;
  };
};

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 512);
  } catch {
    return value.slice(0, 512);
  }
}

/**
 * CSP is initially deployed in report-only mode. Emit a small, redacted event
 * to Workers Observability rather than retaining visitors' full URLs in D1.
 */
export async function POST(request: Request) {
  try {
    const report = await request.json() as CspReport;
    const entry = report["csp-report"];
    if (entry) {
      console.warn("csp-report", JSON.stringify({
        blockedUri: safeUrl(entry["blocked-uri"]),
        documentUri: safeUrl(entry["document-uri"]),
        effectiveDirective: String(entry["effective-directive"] ?? entry["violated-directive"] ?? "").slice(0, 160),
      }));
    }
  } catch {
    // Browsers must not receive error detail for malformed reports.
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
