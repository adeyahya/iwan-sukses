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
- `legacy/`: versi HTML statis sebelumnya, sebagai referensi.
