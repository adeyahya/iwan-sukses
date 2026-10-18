// Isi awal database, diambil dari konten situs sebelum ada panel admin.
// Hanya dipakai oleh src/db/setup.ts saat tabel masih kosong.
import { mapsSearch, unsplash, type GalleryCategory, type GalleryItem, type Product } from "@/lib/data";

export const defaultProducts: Product[] = [
  { title: "Kaca lembaran", note: "Bening, riben, reflective. Grosir & eceran.", image: unsplash("1520431443445-05f652666f69"), alt: "Struktur atap dan dinding kaca", href: "#galeri:fasad", layout: "feature" },
  { title: "Shower box", note: "Tempered 8–10 mm", image: unsplash("1571781418606-70265b9cce90"), alt: "Shower stall kaca bening", href: "#galeri:shower" },
  { title: "Railing kaca", note: "Tangga & balkon", image: "/proyek/railing-tangga-1", alt: "Railing kaca tangga dengan tiang stainless", href: "#galeri:railing" },
  { title: "Sliding & folding", note: "Pintu kaca aluminium", image: unsplash("1525570665650-76bb26af503d"), alt: "Pintu sliding kaca", href: "#galeri:pintu" },
  { title: "Kanopi kaca", note: "Laminated & tempered", image: "/proyek/kanopi-rooftop-1", alt: "Kanopi kaca rangka hitam di rooftop", href: "#galeri:kanopi" },
  { title: "Kusen aluminium & casement", note: "Jendela, pintu, dan bovenlicht", image: unsplash("1546628484-186b26f3e572"), alt: "Bangunan dengan jendela kaca berbingkai", href: "#galeri:pintu", layout: "wide" },
  { title: "Seni kaca", note: "Patri, grafir, sandblast", image: unsplash("1772431189580-2b2f12c97982"), alt: "Detail kaca patri berwarna", href: "#seni-kaca" },
  { title: "Partisi & cermin", note: "Kantor, toko, rumah", image: unsplash("1637665637343-d497d345ed2f"), alt: "Lorong kantor dengan partisi kaca", href: "#galeri:interior" },
];

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
export const defaultGallery: GalleryItem[] = [...spread(projectPhotos), ...spread(stockPhotos)]
  .sort((a, b) => a.at - b.at)
  .map((p) => p.item);

// Sumber kontak dan lokasi: Google Maps (Oktober 2026). Jam tutup belum diketahui.
export const defaultLocations = [
  {
    tag: "Pusat",
    main: true,
    name: "CV Iwan Sukses Cemerlang",
    address: "Jl. Raya Tempuran, Krajan, Tempuran, Kec. Bantaran, Kab. Probolinggo, Jawa Timur 67261",
    phoneLabel: "Probolinggo (pusat)",
    phoneDisplay: "0821-4310-1563",
    phoneNumber: "6282143101563",
    opens: "Mulai 08.00",
    maps: mapsSearch("CV. IWAN SUKSES CEMERLANG (PUSAT)"),
    locality: "Kabupaten Probolinggo",
    region: "Jawa Timur",
    postalCode: "67261",
  },
  {
    tag: "Cabang Bali",
    main: false,
    name: "Iwan Sukses Kaca Bali",
    address: "Jl. Ahmad Yani IX, Abian Tuwung, Kec. Kediri, Kab. Tabanan, Bali 82121",
    phoneLabel: "Bali (Tabanan)",
    phoneDisplay: "0811-3331-1155",
    phoneNumber: "6281133311155",
    opens: "Mulai 08.00",
    maps: mapsSearch("Iwan Sukses Kaca Bali Tabanan"),
    locality: "Kabupaten Tabanan",
    region: "Bali",
    postalCode: "82121",
  },
];
