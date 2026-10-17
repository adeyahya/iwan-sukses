// Alamat situs untuk URL absolut di metadata (og:image, canonical, sitemap).
// Set NEXT_PUBLIC_SITE_URL saat domain final sudah ada; di Vercel otomatis memakai domain produksi.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const siteName = "Iwan Sukses";

export const siteDescription =
  "CV Iwan Sukses Cemerlang, distributor kaca dengan toko di Probolinggo dan Tabanan, Bali: grosir kaca lembaran, tempered glass, seni kaca, kusen aluminium, sliding dan folding door, kanopi, shower, dan railing.";
