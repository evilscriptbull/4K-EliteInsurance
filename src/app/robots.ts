import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/staff", "/api"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
