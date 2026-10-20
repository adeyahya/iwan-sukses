import type { Lang } from "@/i18n/config";
import { kacaPotongPath } from "@/lib/configurators/kaca-potong";
import { kanopiPath } from "@/lib/configurators/kanopi";
import { railingPath } from "@/lib/configurators/railing";
import { showerPath } from "@/lib/configurators/shower";

// Daftar konfigurator untuk halaman hub, sitemap, dan tautan dari beranda.
// Foto kartunya diatur di admin (pengaturan configuratorImages, kunci = id). en = teks untuk tampilan English.
export const configurators = [
  {
    id: "shower",
    path: showerPath,
    title: "Shower box",
    desc: "Walk-in, pintu ayun, pintu geser, atau sudut L. Atur ukuran, kaca, gagang, dan aksesoris.",
    features: ["Estimasi harga", "Lihat di AR"],
    en: {
      title: "Shower box",
      desc: "Walk-in, hinged door, sliding door, or L-shaped corner. Set the size, glass, handle, and accessories.",
      features: ["Price estimate", "View in AR"],
    },
  },
  {
    id: "kanopi",
    path: kanopiPath,
    title: "Kanopi kaca",
    desc: "Lebar, tonjolan, kemiringan, dan sistem rangka. Lihat bayangan matahari pagi, siang, dan sore.",
    features: ["Simulasi bayangan", "Lihat di AR"],
    en: {
      title: "Glass canopy",
      desc: "Width, projection, slope, and frame system. See the shadows of the morning, midday, and afternoon sun.",
      features: ["Shadow simulation", "View in AR"],
    },
  },
  {
    id: "railing",
    path: railingPath,
    title: "Railing kaca",
    desc: "Lurus, sudut L, atau tangga. Pilih sistem tiang, handrail, dan kaca, lihat detail jepitnya dalam 3D.",
    features: ["Estimasi harga", "Lihat di AR"],
    en: {
      title: "Glass railing",
      desc: "Straight, L-shaped, or staircase. Choose the post system, handrail, and glass, and see the clamp details in 3D.",
      features: ["Price estimate", "View in AR"],
    },
  },
  {
    id: "kacaPotong",
    path: kacaPotongPath,
    title: "Kaca potong",
    desc: "Ukuran sampai sentimeter, bentuk, tebal, finishing tepi, dan lubang. Harga per lembar langsung terhitung.",
    features: ["Harga per lembar", "Kaca meja, rak, cermin"],
    en: {
      title: "Cut-to-size glass",
      desc: "Size to the centimetre, shape, thickness, edge finish, and holes. The price per piece is calculated instantly.",
      features: ["Price per piece", "Table tops, shelves, mirrors"],
    },
  },
] as const;

export const configuratorText = (c: (typeof configurators)[number], lang: Lang) => (lang === "en" ? c.en : c);
