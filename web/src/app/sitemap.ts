import type { MetadataRoute } from "next";

const BASE = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://maizai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/request-access`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/sign-in`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
