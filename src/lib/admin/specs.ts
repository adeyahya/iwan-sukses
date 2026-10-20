// Deskripsi form admin untuk pengaturan (tabel settings) dan harga konfigurator.
// Halaman admin dan server action sama-sama membaca daftar ini, jadi menambah kolom cukup di sini.
import { cutEdges, cutGlasses, thicknessByGlass } from "@/lib/configurators/kaca-potong";
import { frameColors, kanopiGlasses, kanopiThicknesses } from "@/lib/configurators/kanopi";
import { handrails, postFinishes, railingGlasses, railingSystems, railingThicknesses } from "@/lib/configurators/railing";
import { finishes, glassTypes, handles, layouts, thicknesses } from "@/lib/configurators/shower";
import type { SettingKey } from "@/lib/settings";

export type Column = { name: string; label: string; type?: "text" | "image" | "textarea" };

export type Field =
  | { type: "text" | "textarea" | "image"; name: string; label: string; hint?: string }
  | { type: "lines"; name: string; label: string; hint?: string }
  // name null = seluruh nilai pengaturan adalah daftar baris ini
  | { type: "rows"; name: string | null; label: string; hint?: string; columns: Column[]; fixed?: boolean };

export type SettingsSection = { slug: string; title: string; description: string; key: SettingKey; fields: Field[] };

