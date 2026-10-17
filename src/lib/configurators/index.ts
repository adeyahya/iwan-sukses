import { kacaPotongPath } from "@/lib/configurators/kaca-potong";
import { kanopiPath } from "@/lib/configurators/kanopi";
import { showerPath } from "@/lib/configurators/shower";

// Daftar konfigurator untuk halaman hub, sitemap, dan tautan dari beranda
export const configurators = [
  {
    path: showerPath,
    title: "Shower box",
    desc: "Walk-in, pintu ayun, pintu geser, atau sudut L. Atur ukuran, kaca, gagang, dan aksesoris.",
    features: ["Estimasi harga", "Lihat di AR"],
    image: "https://images.unsplash.com/photo-1771929662486-f793e08f0f16",
    alt: "Shower box kaca tempered di kamar mandi marmer",
  },
  {
    path: kanopiPath,
    title: "Kanopi kaca",
    desc: "Lebar, tonjolan, kemiringan, dan sistem rangka. Lihat bayangan matahari pagi, siang, dan sore.",
    features: ["Simulasi bayangan", "Lihat di AR"],
    image: "https://images.unsplash.com/photo-1786999629449-40bf5a4f8e1d",
    alt: "Kanopi kaca pada fasad bangunan",
  },
  {
    path: kacaPotongPath,
    title: "Kaca potong",
    desc: "Ukuran sampai sentimeter, bentuk, tebal, finishing tepi, dan lubang. Harga per lembar langsung terhitung.",
    features: ["Harga per lembar", "Kaca meja, rak, cermin"],
    image: "https://images.unsplash.com/photo-1790746717531-d30e790ccea7",
    alt: "Tumpukan lembaran kaca",
  },
];
