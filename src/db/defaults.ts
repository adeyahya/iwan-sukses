// Isi awal database dalam Bahasa Indonesia dan English (kolom *En), diambil dari konten situs
// sebelum ada panel admin. Dipakai oleh src/db/prepare.ts saat tabel masih kosong, dan sekali
// untuk mengisi kolom English yang masih kosong di database lama.
import { mapsSearch, unsplash, type GalleryCategory, type GalleryItem, type Product } from "@/lib/data";

type SeedProduct = Product & { titleEn: string; noteEn: string; altEn: string };
type SeedGalleryItem = GalleryItem & { titleEn: string };

export const defaultProducts: SeedProduct[] = [
  {
    title: "Kaca lembaran",
    note: "Bening, riben, reflective. Grosir & eceran.",
    image: unsplash("1520431443445-05f652666f69"),
    alt: "Struktur atap dan dinding kaca",
    href: "#galeri:fasad",
    layout: "feature",
    titleEn: "Sheet glass",
    noteEn: "Clear, tinted, reflective. Wholesale & retail.",
    altEn: "Glass roof and wall structure",
  },
  {
    title: "Shower box",
    note: "Tempered 8–10 mm",
    image: unsplash("1571781418606-70265b9cce90"),
    alt: "Shower stall kaca bening",
    href: "#galeri:shower",
    titleEn: "Shower box",
    noteEn: "8–10 mm tempered",
    altEn: "Clear glass shower stall",
  },
  {
    title: "Railing kaca",
    note: "Tangga & balkon",
    image: "/proyek/railing-tangga-1",
    alt: "Railing kaca tangga dengan tiang stainless",
    href: "#galeri:railing",
    titleEn: "Glass railing",
    noteEn: "Stairs & balconies",
    altEn: "Glass stair railing with stainless posts",
  },
  {
    title: "Sliding & folding",
    note: "Pintu kaca aluminium",
    image: unsplash("1525570665650-76bb26af503d"),
    alt: "Pintu sliding kaca",
    href: "#galeri:pintu",
    titleEn: "Sliding & folding",
    noteEn: "Aluminium glass doors",
    altEn: "Sliding glass door",
  },
  {
    title: "Kanopi kaca",
    note: "Laminated & tempered",
    image: "/proyek/kanopi-rooftop-1",
    alt: "Kanopi kaca rangka hitam di rooftop",
    href: "#galeri:kanopi",
    titleEn: "Glass canopy",
    noteEn: "Laminated & tempered",
    altEn: "Black-framed glass canopy on a rooftop",
  },
  {
    title: "Kusen aluminium & casement",
    note: "Jendela, pintu, dan bovenlicht",
    image: unsplash("1546628484-186b26f3e572"),
    alt: "Bangunan dengan jendela kaca berbingkai",
    href: "#galeri:pintu",
    layout: "wide",
    titleEn: "Aluminium & casement frames",
    noteEn: "Windows, doors, and transoms",
    altEn: "Building with framed glass windows",
  },
  {
    title: "Seni kaca",
    note: "Patri, grafir, sandblast",
    image: unsplash("1772431189580-2b2f12c97982"),
    alt: "Detail kaca patri berwarna",
    href: "#seni-kaca",
    titleEn: "Art glass",
    noteEn: "Stained, engraved, sandblasted",
    altEn: "Detail of coloured stained glass",
  },
  {
    title: "Partisi & cermin",
    note: "Kantor, toko, rumah",
    image: unsplash("1637665637343-d497d345ed2f"),
    alt: "Lorong kantor dengan partisi kaca",
    href: "#galeri:interior",
    titleEn: "Partitions & mirrors",
    noteEn: "Offices, shops, homes",
    altEn: "Office corridor with glass partitions",
  },
];

const proyek = (name: string, cat: GalleryCategory, title: string, titleEn: string, width: number, height: number): SeedGalleryItem => ({
  src: `/proyek/${name}`,
  cat,
  title,
  titleEn,
  width,
  height,
});

const video = (name: string, cat: GalleryCategory, title: string, titleEn: string): SeedGalleryItem => ({
  src: `/proyek/${name}-poster-800.webp`,
  video: `/proyek/${name}.mp4`,
  cat,
  title,
  titleEn,
  width: 720,
  height: 1280,
});

