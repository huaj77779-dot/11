import type { Metadata } from "next";
import { SeoServicePage } from "../_components/SeoServicePage";

export const metadata: Metadata = {
  title: "Made-to-Measure Suit Manufacturer & Supplier",
  description: "B2B made-to-measure suit supply for boutiques and tailors, combining measurement profiles, Italian fabrics, style configuration and repeat ordering.",
  alternates: { canonical: "/made-to-measure-suits" },
  openGraph: {
    title: "Made-to-Measure Suit Manufacturer & Supplier | TailorSupply OS",
    description: "A structured B2B workflow from client measurements and fabric selection to production-ready suit orders.",
    url: "/made-to-measure-suits",
  },
};

export default function MadeToMeasureSuitsPage() {
  return <SeoServicePage
    eyebrow="B2B MADE-TO-MEASURE SUITS"
    title="A clearer way to order made-to-measure clothing for your clients."
    intro="Bring fabric selection, body measurements, finished measurements and garment styling into one professional workflow built for tailoring appointments and repeat business."
    summary="Made-to-measure ordering has many small decisions. TailorSupply OS organises them into a customer profile, fabric record, garment specification and PI summary, helping the shop verify what was selected before the order is confirmed."
    audience={["Tailors serving private clients", "Premium menswear stores", "Wedding and occasionwear shops", "Image consultants", "Corporate wardrobe providers", "Appointment-based online tailors"]}
    capabilities={[
      { title: "Body and garment measurements", text: "Record both net body measurements and finished-garment measurements, using metric or imperial units." },
      { title: "Posture observations", text: "Keep common posture adjustments such as stooped back, prominent abdomen and shoulder balance with the customer record." },
      { title: "Detailed style choices", text: "Capture jacket, trouser, waistcoat and shirt options in visual selection cards rather than relying on free-form notes." },
      { title: "Fabric code accuracy", text: "Display fabric images, collection references and complete fabric codes to reduce selection mistakes during ordering." },
      { title: "Repeat-order visibility", text: "Review saved client information and earlier specifications before changing measurements or creating another garment." },
      { title: "Order summary", text: "Consolidate fabric, style, craft, pricing and shipping data into a PI record for final verification." },
    ]}
    process={[
      { title: "Measure", text: "Create or retrieve a customer profile and confirm the current measurement date." },
      { title: "Select", text: "Choose the exact fabric and review its colour, weight, composition and price reference." },
      { title: "Configure", text: "Complete the required garment choices and add only the optional details the client requests." },
      { title: "Review", text: "Check the PI line, customer shipping information and total before confirming production." },
    ]}
    faqs={[
      { question: "Can the system store both metric and imperial measurements?", answer: "Yes. The measurement interface supports metric and imperial entry while keeping the client and garment sections aligned." },
      { question: "Can a client order a matching waistcoat after choosing a jacket?", answer: "Yes. The workflow is designed so the shop can return to the previous fabric selection and add another garment using the same fabric." },
      { question: "Are the style choices saved with the PI?", answer: "Selected styling and craft options are carried into the order summary so the shop can verify the specification before confirmation." },
      { question: "Can saved measurements be edited?", answer: "Yes. Customer profiles keep the measurement record available for later review and adjustment, including the time it was saved." },
    ]}
  />;
}
