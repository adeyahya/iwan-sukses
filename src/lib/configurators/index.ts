import { kacaPotongPath } from "@/lib/configurators/kaca-potong";
import { kanopiPath } from "@/lib/configurators/kanopi";
import { showerPath } from "@/lib/configurators/shower";

// Daftar konfigurator untuk halaman hub, sitemap, dan tautan dari beranda.
// Foto kartunya diatur di admin (pengaturan configuratorImages, kunci = id).
export const configurators = [
  {
    id: "shower",
    path: showerPath,
    title: "Shower box",
    desc: "Walk-in, pintu ayun, pintu geser, atau sudut L. Atur ukuran, kaca, gagang, dan aksesoris.",
    features: ["Estimasi harga", "Lihat di AR"],
  },
  {
    id: "kanopi",
    path: kanopiPath,
    title: "Kanopi kaca",
    desc: "Lebar, tonjolan, kemiringan, dan sistem rangka. Lihat bayangan matahari pagi, siang, dan sore.",
    features: ["Simulasi bayangan", "Lihat di AR"],
  },
  {
    id: "kacaPotong",
    path: kacaPotongPath,
    title: "Kaca potong",
    desc: "Ukuran sampai sentimeter, bentuk, tebal, finishing tepi, dan lubang. Harga per lembar langsung terhitung.",
    features: ["Harga per lembar", "Kaca meja, rak, cermin"],
  },
] as const;
