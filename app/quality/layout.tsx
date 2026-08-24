import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Made-to-Measure Production Quality",
  description: "Review Atelier OS made-to-measure quality control, measurement workflow and production checks for professional tailoring businesses.",
  alternates: { canonical: "/quality" },
  openGraph: { title: "Made-to-Measure Production Quality | Atelier OS", url: "/quality" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
