# Iwan Sukses — situs distributor kaca

Situs satu halaman untuk CV Iwan Sukses Cemerlang (Probolinggo & Bali).
Next.js 16 (App Router, Turbopack), Tailwind CSS v4, shadcn/ui (Base UI), Three.js untuk animasi hero.

```bash
pnpm install
cp .env.example .env.local   # isi SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
pnpm dev      # http://localhost:3000, panel admin di /admin
pnpm build
```

- `src/lib/data.ts`: tipe konten dan utilitas (link WhatsApp, kategori galeri).
- `src/app/globals.css`: token brand dipetakan ke variabel tema shadcn; kelas `.dark` untuk section gelap.
- `src/components/hero-glass.tsx`: animasi 3D lembaran kaca (konsep "Rak").
- `src/app/konfigurator/`: hub konfigurator 3D dan halaman shower box, kanopi kaca, serta kaca potong.
  - Data, opsi, dan harga contoh: `src/lib/configurators/` (satu file per produk).
  - Mesin 3D bersama (renderer, kamera, label, ekspor AR): `src/components/configurator/scenes/product-scene.ts`; tiap produk punya scene sendiri di folder yang sama.
  - Komponen UI bersama (pilihan, slider, estimasi, link desain): `src/components/configurator/configurator-ui.tsx`.
- `legacy/`: versi HTML statis sebelumnya, sebagai referensi.

## Panel admin & database

Semua konten (teks, produk, galeri, lokasi & nomor WhatsApp, harga konfigurator) diatur di `/admin` dan disimpan di SQLite lewat Drizzle.

- Admin masuk hanya dengan Google (OAuth, `src/lib/auth.ts`; redirect URI `<situs>/admin/login/google/callback`, lihat `.env.example`). Orang pertama yang masuk saat tabel `users` masih kosong menjadi admin. Admin lain diundang dari `/admin/pengguna` dengan email Google-nya; undangan terpakai saat orang itu pertama kali masuk. Sesi berupa cookie bertanda tangan `SESSION_SECRET` (7 hari).
- **Segera masuk setelah deploy**: sampai akun pertama ada, akun Google siapa pun yang membuka `/admin/login` bisa menjadi admin.
- Saat `pnpm dev`, halaman masuk punya tombol "Masuk tanpa Google (dev)" (masuk sebagai akun pertama, dibuat otomatis kalau belum ada). Tombol dan action-nya mati di build produksi.
- Database default: `data/iwan-sukses.db` (tidak di-commit). `pnpm dev` dan `pnpm build` otomatis menjalankan `pnpm db:setup`: migrasi lalu mengisi tabel kosong dengan konten awal dari `src/db/defaults.ts` dan `src/lib/settings.ts`.
- Skema: `src/db/schema.ts`. Setelah mengubahnya: `pnpm db:generate` (membuat migrasi di `drizzle/`), lalu `pnpm db:setup`.
- Konten publik di-cache (`"use cache"` + tag `content` di `src/lib/content.ts`); setiap simpan di admin memanggil `updateTag`, jadi situs langsung berubah tanpa build ulang.
- Foto yang diunggah diperkecil di browser (maks. 2000 px, WebP), disimpan di tabel `media`, dan disajikan di `/media/<id>`.
- Kolom foto di admin (`src/components/admin/image-input.tsx`) tidak meminta alamat: unggah (klik atau tarik file), pilih dari pustaka foto (`listPhotos`: semua unggahan + foto yang dipakai di situs), atau kosongkan. Galeri bisa menerima banyak foto sekaligus.
- Urutan produk, galeri, lokasi, dan baris berulang diatur dengan seret-lepas (`src/components/admin/sortable.tsx`, dnd-kit; jalan juga di HP).
- Blog: `/blog` dan `/blog/<slug>`, ditulis di `/admin/blog` dengan editor Tiptap (`src/components/admin/rich-text-editor.tsx`). Isi disimpan sebagai JSON, dibersihkan di server (`cleanDoc` di `src/lib/blog.ts`), lalu dirender tanpa HTML mentah (`src/components/blog/post-body.tsx`). Gaya teks artikel: kelas `.prose-blog` di `globals.css`, sama di editor dan halaman publik.
- Form admin dideskripsikan di `src/lib/admin/specs.ts`; menambah kolom pengaturan cukup di sana dan di `src/lib/settings.ts`.

**Produksi:** file SQLite butuh disk yang permanen (VPS/Docker dengan volume). Di Vercel atau hosting serverless lain, file tidak bertahan, jadi arahkan `DATABASE_URL` ke database libSQL/Turso (`libsql://…` + `DATABASE_AUTH_TOKEN`); tidak perlu ubah kode.

## Deploy dengan Docker

Semua data ada di satu volume `/data`: database SQLite `iwan-sukses.db`, termasuk foto yang diunggah dari admin (tabel `media`).

```bash
cp .env.example .env   # isi ADMIN_PASSWORD, SESSION_SECRET, NEXT_PUBLIC_SITE_URL
docker compose up -d --build
```

- Situs di port 3000 (ubah dengan `PORT` di `.env`); pasang reverse proxy (nginx/Caddy) di depannya untuk HTTPS.
- Saat container mulai, server menjalankan migrasi dan isi awal database (`src/instrumentation.ts`), lalu menyegarkan cache konten, karena halaman yang di-prerender saat build memakai database kosong milik build, bukan isi `/data`.
- `NEXT_PUBLIC_SITE_URL` ditanam saat build; ubah lalu build ulang.
- Cadangan: salin `/data/iwan-sukses.db` dari volume, mis. `docker compose cp web:/data/iwan-sukses.db ./backup.db`.

## Metadata & SEO

Set `NEXT_PUBLIC_SITE_URL` (mis. `https://iwansukses.com`) agar canonical, `og:image`, sitemap, dan robots memakai domain final.
Di Vercel, domain produksi dipakai otomatis jika variabel ini kosong.
OG image dibuat dari kode (`src/lib/og.tsx`) memakai font Poppins di `assets/fonts/`.
