import { ogSize, renderLocalizedOg } from "@/lib/og";

export const alt = "Konfigurator railing kaca 3D dari Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image({ params }: { params: Promise<{ lang: string }> }) {
  return renderLocalizedOg(params, (t) => t.configurator.railing.og);
}
