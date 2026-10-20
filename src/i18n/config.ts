// Bahasa situs. Bahasa Indonesia tanpa awalan (/blog), English di bawah /en (/en/blog).
// src/proxy.ts menulis ulang URL tanpa awalan ke /id/... secara internal, jadi link lama tetap sama.

export const locales = ["id", "en"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "id";

export const hasLang = (v: string | undefined): v is Lang => !!v && (locales as readonly string[]).includes(v);

export const langNames: Record<Lang, string> = { id: "Bahasa Indonesia", en: "English" };
export const ogLocales: Record<Lang, string> = { id: "id_ID", en: "en_US" };

/** Tambahkan awalan bahasa ke link internal ("/blog", "/#kontak"); link hash dan eksternal dibiarkan */
export function localePath(lang: Lang, href: string) {
  if (lang === defaultLang || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/") return `/${lang}`;
  if (href.startsWith("/#") || href.startsWith("/?")) return `/${lang}${href.slice(1)}`;
  return `/${lang}${href}`;
}

/** Path tanpa awalan bahasa: "/en/blog" → "/blog", "/en" → "/" */
export function stripLocale(pathname: string) {
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}
