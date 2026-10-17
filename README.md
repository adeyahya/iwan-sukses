# Iwan Sukses — situs distributor kaca

Situs satu halaman untuk CV Iwan Sukses Cemerlang (Probolinggo & Bali).
Next.js 16 (App Router, Turbopack), Tailwind CSS v4, shadcn/ui (Base UI), Three.js untuk animasi hero.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
```

- `src/lib/data.ts`: semua konten (produk, galeri, lokasi, nomor WhatsApp). Foto masih draft dari Unsplash.
- `src/app/globals.css`: token brand dipetakan ke variabel tema shadcn; kelas `.dark` untuk section gelap.
- `src/components/hero-glass.tsx`: animasi 3D lembaran kaca (konsep "Rak").
- `src/app/konfigurator/`: hub konfigurator 3D dan halaman shower box, kanopi kaca, serta kaca potong.
  - Data, opsi, dan harga contoh: `src/lib/configurators/` (satu file per produk).
  - Mesin 3D bersama (renderer, kamera, label, ekspor AR): `src/components/configurator/scenes/product-scene.ts`; tiap produk punya scene sendiri di folder yang sama.
  - Komponen UI bersama (pilihan, slider, estimasi, link desain): `src/components/configurator/configurator-ui.tsx`.
- `legacy/`: versi HTML statis sebelumnya, sebagai referensi.

## Metadata & SEO

Set `NEXT_PUBLIC_SITE_URL` (mis. `https://iwansukses.com`) agar canonical, `og:image`, sitemap, dan robots memakai domain final.
Di Vercel, domain produksi dipakai otomatis jika variabel ini kosong.
OG image dibuat dari kode (`src/lib/og.tsx`) memakai font Poppins di `assets/fonts/`.
