// Konfigurator kanopi kaca: pilihan, estimasi harga, dan link desain.
// DRAFT: semua harga di bawah adalah CONTOH. Ganti dengan harga asli dari pemilik.
import { finishColors, labelOf, pickParam, priceRange, rupiah, sizeParam, type Option, type PriceLine } from "@/lib/configurators/shared";

export const kanopiPath = "/konfigurator/kanopi";

export type Support = "kabel" | "hollow" | "bracket";
export type KanopiGlass = "bening" | "riben" | "sandblast";
export type KanopiThickness = 10 | 12;
export type FrameColor = "hitam" | "putih" | "stainless";

export type KanopiConfig = {
  width: number; // cm, sepanjang dinding
  projection: number; // cm, tonjolan dari dinding
  height: number; // cm, tinggi pasang di dinding
  slope: number; // derajat kemiringan
  support: Support;
  glass: KanopiGlass;
  thickness: KanopiThickness;
  frame: FrameColor;
  gutter: boolean;
  install: boolean;
};

export const defaultKanopi: KanopiConfig = {
  width: 400,
  projection: 150,
  height: 280,
  slope: 8,
  support: "kabel",
  glass: "bening",
  thickness: 10,
  frame: "hitam",
  gutter: true,
  install: true,
};

export const kanopiLimits = {
  width: { min: 150, max: 800, step: 10 },
  projection: { min: 80, max: 250, step: 10 },
  height: { min: 220, max: 350, step: 10 },
  slope: { min: 3, max: 15, step: 1 },
};

export const supports: Option<Support>[] = [
  { value: "kabel", label: "Tarik stainless", desc: "Batang tarik ke dinding, terlihat ringan" },
  { value: "hollow", label: "Rangka hollow", desc: "Balok besi di bawah kaca, kokoh" },
  { value: "bracket", label: "Bracket sirip", desc: "Sirip segitiga dari dinding, minimalis" },
];

export const kanopiGlasses: Option<KanopiGlass>[] = [
  { value: "bening", label: "Bening", desc: "Terang, cahaya masuk penuh" },
  { value: "riben", label: "Riben", desc: "Lebih teduh, mengurangi silau" },
  { value: "sandblast", label: "Sandblast", desc: "Cahaya lembut, tidak tembus pandang" },
];

export const kanopiThicknesses: Option<KanopiThickness>[] = [
  { value: 10, label: "Laminated 10 mm", desc: "5 + 5 mm" },
  { value: 12, label: "Laminated 12 mm", desc: "6 + 6 mm, untuk bentang lebar" },
];

export const frameColors: Option<FrameColor>[] = [
  { value: "hitam", label: "Hitam doff", color: finishColors.hitam },
  { value: "putih", label: "Putih", color: finishColors.putih },
  { value: "stainless", label: "Stainless", color: finishColors.stainless },
];

// Panel kaca maksimal ±120 cm agar aman dan mudah dipasang
export const panelCount = (c: Pick<KanopiConfig, "width">) => Math.max(2, Math.ceil(c.width / 120));

export function kanopiWarnings(c: KanopiConfig) {
  const w: string[] = [];
  if (c.projection > 180 && c.thickness === 10) w.push("Untuk tonjolan di atas 180 cm, kami sarankan laminated 12 mm.");
  if (c.projection > 200 && c.support === "bracket") w.push("Bracket sirip paling cocok untuk tonjolan hingga 200 cm; pertimbangkan tarik stainless atau rangka hollow.");
  if (c.slope < 5) w.push("Kemiringan di bawah 5° membuat air hujan lambat mengalir; disarankan minimal 5°.");
  return w;
}

// ── Harga contoh ──
const GLASS_PER_M2: Record<KanopiThickness, number> = { 10: 950_000, 12: 1_200_000 };
const GLASS_EXTRA_PER_M2: Record<KanopiGlass, number> = { bening: 0, riben: 100_000, sandblast: 150_000 };
const SUPPORT_PER_M: Record<Support, number> = { kabel: 650_000, hollow: 550_000, bracket: 750_000 };
const FRAME_FACTOR: Record<FrameColor, number> = { hitam: 1, putih: 1, stainless: 1.2 };
const GUTTER_PER_M = 150_000;
const INSTALL_PER_M2 = 100_000;

export function kanopiEstimate(c: KanopiConfig) {
  const w = c.width / 100;
  const p = c.projection / 100 / Math.cos((c.slope * Math.PI) / 180);
  const area = w * p;
  const lines: PriceLine[] = [
    { label: `Kaca laminated ${c.thickness} mm, ${area.toFixed(2).replace(".", ",")} m² (${panelCount(c)} panel)`, value: area * (GLASS_PER_M2[c.thickness] + GLASS_EXTRA_PER_M2[c.glass]) },
    { label: `Rangka ${labelOf(supports, c.support).toLowerCase()}, ${labelOf(frameColors, c.frame).toLowerCase()}`, value: w * SUPPORT_PER_M[c.support] * FRAME_FACTOR[c.frame] },
  ];
  if (c.gutter) lines.push({ label: "Talang air", value: w * GUTTER_PER_M });
  if (c.install) lines.push({ label: "Pemasangan", value: area * INSTALL_PER_M2 });
  return { area, lines, ...priceRange(lines) };
}

export function kanopiToParams(c: KanopiConfig) {
  return new URLSearchParams({
    lebar: String(c.width),
    tonjolan: String(c.projection),
    tinggi: String(c.height),
    miring: String(c.slope),
    rangka: c.support,
    kaca: c.glass,
    tebal: String(c.thickness),
    warna: c.frame,
    talang: c.gutter ? "1" : "0",
    pasang: c.install ? "1" : "0",
  });
}

export function paramsToKanopi(p: URLSearchParams): KanopiConfig {
  const d = defaultKanopi;
  return {
    width: sizeParam(p.get("lebar"), kanopiLimits.width, d.width),
    projection: sizeParam(p.get("tonjolan"), kanopiLimits.projection, d.projection),
    height: sizeParam(p.get("tinggi"), kanopiLimits.height, d.height),
    slope: sizeParam(p.get("miring"), kanopiLimits.slope, d.slope),
    support: pickParam(p.get("rangka"), supports, d.support),
    glass: pickParam(p.get("kaca"), kanopiGlasses, d.glass),
    thickness: pickParam(p.get("tebal"), kanopiThicknesses, d.thickness),
    frame: pickParam(p.get("warna"), frameColors, d.frame),
    gutter: p.get("talang") !== "0",
    install: p.get("pasang") !== "0",
  };
}

export function kanopiSummary(c: KanopiConfig, link: string) {
  const e = kanopiEstimate(c);
  return [
    "Halo Iwan Sukses, saya ingin penawaran kanopi kaca dari konfigurator:",
    "",
    `Ukuran: ${c.width} × ${c.projection} cm (lebar × tonjolan), ${panelCount(c)} panel`,
    `Tinggi pasang: ${c.height} cm, kemiringan ${c.slope}°`,
    `Kaca: laminated ${c.thickness} mm, ${labelOf(kanopiGlasses, c.glass).toLowerCase()}`,
    `Rangka: ${labelOf(supports, c.support)}, ${labelOf(frameColors, c.frame).toLowerCase()}`,
    `Talang air: ${c.gutter ? "ya" : "tidak"}`,
    `Pemasangan: ${c.install ? "ya" : "tidak"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
    "",
    `Lihat desain 3D: ${link}`,
  ].join("\n");
}
