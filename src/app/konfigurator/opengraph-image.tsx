import { ogSize, renderOg } from "@/lib/og";

export const alt = "Konfigurator shower box 3D dari Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Konfigurator 3D",
    title: "Rancang shower box Anda, lihat estimasi harganya",
    footer: "Pilih model, ukuran, jenis kaca, dan aksesoris",
  });
}
