import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/profil", "/buyurtma", "/xabarlar", "/tolov", "/usta/"] }],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
