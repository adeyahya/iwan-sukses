// Menyiapkan database: jalankan migrasi lalu isi tabel yang masih kosong dengan konten awal.
// Aman dijalankan berulang kali: lewat `pnpm db:setup` (otomatis sebelum `dev` dan `build`)
// dan saat server produksi mulai (src/instrumentation.ts).
import { count } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "@/db";
import { defaultGallery, defaultLocations, defaultPosts, defaultProducts } from "@/db/defaults";
import { galleryItems, locations, posts, products, settings } from "@/db/schema";
import { defaultSettings, settingKeys } from "@/lib/settings";

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
}
