import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding/"],
    },
    sitemap: "https://www.realxworld.net/sitemap.xml",
  };
}
