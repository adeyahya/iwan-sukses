import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Gambar berbagi (Open Graph) bergaya brand: latar ink, kisi rhombus isometrik,
// logo signal, judul Poppins, dan rak lembaran kaca dengan satu spark amber.
export const ogSize = { width: 1200, height: 630 };

// Path ditulis statis agar bundler hanya menyertakan file ini, bukan seluruh proyek
const assets = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Poppins-Bold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Poppins-Medium.ttf")),
  readFile(join(process.cwd(), "public/logo/lockup-horizontal_signal.svg")),
]);

const svgData = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const lattice = svgData(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="p" width="51.96" height="30" patternUnits="userSpaceOnUse"><path d="M25.98 0 51.96 15 25.98 30 0 15Z" fill="none" stroke="#2B2D33" stroke-width="1.5"/></pattern></defs><rect width="1200" height="630" fill="url(#p)"/></svg>`,
);

// Lima lembaran kaca berjajar miring, seperti animasi hero
const rack = svgData(
  `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="360" viewBox="0 0 420 360">${[0, 1, 2, 3, 4]
    .map((i) => {
      const x = 20 + i * 68;
      const y = 40 - i * 6;
      return `<path d="M${x} ${y + 30} L${x + 120} ${y} L${x + 120} ${y + 250} L${x} ${y + 280} Z" fill="rgba(191,230,214,0.06)" stroke="#CDEEE2" stroke-opacity="0.85" stroke-width="2"/>`;
    })
    .join("")}<path d="M236 150 L276 127 L316 150 L276 173 Z" fill="#FFB000"/></svg>`,
);

export async function renderOg({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const [bold, medium, logo] = await assets;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A0A0B", position: "relative", fontFamily: "Poppins" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lattice} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rack} width={420} height={360} alt="" style={{ position: "absolute", right: 70, top: 135 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 760 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgData(logo.toString())} height={64} width={233} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#A9AEB6", fontSize: 22, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 20 }}>
              {eyebrow}
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 62, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{title}</div>
          </div>
          <div style={{ display: "flex", color: "#A9AEB6", fontSize: 24, fontWeight: 500 }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Poppins", data: bold, weight: 700, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
