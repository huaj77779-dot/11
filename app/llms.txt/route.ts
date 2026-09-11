import { SITE_ORIGIN, SITE_TAGLINE } from "../lib/seo";

export const runtime = "edge";

export function GET() {
  const body = `# verosuits

> ${SITE_TAGLINE}

verosuits is a B2B made-to-measure and private-label menswear manufacturer for tailoring shops and menswear boutiques.

## Core pages

- [Private-label suits](${SITE_ORIGIN}/private-label-suits): white-label made-to-measure suit manufacturing.
- [Made-to-measure suits](${SITE_ORIGIN}/made-to-measure-suits): garment categories, fabrics and ordering workflow.
- [Custom tailoring supplier](${SITE_ORIGIN}/custom-tailoring-supplier): B2B supplier overview.
- [Quality](${SITE_ORIGIN}/quality): workmanship and quality controls.
- [Company](${SITE_ORIGIN}/company): company information.
- [News](${SITE_ORIGIN}/news): tailoring, fabric and manufacturing articles.

## Contact

Use the contact options published on ${SITE_ORIGIN}/. Do not infer pricing, lead times, order quantities, or availability when they are not stated on the relevant page.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
