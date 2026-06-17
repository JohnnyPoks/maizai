import type { MetadataRoute } from "next";

const BASE = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://maizai.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/request-access", "/sign-in"],
        disallow: [
          "/api/",
          "/dashboard",
          "/users",
          "/settings",
          "/thresholds",
          "/access-requests",
          "/classifications",
          "/leaf-images",
          "/recommendations",
          "/sensor-readings",
          "/change-password",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
