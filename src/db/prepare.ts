// Menyiapkan database: jalankan migrasi lalu isi tabel yang masih kosong dengan konten awal
// (Bahasa Indonesia dan English).
// Aman dijalankan berulang kali: lewat `pnpm db:setup` (otomatis sebelum `dev` dan `build`)
// dan saat server produksi mulai (src/instrumentation.ts).
import { and, count, eq, isNull } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "@/db";
import { defaultGallery, defaultLocations, defaultPosts, defaultProducts } from "@/db/defaults";
import { galleryItems, locations, posts, products, settings } from "@/db/schema";
import { defaultSettings, defaultTranslations, overlayKey, settingKeys, translatedKeys } from "@/lib/settings";

// Penanda bahwa kolom English di database lama sudah diisi sekali; isian yang kemudian dikosongkan
// dari admin tidak diisi ulang
const englishBackfillKey = "_seed.en";

export async function prepareDatabase() {
  await migrate(db, { migrationsFolder: "drizzle" });

  const isEmpty = async (table: typeof products | typeof galleryItems | typeof locations | typeof posts) =>
    (await db.select({ n: count() }).from(table))[0].n === 0;

  if (await isEmpty(products)) {
    await db.insert(products).values(defaultProducts.map((p, i) => ({ ...p, sortOrder: i })));
    console.log(`db: ${defaultProducts.length} produk ditambahkan`);
  }
  if (await isEmpty(galleryItems)) {
    await db.insert(galleryItems).values(defaultGallery.map((g, i) => ({ ...g, sortOrder: i })));
    console.log(`db: ${defaultGallery.length} foto galeri ditambahkan`);
  }
  if (await isEmpty(locations)) {
    await db.insert(locations).values(defaultLocations.map((l, i) => ({ ...l, sortOrder: i })));
    console.log(`db: ${defaultLocations.length} lokasi ditambahkan`);
  }
  if (await isEmpty(posts)) {
    await db.insert(posts).values(defaultPosts);
    console.log(`db: ${defaultPosts.length} contoh artikel blog ditambahkan`);
  }
  // Pengaturan yang belum ada diisi nilai awal; yang sudah diubah dari admin tidak disentuh
  const inserted = await db
    .insert(settings)
    .values(settingKeys.map((key) => ({ key, value: defaultSettings[key] })))
    .onConflictDoNothing()
    .returning({ key: settings.key });
  if (inserted.length) console.log(`db: pengaturan awal ditambahkan (${inserted.map((s) => s.key).join(", ")})`);

  // Terjemahan English pengaturan; baris yang sudah ada (pernah disimpan dari admin) tidak disentuh
  const translated = await db
    .insert(settings)
    .values(translatedKeys.map((key) => ({ key: overlayKey(key, "en"), value: defaultTranslations.en[key] })))
    .onConflictDoNothing()
    .returning({ key: settings.key });
  if (translated.length) console.log(`db: terjemahan English ditambahkan (${translated.map((s) => s.key).join(", ")})`);

  await backfillEnglish();
}

// Database yang dibuat sebelum ada kolom English: isi kolom *En yang masih kosong pada baris yang
// teks Indonesianya masih sama dengan isi awal, dan tambahkan contoh artikel English. Hanya sekali.
async function backfillEnglish() {
  const done = await db.insert(settings).values({ key: englishBackfillKey, value: true }).onConflictDoNothing().returning({ key: settings.key });
  if (!done.length) return;

  let rows = 0;
  for (const p of defaultProducts) {
    const r = await db
      .update(products)
      .set({ titleEn: p.titleEn, noteEn: p.noteEn, altEn: p.altEn })
      .where(and(eq(products.title, p.title), eq(products.image, p.image), isNull(products.titleEn), isNull(products.noteEn), isNull(products.altEn)));
    rows += r.rowsAffected;
  }
  for (const g of defaultGallery) {
    const r = await db.update(galleryItems).set({ titleEn: g.titleEn }).where(and(eq(galleryItems.src, g.src), eq(galleryItems.title, g.title), isNull(galleryItems.titleEn)));
    rows += r.rowsAffected;
  }
  for (const l of defaultLocations) {
    const r = await db
      .update(locations)
      .set({ tagEn: l.tagEn, phoneLabelEn: l.phoneLabelEn, opensEn: l.opensEn })
      .where(and(eq(locations.name, l.name), eq(locations.tag, l.tag), isNull(locations.tagEn), isNull(locations.phoneLabelEn), isNull(locations.opensEn)));
    rows += r.rowsAffected;
  }
  const newPosts = await db
    .insert(posts)
    .values(defaultPosts.filter((p) => p.locale === "en"))
    .onConflictDoNothing({ target: posts.slug })
    .returning({ slug: posts.slug });
  console.log(`db: teks English diisi untuk ${rows} baris lama, ${newPosts.length} contoh artikel English ditambahkan`);
}
