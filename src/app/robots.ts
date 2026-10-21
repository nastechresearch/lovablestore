import type { MetadataRoute } from "next";
import { STORE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const base = STORE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/api",
          "/cart",
          "/checkout",
          "/order",
          "/track",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
