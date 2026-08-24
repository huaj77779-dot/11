import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Private Label Tailoring Company",
  description: "Learn how Atelier OS supports tailoring shops with made-to-measure production, Italian fabrics and a white-label digital ordering workflow.",
  alternates: { canonical: "/company" },
  openGraph: { title: "Private Label Tailoring Company | Atelier OS", url: "/company" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