export const settingsSections: SettingsSection[] = [
  {
    slug: "perusahaan",
    title: "Perusahaan",
    description: "Nama resmi, Instagram, dan catatan kecil di bagian bawah situs.",
    key: "company",
    fields: [
      { type: "text", name: "legalName", label: "Nama perusahaan" },
      { type: "text", name: "instagram", label: "Link Instagram", hint: "Contoh: https://www.instagram.com/kaca_iwan.sukses/" },
      { type: "text", name: "instagramHandle", label: "Nama akun Instagram", hint: "Contoh: @kaca_iwan.sukses" },
      { type: "text", name: "footerNote", label: "Catatan footer", hint: "Kosongkan untuk menyembunyikan." },
    ],
  },
  {
    slug: "hero",
    title: "Bagian atas (hero)",
    description: "Judul besar, paragraf pembuka, dan angka-angka di halaman depan.",
    key: "hero",
    fields: [
      { type: "text", name: "eyebrow", label: "Teks kecil di atas judul" },
      { type: "textarea", name: "title", label: "Judul" },
      { type: "textarea", name: "lead", label: "Paragraf pembuka" },
      {
        type: "rows",
        name: "facts",
        label: "Angka & fakta",
        hint: "Tampil di bawah tombol; paling pas 3 baris.",
        columns: [
          { name: "value", label: "Angka" },
          { name: "label", label: "Keterangan" },
        ],
      },
      { type: "lines", name: "badges", label: "Label di atas gambar 3D", hint: "Satu label per baris." },
      {
        type: "image",
        name: "fallbackImage",
        label: "Foto cadangan latar hero",
        hint: "Hanya tampil bila browser pengunjung tidak bisa menjalankan animasi 3D. Pakai foto gelap dan lebar.",
      },
    ],
  },
  {
    slug: "daftar",
    title: "Layanan, merek & area",
    description: "Daftar pendek yang tampil di strip layanan, lokasi, dan form penawaran.",
    key: "lists",
    fields: [
      { type: "lines", name: "services", label: "Layanan (strip di bawah hero)", hint: "Satu per baris." },
      { type: "lines", name: "glassBrands", label: "Merek kaca tersedia", hint: "Satu per baris." },
      { type: "lines", name: "serviceAreas", label: "Area kirim & pasang", hint: "Satu kota per baris." },
      { type: "lines", name: "quoteOptions", label: "Pilihan kebutuhan di form penawaran", hint: "Satu per baris." },
    ],
  },
  {
    slug: "teks",
    title: "Judul & gambar bagian",
    description: "Judul, paragraf, dan foto untuk tiap bagian di halaman depan.",
    key: "sections",
    fields: [
      { type: "text", name: "productsTitle", label: "Produk: judul" },
      { type: "textarea", name: "productsLead", label: "Produk: paragraf" },
      { type: "text", name: "galleryTitle", label: "Galeri: judul" },
      { type: "textarea", name: "galleryLead", label: "Galeri: paragraf" },
      { type: "text", name: "artTitle", label: "Seni kaca: judul" },
      { type: "textarea", name: "artLead", label: "Seni kaca: paragraf" },
      {
        type: "rows",
        name: "artImages",
        label: "Seni kaca: 3 foto",
        hint: "Foto pertama tampil besar di kiri.",
        fixed: true,
        columns: [
          { name: "image", label: "Foto", type: "image" },
          { name: "alt", label: "Deskripsi foto" },
        ],
      },
      { type: "text", name: "processTitle", label: "Cara pesan: judul" },
      { type: "textarea", name: "processLead", label: "Cara pesan: paragraf" },
      { type: "image", name: "processImage", label: "Cara pesan: foto" },
      { type: "text", name: "locationsTitle", label: "Lokasi: judul" },
      { type: "textarea", name: "locationsLead", label: "Lokasi: paragraf" },
      { type: "text", name: "contactTitle", label: "Kontak: judul" },
      { type: "textarea", name: "contactLead", label: "Kontak: paragraf" },
    ],
  },
  {
    slug: "konfigurator",
    title: "Foto konfigurator",
    description: "Foto kartu shower box, kanopi, railing, dan kaca potong di halaman Konfigurator 3D.",
    key: "configuratorImages",
    fields: [
      { type: "image", name: "shower", label: "Shower box: foto" },
      { type: "text", name: "showerAlt", label: "Shower box: deskripsi foto" },
      { type: "image", name: "kanopi", label: "Kanopi kaca: foto" },
      { type: "text", name: "kanopiAlt", label: "Kanopi kaca: deskripsi foto" },
      { type: "image", name: "kacaPotong", label: "Kaca potong: foto" },
      { type: "text", name: "kacaPotongAlt", label: "Kaca potong: deskripsi foto" },
      { type: "image", name: "railing", label: "Railing kaca: foto" },
      { type: "text", name: "railingAlt", label: "Railing kaca: deskripsi foto" },
    ],
  },
  {
    slug: "seni-kaca",
    title: "Teknik seni kaca",
    description: "Daftar teknik di bagian seni kaca.",
    key: "artTechniques",
    fields: [
      {
        type: "rows",
        name: null,
        label: "Teknik",
        columns: [
          { name: "name", label: "Nama" },
          { name: "desc", label: "Keterangan" },
        ],
      },
    ],
  },
  {
    slug: "cara-pesan",
    title: "Langkah cara pesan",
    description: "Langkah bernomor di bagian cara pesan.",
    key: "orderSteps",
    fields: [
      {
        type: "rows",
        name: null,
        label: "Langkah",
        columns: [
          { name: "title", label: "Judul" },
          { name: "desc", label: "Keterangan", type: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "instagram",
    title: "Foto Instagram",
    description: "Kotak foto di bagian Instagram; semuanya menautkan ke akun Instagram.",
    key: "instagramShots",
    fields: [
      {
        type: "rows",
        name: null,
        label: "Foto",
        hint: "Paling pas 6 foto.",
        columns: [
          { name: "image", label: "Foto", type: "image" },
          { name: "label", label: "Keterangan (untuk pembaca layar)" },
        ],
      },
    ],
  },
];

// ── Harga konfigurator ──
// Setiap grup memetakan satu kunci (atau sub-kunci) objek harga; tanpa options = satu angka.
export type PriceGroup = {
  path: string;
  label: string;
  unit: "rp" | "factor" | "m2";
  options?: { value: string | number; label: string }[];
  hint?: string;
};

export type PriceForm = { key: Extract<SettingKey, `prices.${string}`>; title: string; description: string; groups: PriceGroup[] };

const opts = (list: { value: string | number; label: string }[]) => list.map(({ value, label }) => ({ value, label }));

export const priceForms: PriceForm[] = [
  {
    key: "prices.shower",
    title: "Shower box",
    description: "Estimasi = luas kaca × harga per m² + aksesoris × faktor warna + tambahan.",
    groups: [
      { path: "pricePerM2", label: "Kaca tempered per m²", unit: "rp", options: opts(thicknesses) },
      { path: "glassExtraPerM2", label: "Tambahan jenis kaca per m²", unit: "rp", options: opts(glassTypes) },
      { path: "hardware", label: "Paket aksesoris per model", unit: "rp", options: opts(layouts) },
      { path: "finishFactor", label: "Faktor harga warna aksesoris", unit: "factor", options: opts(finishes), hint: "1 = harga dasar, 1,15 = 15% lebih mahal." },
      { path: "handlePrice", label: "Gagang", unit: "rp", options: opts(handles) },
      { path: "coatingPerM2", label: "Nano coating per m²", unit: "rp" },
      { path: "seal", label: "Karet bawah pintu", unit: "rp" },
      { path: "towelBar", label: "Towel bar", unit: "rp" },
      { path: "install", label: "Pemasangan", unit: "rp" },
    ],
  },
  {
    key: "prices.kanopi",
    title: "Kanopi kaca",
    description: "Estimasi = luas kaca × harga per m² + (luas × rangka grid per m² + jumlah tiang × harga tiang) × faktor warna + tambahan.",
    groups: [
      { path: "glassPerM2", label: "Kaca laminated per m²", unit: "rp", options: opts(kanopiThicknesses) },
      { path: "glassExtraPerM2", label: "Tambahan jenis kaca per m²", unit: "rp", options: opts(kanopiGlasses) },
      { path: "gridPerM2", label: "Rangka grid hollow per m² (semua sistem)", unit: "rp" },
      { path: "columnPrice", label: "Tiang lurus per batang (tiang + grid)", unit: "rp" },
      { path: "bracketColumnPrice", label: "Tiang bercabang per batang (lengan Y atau lengkung)", unit: "rp" },
      { path: "frameFactor", label: "Faktor harga warna rangka", unit: "factor", options: opts(frameColors) },
      { path: "gutterPerM", label: "Talang air per meter", unit: "rp" },
      { path: "installPerM2", label: "Pemasangan per m²", unit: "rp" },
    ],
  },
  {
    key: "prices.railing",
    title: "Railing kaca",
    description: "Estimasi = luas kaca × harga per m² + jumlah tiang × harga tiang × faktor warna + panjang × (handrail + tambahan).",
    groups: [
      { path: "glassPerM2", label: "Kaca tempered per m²", unit: "rp", options: opts(railingThicknesses) },
      { path: "glassExtraPerM2", label: "Tambahan jenis kaca per m²", unit: "rp", options: opts(railingGlasses) },
      { path: "postPrice", label: "Tiang lengkap dengan jepit/dudukan, per batang", unit: "rp", options: opts(railingSystems) },
      { path: "postFactor", label: "Faktor harga warna tiang", unit: "factor", options: opts(postFinishes) },
      { path: "handrailPerM", label: "Handrail per meter", unit: "rp", options: opts(handrails) },
      { path: "stairPerM", label: "Tambahan potong miring tangga per meter", unit: "rp" },
      { path: "installPerM", label: "Pemasangan per meter", unit: "rp" },
    ],
  },
  {
    key: "prices.kacaPotong",
    title: "Kaca potong",
    description: "Harga per lembar = luas (minimal luas minimum) × harga per m² + finishing tepi per meter keliling + lubang.",
    groups: [
      ...cutGlasses.map((g) => ({
        path: `pricePerM2.${g.value}`,
        label: `${g.label} per m²`,
        unit: "rp" as const,
        options: thicknessByGlass[g.value].map((t) => ({ value: t, label: `${t} mm` })),
      })),
      { path: "edgePerM", label: "Finishing tepi per meter keliling", unit: "rp", options: opts(cutEdges) },
      { path: "hole", label: "Per lubang", unit: "rp" },
      { path: "minArea", label: "Luas minimum yang dihitung", unit: "m2" },
      { path: "roundSurcharge", label: "Faktor potong bulat/oval", unit: "factor", hint: "1,2 = 20% lebih mahal dari persegi." },
    ],
  },
];
