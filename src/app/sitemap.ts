import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, masters] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    db.masterProfile.findMany({ where: { user: { status: "ACTIVE" } }, select: { id: true, updatedAt: true } }),
  ]);
  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/kategoriyalar"), changeFrequency: "weekly", priority: 0.8 },
    ...categories.map((c) => ({ url: siteUrl(`/kategoriyalar/${c.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...masters.map((m) => ({ url: siteUrl(`/ustalar/${m.id}`), lastModified: m.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
