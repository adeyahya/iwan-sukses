import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { galleryItems, locations, posts, products, settings } from "@/db/schema";
import { defaultLang, type Lang } from "@/i18n/config";
import type { DocNode } from "@/lib/blog";
import type { GalleryItem, Location, Product, Store } from "@/lib/data";
import { defaultSettings, mergeDefaults, mergeTranslation, overlayKey, translatedKeys, type SettingKey, type Settings } from "@/lib/settings";

// Semua konten publik di-cache dengan tag ini; setiap simpan di admin memanggil updateTag(contentTag)
export const contentTag = "content";

/** Pengaturan dalam Bahasa Indonesia, atau dengan terjemahan `lang` di atasnya (isian kosong = Indonesia) */
export async function readSettings(lang: Lang = defaultLang): Promise<Settings> {
  return settingsFrom(await readStored(), lang);
}

async function readStored() {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
}

function settingsFrom(stored: Record<string, unknown>, lang: Lang): Settings {
  const out = { ...defaultSettings } as Record<SettingKey, unknown>;
  for (const key of Object.keys(defaultSettings) as SettingKey[]) out[key] = mergeDefaults(defaultSettings[key], stored[key]);
  if (lang !== defaultLang) for (const key of translatedKeys) out[key] = mergeTranslation(out[key], stored[overlayKey(key, lang)]);
  return out as Settings;
}

/** Terjemahan mentah satu pengaturan (untuk form admin), tanpa isian dari Bahasa Indonesia */
export async function readSettingOverlay(key: SettingKey, lang: Lang): Promise<unknown> {
  const [row] = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, overlayKey(key, lang)));
  return row?.value ?? null;
}

// Teks English bila diisi, selain itu teks Indonesia
const pick = (lang: Lang, id: string, en: string | null) => (lang === "en" && en?.trim() ? en : id);

async function readLocations(lang: Lang): Promise<Location[]> {
  const rows = await db.select().from(locations).where(eq(locations.enabled, true)).orderBy(asc(locations.sortOrder), asc(locations.id));
  return rows.map((l) => ({
    tag: pick(lang, l.tag, l.tagEn),
    main: l.main,
    name: l.name,
    address: l.address,
    phone: { label: pick(lang, l.phoneLabel, l.phoneLabelEn), display: l.phoneDisplay, number: l.phoneNumber },
    opens: pick(lang, l.opens, l.opensEn),
    maps: l.maps,
    locality: l.locality,
    region: l.region,
    postalCode: l.postalCode,
  }));
}

// lang jadi bagian kunci cache, jadi tiap bahasa punya salinan sendiri
export async function getContent(lang: Lang) {
  "use cache";
  cacheTag(contentTag);
  cacheLife("max");

  const [stored, productRows, galleryRows, locs] = await Promise.all([
    readStored(),
    db.select().from(products).where(eq(products.enabled, true)).orderBy(asc(products.sortOrder), asc(products.id)),
    db.select().from(galleryItems).where(eq(galleryItems.enabled, true)).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id)),
    readLocations(lang),
  ]);
  const s = settingsFrom(stored, lang);

  const productList: Product[] = productRows.map((p) => ({
    title: pick(lang, p.title, p.titleEn),
    note: pick(lang, p.note, p.noteEn),
    image: p.image,
    alt: pick(lang, p.alt, p.altEn),
    href: p.href,
    layout: p.layout,
  }));
  const gallery: GalleryItem[] = galleryRows.map(({ src, video, cat, title, titleEn, width, height }) => ({
    src,
    video,
    cat,
    title: pick(lang, title, titleEn),
    width,
    height,
  }));
  // Toko utama di depan: dipakai sebagai pilihan awal dan tombol WhatsApp melayang
  const stores: Store[] = [...locs].sort((a, b) => Number(b.main) - Number(a.main)).map((l) => l.phone);

  // Pilihan kebutuhan di form penawaran: label sesuai bahasa, nilai (yang masuk pesan WhatsApp ke staf)
  // tetap Bahasa Indonesia, dipasangkan per nomor baris
  const quoteValues = lang === defaultLang ? s.lists.quoteOptions : settingsFrom(stored, defaultLang).lists.quoteOptions;
  const quoteNeeds = s.lists.quoteOptions.map((label, i) => ({ value: quoteValues[i] ?? label, label }));

  return { settings: s, products: productList, gallery, locations: locs, stores, quoteNeeds };
}

export type Content = Awaited<ReturnType<typeof getContent>>;

// ── Blog ──
export const postsTag = "posts";

export type PostSummary = { slug: string; locale: Lang; title: string; excerpt: string; coverImage: string; coverAlt: string; publishedAt: Date | null };

const summary = {
  slug: posts.slug,
  locale: posts.locale,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  coverAlt: posts.coverAlt,
  publishedAt: posts.publishedAt,
};

// Bahasa artikel yang tampil di daftar tiap bahasa: /blog hanya artikel Indonesia,
// /en/blog artikel English ditambah artikel Indonesia
const listedLocales: Record<Lang, Lang[]> = { id: ["id"], en: ["en", "id"] };

/** Artikel terbit untuk daftar blog `lang`; tanpa lang = semua artikel (sitemap, static params) */
export async function getPublishedPosts(lang?: Lang): Promise<PostSummary[]> {
  "use cache";
  cacheTag(postsTag);
  cacheLife("max");
  const published = eq(posts.status, "published");
  return db
    .select(summary)
    .from(posts)
    .where(lang ? and(published, inArray(posts.locale, listedLocales[lang])) : published)
    .orderBy(desc(posts.publishedAt), desc(posts.id));
}

export async function getPost(slug: string) {
  "use cache";
  cacheTag(postsTag);
  cacheLife("max");
  const [post] = await db
    .select({ ...summary, content: posts.content, updatedAt: posts.updatedAt })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")));
  return post ? { ...post, content: post.content as DocNode } : null;
}
