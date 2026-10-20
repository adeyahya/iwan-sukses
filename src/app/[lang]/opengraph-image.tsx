import { ogSize, renderLocalizedOg } from "@/lib/og";

export const alt = "Iwan Sukses — distributor kaca dan aluminium di Probolinggo dan Bali";
export const size = ogSize;
export const contentType = "image/png";

export default function Image({ params }: { params: Promise<{ lang: string }> }) {
  return renderLocalizedOg(params, (t) => t.meta.og);
}
