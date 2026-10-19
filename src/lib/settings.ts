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
