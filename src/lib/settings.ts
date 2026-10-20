// Bentuk dan nilai awal pengaturan situs (tabel settings). Nilai tersimpan selalu digabung
// dengan nilai awal, jadi kolom baru tetap punya isi meskipun belum pernah disimpan dari admin.
import { defaultCutPrices, type CutPrices } from "@/lib/configurators/kaca-potong";
import { defaultKanopiPrices, type KanopiPrices } from "@/lib/configurators/kanopi";
import { defaultRailingPrices, type RailingPrices } from "@/lib/configurators/railing";
import { defaultShowerPrices, type ShowerPrices } from "@/lib/configurators/shower";
import { unsplash } from "@/lib/data";

export type Settings = {
  company: {
    legalName: string;
    instagram: string;
    instagramHandle: string;
    footerNote: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    facts: { value: string; label: string }[];
    badges: string[];
    fallbackImage: string; // tampil bila browser tidak bisa menjalankan animasi 3D
  };
  lists: {
    services: string[];
    glassBrands: string[];
    serviceAreas: string[];
    quoteOptions: string[];
  };
  sections: {
    productsTitle: string;
    productsLead: string;
    galleryTitle: string;
    galleryLead: string;
    artTitle: string;
    artLead: string;
    artImages: { image: string; alt: string }[];
    processTitle: string;
    processLead: string;
    processImage: string;
    locationsTitle: string;
    locationsLead: string;
    contactTitle: string;
    contactLead: string;
  };
  // Foto kartu di halaman /konfigurator
  configuratorImages: {
    shower: string;
    showerAlt: string;
    kanopi: string;
    kanopiAlt: string;
    kacaPotong: string;
    kacaPotongAlt: string;
    railing: string;
    railingAlt: string;
  };
  artTechniques: { name: string; desc: string }[];
  orderSteps: { title: string; desc: string }[];
  instagramShots: { image: string; label: string }[];
  "prices.shower": ShowerPrices;
  "prices.kanopi": KanopiPrices;
  "prices.kacaPotong": CutPrices;
  "prices.railing": RailingPrices;
};

export type SettingKey = keyof Settings;

