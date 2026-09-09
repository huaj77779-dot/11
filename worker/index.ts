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

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://flagcdn.com https://*.flagcdn.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
  "report-uri /api/security/csp-report",
].join("; ");

const SENSITIVE_PATHS = [
  "/admin", "/customers", "/customize", "/orders", "/login", "/register", "/verify-email",
  "/api/auth/", "/api/admin/", "/api/customers", "/api/orders", "/api/generate-image",
];

function isSameOrigin(request: Request, url: URL): boolean {
  return request.headers.get("Origin") === url.origin;
}

function secureResponse(response: Response, pathname: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000");
  if (SENSITIVE_PATHS.some((prefix) => pathname.startsWith(prefix))) {
    headers.set("Cache-Control", "private, no-store");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
      && url.pathname.startsWith("/api/")
      && url.pathname !== "/api/security/csp-report"
      && !isSameOrigin(request, url)) {
      return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    if (url.pathname === "/api/generate-image" && Number(request.headers.get("Content-Length") ?? "0") > 6_000_000) {
      return new Response("Request too large", { status: 413, headers: { "Cache-Control": "no-store" } });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secureResponse(response, url.pathname);
    }

    return secureResponse(await handler.fetch(request, env, ctx), url.pathname);
  },
};

export default worker;
