import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Made-to-Measure Cooperation Process & Client Stories",
  description: "See how a TailorSupply OS B2B order moves from enquiry and PI approval through production, quality control, shipping, delivery and reorder.",
  alternates: { canonical: "/client-stories" },
  openGraph: { title: "From Enquiry to Delivery | TailorSupply OS", description: "A transparent made-to-measure cooperation process for tailoring shops and menswear boutiques.", url: "/client-stories" },
};

export default function ClientStoriesLayout({ children }: { children: React.ReactNode }) { return children; }