export const defaultSettings: Settings = {
  company: {
    legalName: "CV Iwan Sukses Cemerlang",
    instagram: "https://www.instagram.com/kaca_iwan.sukses/",
    instagramHandle: "@kaca_iwan.sukses",
    footerNote: "Draft konsep. Foto contoh dari Unsplash.",
  },
  hero: {
    eyebrow: "Distributor kaca · Probolinggo & Bali",
    title: "Kaca dan aluminium, dari lembaran sampai terpasang",
    lead: "CV Iwan Sukses Cemerlang menyediakan kaca lembaran grosir dan eceran, tempered glass, kusen aluminium, pintu sliding dan folding, kanopi, shower, railing, serta seni kaca. Dari pengukuran sampai pemasangan.",
    facts: [
      { value: "2 toko", label: "Probolinggo & Bali" },
      { value: "Jatim & Bali", label: "Kirim dan pasang" },
      { value: "5,0/5", label: "Rating Google" },
    ],
    badges: ["Float", "Tempered", "Laminated"],
    fallbackImage: unsplash("1758998256408-ab2c9fbec19b"),
  },
  lists: {
    services: ["Grosir kaca lembaran", "Tempered glass", "Kusen aluminium", "Casement & sliding", "Kanopi & railing", "Seni kaca"],
    // DRAFT: merek diambil dari ulasan Google pelanggan; konfirmasi ke pemilik
    glassBrands: ["Asahi", "Mulia", "Xinyi", "KCC"],
    // DRAFT: daftar kota dari situs lama iwankacasukses.com; konfirmasi ke pemilik
    serviceAreas: ["Probolinggo", "Pasuruan", "Sidoarjo", "Surabaya", "Malang", "Bali"],
    quoteOptions: [
      "Kaca lembaran (grosir/eceran)",
      "Tempered glass",
      "Shower box",
      "Kanopi kaca",
      "Railing kaca",
      "Sliding / folding door",
      "Kusen aluminium / casement",
      "Seni kaca (patri, grafir, sandblast)",
      "Cermin / partisi",
      "Lainnya",
    ],
  },
  sections: {
    productsTitle: "Satu distributor untuk kaca, kusen, dan pintu",
    productsLead:
      "Pelanggan menyebut kami agen kaca terlengkap. Pilih kategori untuk melihat contoh pekerjaan; semua kaca bisa dipotong sesuai ukuran.",
    galleryTitle: "Hasil kerja yang bisa Anda lihat",
    galleryLead: "Klik foto untuk memperbesar.",
    artTitle: "Kaca yang jadi bagian dari desain",
    artLead: "Kami memproduksi kaca dekoratif sesuai gambar atau motif pilihan Anda, untuk pintu, jendela, plafon, dan partisi.",
    artImages: [
      { image: unsplash("1765447041711-701f95812945"), alt: "Jendela kaca patri berwarna memantulkan cahaya" },
      { image: unsplash("1579127499396-1fc18048a068"), alt: "Kaca patri motif bunga" },
      { image: unsplash("1632230997264-b2bfc65cb8b4"), alt: "Jendela kaca patri besar" },
    ],
    processTitle: "Dari ukuran sampai terpasang",
    processLead: "Kirim ukuran, kami hitung kebutuhan dan harganya. Pemasangan bisa oleh tim kami.",
    processImage: unsplash("1635184549996-8e482768acea"),
    locationsTitle: "Dua toko, di Probolinggo dan Bali",
    locationsLead: "Datang langsung untuk melihat stok, atau hubungi toko terdekat untuk ukur dan pasang.",
    contactTitle: "Minta penawaran hari ini",
    contactLead: "Tulis kebutuhan Anda dan pilih toko terdekat. Kami balas dengan harga dan estimasi waktu.",
  },
  configuratorImages: {
    shower: unsplash("1771929662486-f793e08f0f16"),
    showerAlt: "Shower box kaca tempered di kamar mandi marmer",
    kanopi: unsplash("1786999629449-40bf5a4f8e1d"),
    kanopiAlt: "Kanopi kaca pada fasad bangunan",
    kacaPotong: unsplash("1790746717531-d30e790ccea7"),
    kacaPotongAlt: "Tumpukan lembaran kaca",
    railing: "/proyek/railing-tangga-1-800.webp",
    railingAlt: "Railing kaca tangga dengan tiang dan handrail stainless",
  },
  artTechniques: [
    { name: "Kaca patri", desc: "Potongan kaca warna disusun dengan timah" },
    { name: "Grafir & sandblast", desc: "Motif buram untuk privasi dan dekorasi" },
    { name: "Kaca motif", desc: "Tekstur untuk pintu dan kamar mandi" },
    { name: "Cermin bevel", desc: "Tepi miring untuk dinding dan furnitur" },
  ],
  orderSteps: [
    { title: "Kirim kebutuhan", desc: "Jenis kaca atau produk, ukuran, dan jumlah lewat WhatsApp atau form di bawah." },
    { title: "Survei & penawaran", desc: "Untuk pekerjaan pasang, kami ukur langsung di lokasi lalu kirim penawaran tertulis." },
    { title: "Produksi", desc: "Kaca dipotong, diproses (tempered, poles, lubang), dan kusen dirakit di bengkel." },
    { title: "Kirim & pasang", desc: "Barang diantar dan dipasang oleh tim kami, atau diambil langsung di toko." },
  ],
  // DRAFT: ganti dengan foto dari feed Instagram
  instagramShots: [
    { image: unsplash("1762545444269-75ab7fc7cc0a"), label: "railing kaca" },
    { image: unsplash("1644916930530-0e4e5afdd20d"), label: "cermin" },
    { image: unsplash("1525119488448-d549af0dc221"), label: "fasad kaca" },
    { image: unsplash("1774199679021-db3b421867c3"), label: "pintu sliding" },
    { image: unsplash("1765447041711-701f95812945"), label: "kaca patri" },
    { image: unsplash("1631249008619-8be5db7b4995"), label: "partisi kaca" },
  ],
  "prices.shower": defaultShowerPrices,
  "prices.kanopi": defaultKanopiPrices,
  "prices.kacaPotong": defaultCutPrices,
  "prices.railing": defaultRailingPrices,
};

export const settingKeys = Object.keys(defaultSettings) as SettingKey[];

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// Gabung dalam: objek digabung per kunci, array dan nilai biasa diganti utuh
export function mergeDefaults<T>(fallback: T, stored: unknown): T {
  if (!isPlainObject(fallback) || !isPlainObject(stored)) return (stored ?? fallback) as T;
  const out: Record<string, unknown> = { ...fallback };
  for (const [k, v] of Object.entries(stored)) out[k] = k in fallback ? mergeDefaults((fallback as Record<string, unknown>)[k], v) : v;
  return out as T;
}

// ── Versi bahasa lain ──
// Teks English disimpan sebagai baris terpisah `<kunci>.en` (mis. `hero.en`) yang hanya berisi teks
// terjemahan. Isian yang kosong memakai teks Bahasa Indonesia, jadi terjemahan boleh sebagian.
export const translatedKeys = [
  "company",
  "hero",
  "lists",
  "sections",
  "configuratorImages",
  "artTechniques",
  "orderSteps",
  "instagramShots",
] as const satisfies readonly SettingKey[];
export type TranslatedKey = (typeof translatedKeys)[number];

export const overlayKey = (key: SettingKey, lang: string) => `${key}.${lang}`;