const projectPhotos: SeedGalleryItem[] = [
  proyek("kanopi-rooftop-1", "kanopi", "Kanopi kaca rooftop, rangka hitam", "Rooftop glass canopy, black frame", 4000, 3000),
  proyek("railing-tangga-1", "railing", "Railing kaca tangga, tiang stainless", "Glass stair railing, stainless posts", 3000, 4000),
  video("railing-rumah-1", "railing", "Railing stainless tangga rumah, handrail kayu", "Stainless stair railing at a home, wooden handrail"),
  proyek("kanopi-tangga", "kanopi", "Atap kaca di atas tangga", "Glass roof over a staircase", 3000, 4000),
  proyek("railing-mezanin-1", "railing", "Railing kaca mezanin", "Mezzanine glass railing", 3000, 4000),
  proyek("railing-balkon", "railing", "Railing kaca balkon", "Balcony glass railing", 1280, 960),
  proyek("railing-tangga-3", "railing", "Railing kaca tangga dan mezanin", "Glass railing on stairs and mezzanine", 4000, 3000),
  proyek("lift-kaca", "fasad", "Rangka lift kaca", "Glass lift frame", 963, 1280),
  video("railing-rumah-2", "railing", "Railing stainless tangga, handrail kayu", "Stainless stair railing, wooden handrail"),
  proyek("railing-tangga-2", "railing", "Railing kaca tangga marmer", "Glass railing on marble stairs", 3000, 4000),
  proyek("railing-mezanin-2", "railing", "Railing kaca lantai mezanin", "Glass railing on a mezzanine floor", 3000, 4000),
];

const stock = (id: string, cat: GalleryCategory, title: string, titleEn: string): SeedGalleryItem => ({ src: unsplash(id), cat, title, titleEn });

const stockPhotos: SeedGalleryItem[] = [
  stock("1771929662486-f793e08f0f16", "shower", "Shower box tempered, kamar mandi marmer", "Tempered shower box, marble bathroom"),
  stock("1758998256408-ab2c9fbec19b", "pintu", "Folding door kaca bingkai hitam", "Black-framed glass folding door"),
  stock("1490351267196-b7a67e26e41b", "fasad", "Curtain wall kaca reflective", "Reflective glass curtain wall"),
  stock("1631249008619-8be5db7b4995", "interior", "Partisi kaca lorong kantor", "Glass partition in an office corridor"),
  stock("1579127499396-1fc18048a068", "seni", "Kaca patri motif bunga", "Floral stained glass"),
  stock("1571781418606-70265b9cce90", "shower", "Shower kaca frameless", "Frameless glass shower"),
  stock("1774199679021-db3b421867c3", "pintu", "Jendela kaca besar ruang keluarga", "Large glass window in a living room"),
  stock("1470075801209-17f9ec0cada6", "fasad", "Gedung kaca malam hari", "Glass building at night"),
  stock("1621831337128-35676ca30868", "fasad", "Fasad kaca gedung", "Glass building facade"),
  stock("1644916930530-0e4e5afdd20d", "interior", "Cermin bulat wastafel", "Round mirror above a sink"),
  stock("1632230997264-b2bfc65cb8b4", "seni", "Jendela kaca patri", "Stained glass window"),
  stock("1569216961559-fd512349ebba", "pintu", "Jendela casement", "Casement window"),
  stock("1525119488448-d549af0dc221", "fasad", "Curtain wall", "Curtain wall"),
  stock("1637665637343-d497d345ed2f", "interior", "Partisi kaca ruang rapat", "Glass partition in a meeting room"),
  stock("1765447041711-701f95812945", "seni", "Kaca patri warna", "Coloured stained glass"),
  stock("1662624919582-007c57fdc3dd", "pintu", "Pintu dan jendela kaca", "Glass doors and windows"),
  stock("1554469384-e58fac16e23a", "fasad", "Gedung kaca", "Glass building"),
  stock("1766603636700-e9d80473f40f", "pintu", "Rumah dengan jendela kaca lebar", "House with wide glass windows"),
];

// Galeri mengisi kolom dari atas ke bawah; urutan campur membuat tiap kolom berisi foto asli dan contoh
const spread = (items: SeedGalleryItem[]) => items.map((item, i) => ({ item, at: (i + 0.5) / items.length }));
export const defaultGallery: SeedGalleryItem[] = [...spread(projectPhotos), ...spread(stockPhotos)]
  .sort((a, b) => a.at - b.at)
  .map((p) => p.item);

