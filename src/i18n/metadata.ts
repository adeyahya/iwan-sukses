import type { Metadata } from "next";

import { localePath, locales, ogLocales, type Lang } from "@/i18n/config";

/** Canonical, hreflang, dan Open Graph per bahasa untuk halaman di path (tanpa awalan bahasa) */
export function pageMetadata(lang: Lang, path: string, { title, description }: { title: string; description: string }): Metadata {
  const url = localePath(lang, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { url, title, description, locale: ogLocales[lang] },
    twitter: { title, description },
  };
}

export const languageAlternates = (path: string) => ({
  ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
  "x-default": path,
});