// Gabung terjemahan di atas nilai Indonesia: teks kosong diabaikan, daftar baris (objek) digabung
// per nomor baris, daftar teks diganti utuh bila ada isinya. Kunci di luar nilai Indonesia dibuang.
export function mergeTranslation<T>(base: T, overlay: unknown): T {
  if (typeof base === "string") return (typeof overlay === "string" && overlay.trim() ? overlay : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(overlay)) return base;
    if (base.every((v) => typeof v === "string")) {
      const lines = overlay.filter((v): v is string => typeof v === "string" && !!v.trim());
      return (lines.length ? lines : base) as T;
    }
    return base.map((item, i) => mergeTranslation(item, overlay[i])) as T;
  }
  if (isPlainObject(base)) {
    if (!isPlainObject(overlay)) return base;
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, mergeTranslation(v, overlay[k])])) as T;
  }
  return base;
}

type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

// Isi awal terjemahan English (baris `<kunci>.en`), ditulis oleh src/db/prepare.ts bila barisnya belum ada.
// Hanya teks; isian yang tidak ditulis di sini (nama perusahaan, merek, kota, foto) memakai nilai Indonesia.
// Daftar baris (facts, artTechniques, ...) dipasangkan per nomor baris, jadi urutannya harus sama.
export const defaultTranslations: { en: { [K in TranslatedKey]: DeepPartial<Settings[K]> } } = {
  en: {
    company: {
      footerNote: "Concept draft. Sample photos from Unsplash.",
    },
    hero: {
      eyebrow: "Glass distributor · Probolinggo & Bali",
      title: "Glass and aluminium, from sheet to installation",
      lead: "CV Iwan Sukses Cemerlang supplies wholesale and retail sheet glass, tempered glass, aluminium frames, sliding and folding doors, canopies, showers, railings, and art glass. From measuring to installation.",
      facts: [
        { value: "2 stores", label: "Probolinggo & Bali" },
        { value: "East Java & Bali", label: "Delivery and installation" },
        { value: "5.0/5", label: "Google rating" },
      ],
    },
    lists: {
      services: ["Wholesale sheet glass", "Tempered glass", "Aluminium frames", "Casement & sliding", "Canopies & railings", "Art glass"],
      quoteOptions: [
        "Sheet glass (wholesale/retail)",
        "Tempered glass",
        "Shower box",
        "Glass canopy",
        "Glass railing",
        "Sliding / folding door",
        "Aluminium / casement frames",
        "Art glass (stained, engraved, sandblasted)",
        "Mirrors / partitions",
        "Other",
      ],
    },
    sections: {
      productsTitle: "One distributor for glass, frames, and doors",
      productsLead: "Customers call us the most complete glass supplier around. Pick a category to see examples of our work; all glass can be cut to size.",
      galleryTitle: "Work you can see for yourself",
      galleryLead: "Click a photo to enlarge it.",
      artTitle: "Glass that becomes part of the design",
      artLead: "We produce decorative glass to your drawing or chosen pattern, for doors, windows, ceilings, and partitions.",
      artImages: [
        { alt: "Coloured stained glass window reflecting light" },
        { alt: "Floral stained glass" },
        { alt: "Large stained glass window" },
      ],
      processTitle: "From measurement to installation",
      processLead: "Send us your measurements and we'll work out what you need and the price. Our team can install it for you.",
      locationsTitle: "Two stores, in Probolinggo and Bali",
      locationsLead: "Visit us to see what's in stock, or contact the nearest store for measuring and installation.",
      contactTitle: "Get a quote today",
      contactLead: "Tell us what you need and choose the nearest store. We'll reply with a price and an estimated timeline.",
    },
    configuratorImages: {
      showerAlt: "Tempered glass shower box in a marble bathroom",
      kanopiAlt: "Glass canopy on a building facade",
      kacaPotongAlt: "Stack of glass sheets",
      railingAlt: "Glass stair railing with stainless posts and handrail",
    },
    artTechniques: [
      { name: "Stained glass", desc: "Pieces of coloured glass joined with lead" },
      { name: "Engraving & sandblasting", desc: "Frosted patterns for privacy and decoration" },
      { name: "Patterned glass", desc: "Textures for doors and bathrooms" },
      { name: "Bevelled mirrors", desc: "Angled edges for walls and furniture" },
    ],
    orderSteps: [
      { title: "Send your requirements", desc: "Glass or product type, size, and quantity, via WhatsApp or the form below." },
      { title: "Survey & quote", desc: "For installation jobs, we measure on site and then send a written quote." },
      { title: "Production", desc: "Glass is cut and processed (tempering, polishing, drilling), and frames are assembled in our workshop." },
      { title: "Delivery & installation", desc: "We deliver and install with our own team, or you can pick up at the store." },
    ],
    instagramShots: [
      { label: "glass railing" },
      { label: "mirror" },
      { label: "glass facade" },
      { label: "sliding door" },
      { label: "stained glass" },
      { label: "glass partition" },
    ],
  },
};
