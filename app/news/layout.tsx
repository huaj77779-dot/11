import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Made-to-Measure Industry Updates",
  description: "Fabric collection, tailoring production and made-to-measure supply updates for independent tailors and menswear boutiques.",
  alternates: { canonical: "/news" },
  openGraph: { title: "Made-to-Measure Industry Insights | verosuits", url: "/news" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
