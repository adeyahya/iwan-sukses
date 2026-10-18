import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { galleryItems, locations, products, settings } from "@/db/schema";
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
