import type { MetadataRoute } from "next";

import { localePath, locales } from "@/i18n/config";
import { configurators } from "@/lib/configurators";
import { getPublishedPosts } from "@/lib/content";
import { siteUrl } from "@/lib/site";

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates">;

// Satu entri per bahasa, masing-masing dengan daftar versi bahasa lainnya (hreflang)
const localized = (path: string, entry: Entry): MetadataRoute.Sitemap => {
  const languages = Object.fromEntries(locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`.replace(/\/$/, "")]));
  return locales.map((l) => ({ ...entry, url: languages[l], alternates: { languages } }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  return [
    ...localized("/", { changeFrequency: "monthly", priority: 1 }),
    ...localized("/konfigurator", { changeFrequency: "monthly", priority: 0.8 }),
    ...configurators.flatMap((c) => localized(c.path, { changeFrequency: "monthly", priority: 0.7 })),
    ...localized("/blog", { changeFrequency: "weekly", priority: 0.7 }),
    // Artikel hanya ditulis dalam Bahasa Indonesia; versi /en memakai URL ini sebagai canonical
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
