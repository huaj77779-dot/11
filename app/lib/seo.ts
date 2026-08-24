const configuredOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.CF_PAGES_URL ||
  "http://localhost:3000";

export const SITE_ORIGIN = configuredOrigin.replace(/\/$/, "");
export const SITE_NAME = "Atelier OS";
export const SITE_TAGLINE =
  "Private label made-to-measure manufacturing and digital ordering for tailoring shops and menswear boutiques.";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_ORIGIN}/`).toString();
}
