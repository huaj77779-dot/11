import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/company", "/quality", "/news", "/private-label-suits", "/made-to-measure-suits", "/custom-tailoring-supplier"],
      disallow: ["/3001", "/admin", "/api", "/customers", "/customize", "/login", "/orders", "/register", "/verify-email"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
