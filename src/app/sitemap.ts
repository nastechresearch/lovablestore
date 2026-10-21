import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { STORE_URL } from "@/lib/constants";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = STORE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/moments",
    "/studio",
    "/gift-finder",
    "/promos",
    "/valentines",
    "/lookbook",
    "/guides",
    "/tools",
    "/tools/delivery-estimator",
    "/tools/size-converter",
    "/search",
    "/collections/gifts",
    "/collections/for-her",
    "/collections/for-him",
    "/collections/couples",
    "/collections/bestsellers",
    "/collections/under-500",
    "/about",
    "/contact",
    "/delivery-and-returns",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/shop" ? ("daily" as const) : ("weekly" as const),
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  try {
    const [products, tags] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.tag.findMany({ select: { slug: true } }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...tags.map((tag) => ({
        url: `${base}/tag/${tag.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...GUIDES.map((guide) => ({
        url: `${base}/guides/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
