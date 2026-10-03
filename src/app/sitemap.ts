import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { properties } from "@/data/properties";
import { areas } from "@/data/areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/owners`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/booking`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const areaRoutes: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${site.url}/areas/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${site.url}/property/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...areaRoutes, ...propertyRoutes];
}
