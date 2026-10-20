import { ogSize, renderLocalizedOg } from "@/lib/og";

export const alt = "Konfigurator shower box 3D dari Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image({ params }: { params: Promise<{ lang: string }> }) {
  return renderLocalizedOg(params, (t) => t.configurator.shower.og);
}
