import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/assets/", "/icon.png", "/favicon.ico", "/apple-touch-icon.png"],
      },
    ],
    sitemap: "https://hitungsaham.com/sitemap.xml",
    host: "https://hitungsaham.com",
  };
}

