import type { MetadataRoute } from "next";

import { configurators } from "@/lib/configurators";
import { getPublishedPosts } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/konfigurator`, changeFrequency: "monthly", priority: 0.8 },
    ...configurators.map((c) => ({ url: `${siteUrl}${c.path}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
