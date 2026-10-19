import { ogSize, renderOg } from "@/lib/og";

export const alt = "Konfigurator railing kaca 3D dari Iwan Sukses";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Konfigurator 3D",
    title: "Rancang railing kaca untuk balkon dan tangga",
    footer: "Atur bentuk, panjang, tiang, handrail, dan kaca",
  });
}
