import { ogSize, renderOg } from "@/lib/og";

export const alt = "Konfigurator kanopi kaca 3D dari Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Konfigurator 3D",
    title: "Rancang kanopi kaca, lihat bayangan mataharinya",
    footer: "Atur ukuran, kemiringan, kaca, dan rangka",
  });
}
