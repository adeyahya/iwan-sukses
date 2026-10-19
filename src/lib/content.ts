import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { galleryItems, locations, posts, products, settings } from "@/db/schema";
import type { DocNode } from "@/lib/blog";
import type { GalleryItem, Location, Product, Store } from "@/lib/data";
import { defaultSettings, mergeDefaults, type SettingKey, type Settings } from "@/lib/settings";

// Semua konten publik di-cache dengan tag ini; setiap simpan di admin memanggil updateTag(contentTag)
export const contentTag = "content";

export async function readSettings(): Promise<Settings> {
  const rows = await db.select().from(settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = { ...defaultSettings } as Record<SettingKey, unknown>;
  for (const key of Object.keys(defaultSettings) as SettingKey[]) out[key] = mergeDefaults(defaultSettings[key], stored[key]);
  return out as Settings;
}

async function readLocations(): Promise<Location[]> {
  const rows = await db.select().from(locations).where(eq(locations.enabled, true)).orderBy(asc(locations.sortOrder), asc(locations.id));
  return rows.map((l) => ({
    tag: l.tag,
    main: l.main,
    name: l.name,
    address: l.address,
    phone: { label: l.phoneLabel, display: l.phoneDisplay, number: l.phoneNumber },
    opens: l.opens,
    maps: l.maps,
    locality: l.locality,
    region: l.region,
    postalCode: l.postalCode,
  }));
}

export async function getContent() {
  "use cache";
  cacheTag(contentTag);
  cacheLife("max");

  const [s, productRows, galleryRows, locs] = await Promise.all([
    readSettings(),
    db.select().from(products).where(eq(products.enabled, true)).orderBy(asc(products.sortOrder), asc(products.id)),
    db.select().from(galleryItems).where(eq(galleryItems.enabled, true)).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id)),
    readLocations(),
  ]);

  const productList: Product[] = productRows.map(({ title, note, image, alt, href, layout }) => ({ title, note, image, alt, href, layout }));
  const gallery: GalleryItem[] = galleryRows.map(({ src, video, cat, title, width, height }) => ({ src, video, cat, title, width, height }));
  // Toko utama di depan: dipakai sebagai pilihan awal dan tombol WhatsApp melayang
  const stores: Store[] = [...locs].sort((a, b) => Number(b.main) - Number(a.main)).map((l) => l.phone);

  return { settings: s, products: productList, gallery, locations: locs, stores };
}

export type Content = Awaited<ReturnType<typeof getContent>>;

// ── Blog ──
export const postsTag = "posts";

export type PostSummary = { slug: string; title: string; excerpt: string; coverImage: string; coverAlt: string; publishedAt: Date | null };

const summary = { slug: posts.slug, title: posts.title, excerpt: posts.excerpt, coverImage: posts.coverImage, coverAlt: posts.coverAlt, publishedAt: posts.publishedAt };

export async function getPublishedPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheTag(postsTag);
  cacheLife("max");
  return db.select(summary).from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt), desc(posts.id));
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
