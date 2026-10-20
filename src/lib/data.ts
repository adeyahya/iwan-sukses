// Tipe dan utilitas konten situs. Isi kontennya ada di database (diatur lewat /admin);
// nilai awalnya ada di src/db/defaults.ts.

export const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const waLink = (number: string, text?: string) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Pakai "/#..." agar menu tetap berfungsi dari halaman lain (mis. /konfigurator).
// Label ada di kamus bahasa (nav.links); link diberi awalan bahasa lewat localePath.
export const navLinks = [
  { href: "/#produk", key: "produk" },
  { href: "/#galeri", key: "galeri" },
  { href: "/konfigurator", key: "konfigurator" },
  { href: "/blog", key: "blog" },
  { href: "/#proses", key: "proses" },
  { href: "/#lokasi", key: "lokasi" },
  { href: "/#kontak", key: "kontak" },
] as const;

export type GalleryCategory = "shower" | "pintu" | "kanopi" | "railing" | "fasad" | "interior" | "seni";

export const galleryFilters: { value: GalleryCategory | "semua"; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "shower", label: "Shower" },
  { value: "pintu", label: "Pintu & jendela" },
  { value: "kanopi", label: "Kanopi" },
  { value: "railing", label: "Railing" },
  { value: "fasad", label: "Fasad" },
  { value: "interior", label: "Interior" },
  { value: "seni", label: "Seni kaca" },
];

export const galleryCategories = galleryFilters.filter((f) => f.value !== "semua") as { value: GalleryCategory; label: string }[];

export type ProductLayout = "feature" | "wide";

export type Product = {
  title: string;
  note: string;
  image: string;
  alt: string;
  href: string;
  layout?: ProductLayout | null;
};

// width/height = ukuran asli foto proyek; foto Unsplash dipotong persegi oleh loader.
export type GalleryItem = { src: string; cat: GalleryCategory; title: string; width?: number | null; height?: number | null; video?: string | null };

// Nomor WhatsApp toko, untuk tombol kirim di form dan konfigurator
export type Store = { label: string; display: string; number: string };

export type Location = {
  tag: string;
  main: boolean;
  name: string;
  address: string;
  phone: Store;
  opens: string;
  maps: string;
  // Untuk data terstruktur schema.org
  locality: string;
  region: string;
  postalCode: string;
};

export const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
