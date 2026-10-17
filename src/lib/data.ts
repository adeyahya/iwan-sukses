// Konten situs. Sumber kontak dan lokasi: Google Maps (Oktober 2026).
// Foto masih draft dari Unsplash; ganti dengan foto proyek asli.

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
  { title: "Railing kaca", note: "Tangga & balkon", image: unsplash("1766156181041-0dc63ec093ff"), alt: "Railing kaca dengan penyangga logam", href: "#galeri:railing" },
  { title: "Sliding & folding", note: "Pintu kaca aluminium", image: unsplash("1525570665650-76bb26af503d"), alt: "Pintu sliding kaca", href: "#galeri:pintu" },
  { title: "Kanopi kaca", note: "Laminated & tempered", image: unsplash("1692263130378-f708d81155de"), alt: "Atap kaca di dalam bangunan", href: "#galeri:kanopi" },
  { title: "Kusen aluminium & casement", note: "Jendela, pintu, dan bovenlicht", image: unsplash("1546628484-186b26f3e572"), alt: "Bangunan dengan jendela kaca berbingkai", href: "#galeri:pintu", layout: "wide" },
  { title: "Seni kaca", note: "Patri, grafir, sandblast", image: unsplash("1772431189580-2b2f12c97982"), alt: "Detail kaca patri berwarna", href: "#seni-kaca" },
  { title: "Partisi & cermin", note: "Kantor, toko, rumah", image: unsplash("1637665637343-d497d345ed2f"), alt: "Lorong kantor dengan partisi kaca", href: "#galeri:interior" },
];

export const gallery: { id: string; cat: GalleryCategory; title: string }[] = [
  { id: "1771929662486-f793e08f0f16", cat: "shower", title: "Shower box tempered, kamar mandi marmer" },
  { id: "1758862528822-b0094ae44705", cat: "railing", title: "Railing kaca balkon" },
  { id: "1758998256408-ab2c9fbec19b", cat: "pintu", title: "Folding door kaca bingkai hitam" },
  { id: "1786999629449-40bf5a4f8e1d", cat: "kanopi", title: "Kanopi kaca fasad" },
  { id: "1490351267196-b7a67e26e41b", cat: "fasad", title: "Curtain wall kaca reflective" },
  { id: "1631249008619-8be5db7b4995", cat: "interior", title: "Partisi kaca lorong kantor" },
  { id: "1579127499396-1fc18048a068", cat: "seni", title: "Kaca patri motif bunga" },
  { id: "1571781418606-70265b9cce90", cat: "shower", title: "Shower kaca frameless" },
  { id: "1762545444269-75ab7fc7cc0a", cat: "railing", title: "Railing kaca tangga kayu" },
  { id: "1774199679021-db3b421867c3", cat: "pintu", title: "Jendela kaca besar ruang keluarga" },
  { id: "1470075801209-17f9ec0cada6", cat: "fasad", title: "Gedung kaca malam hari" },
  { id: "1621831337128-35676ca30868", cat: "fasad", title: "Fasad kaca gedung" },
  { id: "1644916930530-0e4e5afdd20d", cat: "interior", title: "Cermin bulat wastafel" },
  { id: "1632230997264-b2bfc65cb8b4", cat: "seni", title: "Jendela kaca patri" },
  { id: "1569216961559-fd512349ebba", cat: "pintu", title: "Jendela casement" },
  { id: "1766156181041-0dc63ec093ff", cat: "railing", title: "Railing kaca penyangga stainless" },
  { id: "1525119488448-d549af0dc221", cat: "fasad", title: "Curtain wall" },
  { id: "1637665637343-d497d345ed2f", cat: "interior", title: "Partisi kaca ruang rapat" },
  { id: "1692263130378-f708d81155de", cat: "kanopi", title: "Skylight kaca" },
  { id: "1765447041711-701f95812945", cat: "seni", title: "Kaca patri warna" },
  { id: "1662624919582-007c57fdc3dd", cat: "pintu", title: "Pintu dan jendela kaca" },
  { id: "1554469384-e58fac16e23a", cat: "fasad", title: "Gedung kaca" },
  { id: "1766603636700-e9d80473f40f", cat: "pintu", title: "Rumah dengan jendela kaca lebar" },
  { id: "1788170349131-817e857f9e12", cat: "railing", title: "Railing kaca dan handrail kayu" },
];

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
