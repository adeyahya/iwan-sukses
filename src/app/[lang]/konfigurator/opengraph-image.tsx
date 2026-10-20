import { ogSize, renderLocalizedOg } from "@/lib/og";

export const alt = "Konfigurator 3D Iwan Sukses: shower box, kanopi kaca, dan kaca potong";
export const size = ogSize;
export const contentType = "image/png";

export default function Image({ params }: { params: Promise<{ lang: string }> }) {
  return renderLocalizedOg(params, (t) => t.configurator.hub.og);
}
