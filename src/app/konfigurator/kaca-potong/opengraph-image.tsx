import { ogSize, renderOg } from "@/lib/og";

export const alt = "Pesan kaca potong sesuai ukuran di Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Kaca potong custom",
    title: "Ukuran sampai sentimeter, harga langsung terhitung",
    footer: "Kaca meja · Rak · Cermin · Jendela",
  });
}
