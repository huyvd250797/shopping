import type { MetadataRoute } from "next";
import { getPublicSitemapEntries } from "@/features/catalog/queries";
import { getSiteUrl } from "@/lib/supabase/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const { products, categories } = await getPublicSitemapEntries();
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
