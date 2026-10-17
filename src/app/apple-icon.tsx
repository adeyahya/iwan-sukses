import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Ikon layar utama iOS: artwork app icon brand (ink, tanda putih, titik amber) sebagai PNG
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const icon = readFile(join(process.cwd(), "src/app/icon.svg"));

export default async function AppleIcon() {
  const svg = await icon;
  return new ImageResponse(
    <img src={`data:image/svg+xml;base64,${svg.toString("base64")}`} width={180} height={180} alt="" />,
    size,
  );
}
