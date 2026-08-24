import type { Metadata } from "next";
import { SeoServicePage } from "../_components/SeoServicePage";

export const metadata: Metadata = {
  title: "Private Label Suit Manufacturer for Tailors",
  description: "Private label made-to-measure suit manufacturing for independent tailors and menswear boutiques, with one-piece ordering and Italian fabric options.",
  alternates: { canonical: "/private-label-suits" },
  openGraph: {
    title: "Private Label Suit Manufacturer for Tailors | Atelier OS",
    description: "A white-label made-to-measure production partner for tailoring shops and menswear boutiques.",
    url: "/private-label-suits",
  },
};

export default function PrivateLabelSuitsPage() {
  return <SeoServicePage
    eyebrow="PRIVATE LABEL SUIT MANUFACTURER"
    title="Made-to-measure suits produced under your store's name."
    intro="Atelier OS supports independent tailors, menswear boutiques and appointment-led retailers with private-label suit production, Italian fabric choices and a digital ordering workflow."
    summary="Your customer sees your shop and your service. Behind the scenes, our ordering portal keeps measurements, fabric references and construction choices together so that repeat orders are easier to reproduce and production instructions are clearer."
    audience={["Independent tailoring shops", "Menswear boutiques", "Wedding specialists", "Travelling tailors", "Corporate uniform providers", "New made-to-measure businesses"]}
    capabilities={[
      { title: "Private-label presentation", text: "Keep the customer-facing experience centred on your store while using a structured production workflow behind the scenes." },
      { title: "One-piece ordering", text: "Start with an individual customer order instead of holding finished-garment inventory or committing to a large production run." },
      { title: "Coordinated garments", text: "Order jackets, trousers, waistcoats and shirts with measurements and style selections recorded by garment." },
      { title: "Italian fabric selection", text: "Present recognised fabric collections, searchable swatches and clear fabric references during the customer appointment." },
      { title: "Customer measurement archive", text: "Save body and finished-garment measurements with timestamps for later review, editing and repeat orders." },
      { title: "PI order preparation", text: "Move selected fabric, styling, measurements and shipping information into a structured pro forma order record." },
    ]}
    process={[
      { title: "Create the client profile", text: "Record the customer's name, measurements and posture information in one reusable profile." },
      { title: "Choose fabric", text: "Search by collection, colour, pattern, weight and composition, then confirm the exact fabric code." },
      { title: "Configure the garment", text: "Select construction, styling and optional details for the jacket, trousers, waistcoat or shirt." },
      { title: "Confirm the PI", text: "Review the complete specification, shipping details and price before sending the order to production." },
    ]}
    faqs={[
      { question: "Can a tailoring shop order a single made-to-measure suit?", answer: "The workflow is designed for individual customer orders, allowing a shop to begin with one garment or one coordinated set rather than a finished-stock programme." },
      { question: "Will factory information be shown to my customer?", answer: "The portal is designed as a white-label workflow. Store branding and customer-facing presentation can remain centred on the tailoring business." },
      { question: "Can measurements be reused for repeat orders?", answer: "Yes. Saved customer profiles keep measurement data and timestamps so the shop can review and adjust them before a later order." },
      { question: "Which garments can be coordinated in one order?", answer: "The current workflow supports made-to-measure jackets, trousers, waistcoats and shirts, with separate specifications for each garment." },
    ]}
  />;
}
