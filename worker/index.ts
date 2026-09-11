/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type Locale = "zh" | "en" | "de" | "ja" | "fr" | "it" | "es" | "pt" | "nl" | "pl" | "sv" | "da" | "no" | "cs";

const LOCALE_BY_COUNTRY: Record<string, Locale> = {
  CN: "zh",
  DE: "de", AT: "de", CH: "de", LI: "de",
  JP: "ja",
  FR: "fr", MC: "fr",
  IT: "it", SM: "it", VA: "it",
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", UY: "es", PY: "es", BO: "es", EC: "es", CR: "es", PA: "es", GT: "es", HN: "es", NI: "es", SV: "es", DO: "es", PR: "es",
  PT: "pt", BR: "pt",
  NL: "nl",
  PL: "pl",
  SE: "sv",
  DK: "da",
  NO: "no",
  CZ: "cs",
};

function hasLocaleCookie(request: Request): boolean {
  return /(?:^|;\s*)atelier_locale=/.test(request.headers.get("cookie") ?? "");
}

function localeForRequest(request: Request): Locale {
  return LOCALE_BY_COUNTRY[request.headers.get("cf-ipcountry")?.toUpperCase() ?? ""] ?? "en";
}

function isHtmlNavigation(request: Request, response: Response): boolean {
  return request.method === "GET"
    && (request.headers.get("accept")?.includes("text/html") ?? false)
    && (response.headers.get("content-type")?.includes("text/html") ?? false);
}

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://flagcdn.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
  "report-uri /api/security/csp-report",
].join("; ");

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isProtectedPath(pathname: string): boolean {
  return [
    "/admin", "/customers", "/customize", "/orders", "/login", "/register", "/verify-email",
    "/api/auth/", "/api/admin/", "/api/customers", "/api/orders", "/api/generate-image",
  ].some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Keep the public site on one encrypted, indexable URL. The application is
    // served only on the apex domain; www is a convenience alias.
    if (url.protocol === "http:") {
      url.protocol = "https:";
      url.hostname = "verosuits.com";
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === "www.verosuits.com") {
      url.hostname = "verosuits.com";
      return Response.redirect(url.toString(), 301);
    }

    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    // Cookie-authenticated route handlers need an explicit CSRF control. The
    // CSP reporting endpoint is browser-generated and intentionally exempt.
    if (isMutation && url.pathname.startsWith("/api/") && url.pathname !== "/api/security/csp-report" && !isSameOrigin(request)) {
      return Response.json({ error: "Cross-site requests are not allowed." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    if (url.pathname === "/api/generate-image") {
      const contentLength = Number(request.headers.get("content-length") ?? "0");
      if (Number.isFinite(contentLength) && contentLength > 6 * 1024 * 1024) {
        return Response.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    const headers = new Headers(response.headers);

    // Baseline browser protections. These are deliberately compatible with the
    // existing application and do not attempt to introduce a CSP without first
    // collecting violation reports for the site's third-party assets.
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    headers.set("Strict-Transport-Security", "max-age=31536000");
    headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);

    // These crawler-facing files are public and do not vary by visitor. Giving
    // them an explicit edge TTL prevents repeated Worker renders while keeping
    // ordinary HTML and authenticated routes dynamic.
    if (url.pathname === "/robots.txt" || url.pathname === "/sitemap.xml") {
      headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
    }

    if (isProtectedPath(url.pathname)) {
      headers.set("Cache-Control", "private, no-store");
    }

    // Cloudflare supplies cf-ipcountry at the edge. Only set a default for a
    // visitor who has not chosen a language themselves; LanguageSwitcher then
    // persists any explicit selection in this same cookie.
    if (hasLocaleCookie(request) || !isHtmlNavigation(request, response)) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    headers.append("Set-Cookie", `atelier_locale=${localeForRequest(request)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
    headers.append("Vary", "CF-IPCountry");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};

export default worker;
