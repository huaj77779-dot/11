import type { Metadata } from "next";
import { SITE_NAME, SITE_ORIGIN, SITE_TAGLINE } from "./lib/seo";
import "./globals.css";
import "./options.css";
import "./fabric.css";
import "./flow.css";
import "./fabric-confirm.css";
import "./integrated.css";
import "./inline-details.css";
import "./client-form.css";
import "./merged-form.css";
import "./shipping-pi.css";
import "./pi-overrides.css";
import "./white-label.css";
import "./fabric-only.css";
import "./management.css";
import "./landing.css";
import "./seo-pages.css";
import "./content-pages.css";
import "./news-media.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Private Label Made-to-Measure Suit Manufacturer | verosuits",
    template: "%s | verosuits",
  },
  description:
    "Private label made-to-measure suits, trousers, waistcoats and shirts for tailoring shops and menswear boutiques, with Italian fabrics and digital ordering.",
  applicationName: SITE_NAME,
  keywords: [
    "private label suit manufacturer",
    "made to measure suit supplier",
    "custom suit manufacturer",
    "white label tailoring",
    "B2B made to measure suits",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: "Private Label Made-to-Measure Suit Manufacturer | verosuits",
    description: SITE_TAGLINE,
    images: [
      {
        url: "/ai-previews/jacket.png",
        width: 1024,
        height: 1536,
        alt: "verosuits private-label made-to-measure navy suit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Label Made-to-Measure Suit Manufacturer | verosuits",
    description: SITE_TAGLINE,
    images: ["/ai-previews/jacket.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/verosuits-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: "/verosuits-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/verosuits-logo.png`,
  description: SITE_TAGLINE,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "verosuits@gmail.com",
      telephone: "+1-816-925-5770",
      availableLanguage: ["en", "zh"],
    },
  ],
  knowsAbout: [
    "Made-to-measure tailoring",
    "Private label suits",
    "Custom menswear manufacturing",
    "Italian suit fabrics",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  description: SITE_TAGLINE,
  inLanguage: ["en", "zh-CN", "de", "fr", "it", "es", "pt", "nl", "pl", "sv", "da", "no", "cs", "ja"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
