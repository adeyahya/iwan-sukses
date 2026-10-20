import { ogSize, renderLocalizedOg } from "@/lib/og";

export const alt = "Pesan kaca potong sesuai ukuran di Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image({ params }: { params: Promise<{ lang: string }> }) {
  return renderLocalizedOg(params, (t) => t.configurator.kacaPotong.og);
}
