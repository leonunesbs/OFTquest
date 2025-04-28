import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/premium/", "/api/auth/"],
    },
    sitemap: "https://oftquest.com.br/sitemap.xml",
  };
}
