import { ogSize, renderOg } from "@/lib/og";

export const alt = "Iwan Sukses — distributor kaca dan aluminium di Probolinggo dan Bali";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Distributor kaca · Probolinggo & Bali",
    title: "Kaca dan aluminium, dari lembaran sampai terpasang",
    footer: "CV Iwan Sukses Cemerlang",
  });
}
