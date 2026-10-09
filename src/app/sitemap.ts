import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getProperties } from "@/lib/server/catalog";
import { areas } from "@/data/areas";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const properties = await getProperties();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl(), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl()}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl()}/owners`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl()}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl()}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl()}/booking`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl()}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl()}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const areaRoutes: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${siteUrl()}/areas/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${siteUrl()}/property/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...areaRoutes, ...propertyRoutes];
}