// Sumber kontak dan lokasi: Google Maps (Oktober 2026). Jam tutup belum diketahui.
export const defaultLocations = [
  {
    tag: "Pusat",
    tagEn: "Head office",
    main: true,
    name: "CV Iwan Sukses Cemerlang",
    address: "Jl. Raya Tempuran, Krajan, Tempuran, Kec. Bantaran, Kab. Probolinggo, Jawa Timur 67261",
    phoneLabel: "Probolinggo (pusat)",
    phoneLabelEn: "Probolinggo (head office)",
    phoneDisplay: "0821-4310-1563",
    phoneNumber: "6282143101563",
    opens: "Mulai 08.00",
    opensEn: "From 08:00",
    maps: mapsSearch("CV. IWAN SUKSES CEMERLANG (PUSAT)"),
    locality: "Kabupaten Probolinggo",
    region: "Jawa Timur",
    postalCode: "67261",
  },
  {
    tag: "Cabang Bali",
    tagEn: "Bali branch",
    main: false,
    name: "Iwan Sukses Kaca Bali",
    address: "Jl. Ahmad Yani IX, Abian Tuwung, Kec. Kediri, Kab. Tabanan, Bali 82121",
    phoneLabel: "Bali (Tabanan)",
    phoneLabelEn: "Bali (Tabanan)",
    phoneDisplay: "0811-3331-1155",
    phoneNumber: "6281133311155",
    opens: "Mulai 08.00",
    opensEn: "From 08:00",
    maps: mapsSearch("Iwan Sukses Kaca Bali Tabanan"),
    locality: "Kabupaten Tabanan",
    region: "Bali",
    postalCode: "82121",
  },
];

// Contoh artikel (satu per bahasa) agar halaman blog tidak kosong; boleh dihapus atau diubah dari /admin/blog
const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const h2 = (text: string) => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
const li = (bold: string, text: string) => ({
  type: "listItem",
  content: [{ type: "paragraph", content: [{ type: "text", text: bold, marks: [{ type: "bold" }] }, { type: "text", text }] }],
});

export const defaultPosts = [
  {
    locale: "id" as const,
    slug: "memilih-tebal-kaca-tempered-shower-box",
    title: "Memilih tebal kaca tempered untuk shower box",
    excerpt: "8, 10, atau 12 mm? Panduan singkat memilih ketebalan kaca sesuai ukuran dan model shower box.",
    coverImage: unsplash("1571781418606-70265b9cce90"),
    coverAlt: "Shower box kaca tempered frameless",
    status: "published" as const,
    publishedAt: new Date("2026-10-01T09:00:00+07:00"),
    content: {
      type: "doc",
      content: [
        p("Kaca tempered adalah pilihan standar untuk shower box karena lima kali lebih kuat dari kaca biasa dan pecah menjadi butiran kecil yang tidak tajam. Pertanyaan yang paling sering kami terima: berapa tebal yang dibutuhkan?"),
        h2("Patokan cepat"),
        {
          type: "bulletList",
          content: [
            li("8 mm: ", "panel dengan rangka atau lebar sampai sekitar 90 cm."),
            li("10 mm: ", "pilihan paling umum untuk shower frameless dan pintu ayun."),
            li("12 mm: ", "panel lebar di atas 160 cm atau walk-in tanpa penyangga atas."),
          ],
        },
        h2("Jangan lupa aksesorisnya"),
        p("Engsel, klem, dan gagang harus sesuai dengan tebal kaca. Aksesoris stainless 304 tahan karat di kamar mandi yang lembap."),
        {
          type: "blockquote",
          content: [p("Ragu memilih? Coba konfigurator shower box di situs ini untuk melihat estimasi harganya, lalu kirim desainnya ke kami lewat WhatsApp.")],
        },
      ],
    },
  },
  {
    locale: "en" as const,
    slug: "choosing-tempered-glass-thickness-for-a-shower-box",
    title: "Choosing tempered glass thickness for a shower box",
    excerpt: "8, 10, or 12 mm? A short guide to choosing glass thickness for your shower box size and model.",
    coverImage: unsplash("1571781418606-70265b9cce90"),
    coverAlt: "Frameless tempered glass shower box",
    status: "published" as const,
    publishedAt: new Date("2026-10-01T09:00:00+07:00"),
    content: {
      type: "doc",
      content: [
        p("Tempered glass is the standard choice for shower boxes: it is five times stronger than ordinary glass and breaks into small, blunt pieces instead of sharp shards. The question we hear most often: how thick does it need to be?"),
        h2("Quick guide"),
        {
          type: "bulletList",
          content: [
            li("8 mm: ", "framed panels or widths up to about 90 cm."),
            li("10 mm: ", "the most common choice for frameless showers and hinged doors."),
            li("12 mm: ", "wide panels over 160 cm, or walk-ins without a top support."),
          ],
        },
        h2("Don't forget the hardware"),
        p("Hinges, clamps, and handles must match the glass thickness. 304 stainless hardware won't rust in a humid bathroom."),
        {
          type: "blockquote",
          content: [p("Not sure? Try the shower box configurator on this site to see a price estimate, then send us your design via WhatsApp.")],
        },
      ],
    },
  },
];
