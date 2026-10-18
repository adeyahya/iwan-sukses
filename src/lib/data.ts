// Konten situs. Sumber kontak dan lokasi: Google Maps (Oktober 2026).
// Foto kanopi dan railing sudah proyek asli (public/proyek); sisanya masih draft dari Unsplash.

export const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const company = {
  legalName: "CV Iwan Sukses Cemerlang",
  instagram: "https://www.instagram.com/kaca_iwan.sukses/",
  instagramHandle: "@kaca_iwan.sukses",
};

export const whatsapp = {
  probolinggo: { label: "Probolinggo (pusat)", display: "0821-4310-1563", number: "6282143101563" },
  bali: { label: "Bali (Tabanan)", display: "0811-3331-1155", number: "6281133311155" },
} as const;

export const waLink = (number: string, text?: string) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// Pakai "/#..." agar menu tetap berfungsi dari halaman lain (mis. /konfigurator)
export const navLinks = [
  { href: "/#produk", label: "Produk" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/konfigurator", label: "Konfigurator" },
  { href: "/#proses", label: "Cara pesan" },
  { href: "/#lokasi", label: "Lokasi" },
  { href: "/#kontak", label: "Kontak" },
];

export const services = [
  "Grosir kaca lembaran",
  "Tempered glass",
  "Kusen aluminium",
  "Casement & sliding",
  "Kanopi & railing",
  "Seni kaca",
];

// DRAFT: merek diambil dari ulasan Google pelanggan; konfirmasi ke pemilik
export const glassBrands = ["Asahi", "Mulia", "Xinyi", "KCC"];

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

export const products: {
  title: string;
  note: string;
  image: string;
  alt: string;
  href: string;
  layout?: "feature" | "wide";
}[] = [
  { title: "Kaca lembaran", note: "Bening, riben, reflective. Grosir & eceran.", image: unsplash("1520431443445-05f652666f69"), alt: "Struktur atap dan dinding kaca", href: "#galeri:fasad", layout: "feature" },
  { title: "Shower box", note: "Tempered 8–10 mm", image: unsplash("1571781418606-70265b9cce90"), alt: "Shower stall kaca bening", href: "#galeri:shower" },
  { title: "Railing kaca", note: "Tangga & balkon", image: "/proyek/railing-tangga-1", alt: "Railing kaca tangga dengan tiang stainless", href: "#galeri:railing" },
  { title: "Sliding & folding", note: "Pintu kaca aluminium", image: unsplash("1525570665650-76bb26af503d"), alt: "Pintu sliding kaca", href: "#galeri:pintu" },
  { title: "Kanopi kaca", note: "Laminated & tempered", image: "/proyek/kanopi-rooftop-1", alt: "Kanopi kaca rangka hitam di rooftop", href: "#galeri:kanopi" },
  { title: "Kusen aluminium & casement", note: "Jendela, pintu, dan bovenlicht", image: unsplash("1546628484-186b26f3e572"), alt: "Bangunan dengan jendela kaca berbingkai", href: "#galeri:pintu", layout: "wide" },
  { title: "Seni kaca", note: "Patri, grafir, sandblast", image: unsplash("1772431189580-2b2f12c97982"), alt: "Detail kaca patri berwarna", href: "#seni-kaca" },
  { title: "Partisi & cermin", note: "Kantor, toko, rumah", image: unsplash("1637665637343-d497d345ed2f"), alt: "Lorong kantor dengan partisi kaca", href: "#galeri:interior" },
];

// Foto proyek asli (public/proyek, sumber asli di assets/whatsapp) disebar merata di antara foto contoh Unsplash.
// width/height = ukuran asli foto proyek; foto Unsplash dipotong persegi oleh loader.
export type GalleryItem = { src: string; cat: GalleryCategory; title: string; width?: number; height?: number; video?: string };

const proyek = (name: string, cat: GalleryCategory, title: string, width: number, height: number): GalleryItem => ({
  src: `/proyek/${name}`,
  cat,
  title,
  width,
  height,
});

const video = (name: string, cat: GalleryCategory, title: string): GalleryItem => ({
  src: `/proyek/${name}-poster-800.webp`,
  video: `/proyek/${name}.mp4`,
  cat,
  title,
  width: 720,
  height: 1280,
});

const projectPhotos: GalleryItem[] = [
  proyek("kanopi-rooftop-1", "kanopi", "Kanopi kaca rooftop, rangka hitam", 4000, 3000),
  proyek("railing-tangga-1", "railing", "Railing kaca tangga, tiang stainless", 3000, 4000),
  video("railing-rumah-1", "railing", "Railing stainless tangga rumah, handrail kayu"),
  proyek("kanopi-tangga", "kanopi", "Atap kaca di atas tangga", 3000, 4000),
  proyek("railing-mezanin-1", "railing", "Railing kaca mezanin", 3000, 4000),
  proyek("railing-balkon", "railing", "Railing kaca balkon", 1280, 960),
  proyek("railing-tangga-3", "railing", "Railing kaca tangga dan mezanin", 4000, 3000),
  proyek("lift-kaca", "fasad", "Rangka lift kaca", 963, 1280),
  video("railing-rumah-2", "railing", "Railing stainless tangga, handrail kayu"),
  proyek("railing-tangga-2", "railing", "Railing kaca tangga marmer", 3000, 4000),
  proyek("railing-mezanin-2", "railing", "Railing kaca lantai mezanin", 3000, 4000),
];

const stockPhotos: GalleryItem[] = [
  { src: unsplash("1771929662486-f793e08f0f16"), cat: "shower", title: "Shower box tempered, kamar mandi marmer" },
  { src: unsplash("1758998256408-ab2c9fbec19b"), cat: "pintu", title: "Folding door kaca bingkai hitam" },
  { src: unsplash("1490351267196-b7a67e26e41b"), cat: "fasad", title: "Curtain wall kaca reflective" },
  { src: unsplash("1631249008619-8be5db7b4995"), cat: "interior", title: "Partisi kaca lorong kantor" },
  { src: unsplash("1579127499396-1fc18048a068"), cat: "seni", title: "Kaca patri motif bunga" },
  { src: unsplash("1571781418606-70265b9cce90"), cat: "shower", title: "Shower kaca frameless" },
  { src: unsplash("1774199679021-db3b421867c3"), cat: "pintu", title: "Jendela kaca besar ruang keluarga" },
  { src: unsplash("1470075801209-17f9ec0cada6"), cat: "fasad", title: "Gedung kaca malam hari" },
  { src: unsplash("1621831337128-35676ca30868"), cat: "fasad", title: "Fasad kaca gedung" },
  { src: unsplash("1644916930530-0e4e5afdd20d"), cat: "interior", title: "Cermin bulat wastafel" },
  { src: unsplash("1632230997264-b2bfc65cb8b4"), cat: "seni", title: "Jendela kaca patri" },
  { src: unsplash("1569216961559-fd512349ebba"), cat: "pintu", title: "Jendela casement" },
  { src: unsplash("1525119488448-d549af0dc221"), cat: "fasad", title: "Curtain wall" },
  { src: unsplash("1637665637343-d497d345ed2f"), cat: "interior", title: "Partisi kaca ruang rapat" },
  { src: unsplash("1765447041711-701f95812945"), cat: "seni", title: "Kaca patri warna" },
  { src: unsplash("1662624919582-007c57fdc3dd"), cat: "pintu", title: "Pintu dan jendela kaca" },
  { src: unsplash("1554469384-e58fac16e23a"), cat: "fasad", title: "Gedung kaca" },
  { src: unsplash("1766603636700-e9d80473f40f"), cat: "pintu", title: "Rumah dengan jendela kaca lebar" },
];

// Galeri mengisi kolom dari atas ke bawah; urutan campur membuat tiap kolom berisi foto asli dan contoh
const spread = (items: GalleryItem[]) => items.map((item, i) => ({ item, at: (i + 0.5) / items.length }));
export const gallery: GalleryItem[] = [...spread(projectPhotos), ...spread(stockPhotos)]
  .sort((a, b) => a.at - b.at)
  .map((p) => p.item);

export const artTechniques = [
  { name: "Kaca patri", desc: "Potongan kaca warna disusun dengan timah" },
  { name: "Grafir & sandblast", desc: "Motif buram untuk privasi dan dekorasi" },
  { name: "Kaca motif", desc: "Tekstur untuk pintu dan kamar mandi" },
  { name: "Cermin bevel", desc: "Tepi miring untuk dinding dan furnitur" },
];

export const orderSteps = [
  { title: "Kirim kebutuhan", desc: "Jenis kaca atau produk, ukuran, dan jumlah lewat WhatsApp atau form di bawah." },
  { title: "Survei & penawaran", desc: "Untuk pekerjaan pasang, kami ukur langsung di lokasi lalu kirim penawaran tertulis." },
  { title: "Produksi", desc: "Kaca dipotong, diproses (tempered, poles, lubang), dan kusen dirakit di bengkel." },
  { title: "Kirim & pasang", desc: "Barang diantar dan dipasang oleh tim kami, atau diambil langsung di toko." },
];

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// Jam tutup belum diketahui
export const locations = [
  {
    tag: "Pusat",
    main: true,
    name: "CV Iwan Sukses Cemerlang",
    address: "Jl. Raya Tempuran, Krajan, Tempuran, Kec. Bantaran, Kab. Probolinggo, Jawa Timur 67261",
    phone: whatsapp.probolinggo,
    opens: "Mulai 08.00",
    maps: maps("CV. IWAN SUKSES CEMERLANG (PUSAT)"),
  },
  {
    tag: "Cabang Bali",
    main: false,
    name: "Iwan Sukses Kaca Bali",
    address: "Jl. Ahmad Yani IX, Abian Tuwung, Kec. Kediri, Kab. Tabanan, Bali 82121",
    phone: whatsapp.bali,
    opens: "Mulai 08.00",
    maps: maps("Iwan Sukses Kaca Bali Tabanan"),
  },
];

// DRAFT: daftar kota dari situs lama iwankacasukses.com; konfirmasi ke pemilik
export const serviceAreas = ["Probolinggo", "Pasuruan", "Sidoarjo", "Surabaya", "Malang", "Bali"];

// DRAFT: ganti dengan foto dari feed Instagram
export const instagramShots = [
  { id: "1762545444269-75ab7fc7cc0a", label: "railing kaca" },
  { id: "1644916930530-0e4e5afdd20d", label: "cermin" },
  { id: "1525119488448-d549af0dc221", label: "fasad kaca" },
  { id: "1774199679021-db3b421867c3", label: "pintu sliding" },
  { id: "1765447041711-701f95812945", label: "kaca patri" },
  { id: "1631249008619-8be5db7b4995", label: "partisi kaca" },
];

export const quoteOptions = [
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
];
