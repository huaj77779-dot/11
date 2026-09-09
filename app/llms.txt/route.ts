import { SITE_ORIGIN, SITE_TAGLINE } from "../lib/seo";

export function GET() {
  const body = `# verosuits

> ${SITE_TAGLINE}

## Core B2B services

- [Private-label suits](${SITE_ORIGIN}/private-label-suits): Made-to-measure private-label manufacturing for tailoring shops and menswear boutiques.
- [Made-to-measure suits](${SITE_ORIGIN}/made-to-measure-suits): Digital ordering and production workflow for made-to-measure suits, trousers, waistcoats and shirts.
- [Tailoring supplier](${SITE_ORIGIN}/custom-tailoring-supplier): A supply-programme overview for independent tailoring businesses.

## Evidence and guidance

- [Company](${SITE_ORIGIN}/company)
- [Quality process](${SITE_ORIGIN}/quality)
- [Buyer guides and garment notes](${SITE_ORIGIN}/news)
- [Client stories](${SITE_ORIGIN}/client-stories)

## Contact

- Email: verosuits@gmail.com
- WhatsApp: +1 816 925 5770
- Website: ${SITE_ORIGIN}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
