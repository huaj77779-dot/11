import type { Metadata } from "next";
import { SeoServicePage } from "../_components/SeoServicePage";

export const metadata: Metadata = {
  title: "Custom Tailoring Supplier for Boutiques",
  description: "A custom tailoring supply and ordering platform for boutiques, independent tailors and made-to-measure stores serving international clients.",
  alternates: { canonical: "/custom-tailoring-supplier" },
  openGraph: {
    title: "Custom Tailoring Supplier for Boutiques | TailorSupply OS",
    description: "Private-label production support and a digital made-to-measure ordering portal for professional tailoring businesses.",
    url: "/custom-tailoring-supplier",
  },
};

export default function CustomTailoringSupplierPage() {
  return <SeoServicePage
    eyebrow="CUSTOM TAILORING SUPPLIER"
    title="A practical ordering system for modern tailoring shops."
    intro="TailorSupply OS connects the in-store fitting appointment with fabric selection, customer records, garment configuration and international order preparation."
    summary="The service is designed for businesses that sell expertise rather than off-the-rack stock. Staff can guide the appointment visually, preserve the customer's measurement history and build multiple garments without losing the selected fabric or previous page position."
    audience={["New tailoring businesses", "Established bespoke shops adding MTM", "Menswear boutiques", "Wedding suit retailers", "Multi-store tailoring groups", "International client advisors"]}
    capabilities={[
      { title: "Guided store appointments", text: "Use visual fabric and style cards to explain choices to a client without relying on factory terminology alone." },
      { title: "Searchable fabric library", text: "Filter available fabrics by brand, colour, pattern, weight and composition within the selected collection." },
      { title: "Editable customer profiles", text: "Store contact, measurement and posture data in a format the shop can review and update over time." },
      { title: "Multi-garment orders", text: "Prepare coordinated jackets, trousers, waistcoats and shirts, while retaining the same customer and fabric context." },
      { title: "International shipping fields", text: "Select country and corresponding state or province data before preparing the final shipping record." },
      { title: "Multilingual interface", text: "Support client-facing and staff-facing workflows across major European languages, Chinese and Japanese." },
    ]}
    process={[
      { title: "Prepare the appointment", text: "Retrieve a returning customer or open a clean profile for a new client." },
      { title: "Guide the selection", text: "Narrow the fabric collection and show the client clear garment option images." },
      { title: "Check completeness", text: "Review required measurements, selected options and any monogram text before saving." },
      { title: "Send for production", text: "Confirm the final PI line and shipping details after the customer approves the specification." },
    ]}
    faqs={[
      { question: "Is this intended for consumers or tailoring businesses?", answer: "The workflow is primarily designed for professional tailoring shops, menswear boutiques and client advisors placing made-to-measure orders." },
      { question: "Can store staff search previous customer records?", answer: "Yes. Existing customer profiles can be searched and reopened so staff can review measurements and saved information." },
      { question: "Can several garments be included in the same PI?", answer: "Yes. Individual garment lines can be added and reviewed together before the shop confirms the overall order." },
      { question: "Does changing a language change the tailoring terminology?", answer: "The interface includes dedicated translations for garment groups, style options, fabric descriptions and operational labels rather than translating only the navigation." },
    ]}
  />;
}
