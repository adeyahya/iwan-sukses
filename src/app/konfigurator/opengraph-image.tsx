import { ogSize, renderOg } from "@/lib/og";

export const alt = "Konfigurator 3D Iwan Sukses: shower box, kanopi kaca, dan kaca potong";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Konfigurator 3D",
    title: "Rancang sendiri, lihat hasilnya sebelum memesan",
    footer: "Shower box · Kanopi kaca · Railing kaca · Kaca potong",
  });
}
