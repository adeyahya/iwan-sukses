// Konfigurator kanopi kaca: pilihan, estimasi harga, dan link desain.
// Harga diatur di panel admin (/admin/harga); nilai di bawah hanya isi awal database.
import { finishColors, labelOf, pickParam, priceRange, rupiah, sizeParam, type Option, type PriceLine } from "@/lib/configurators/shared";

export const kanopiPath = "/konfigurator/kanopi";

export type Support = "tiang" | "hollow" | "bracket";
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
  width: 600,
  projection: 400,
  height: 300,
  slope: 5,
  support: "tiang",
  glass: "bening",
  thickness: 10,
  frame: "hitam",
  gutter: true,
  install: true,
};

export const kanopiLimits = {
  width: { min: 150, max: 800, step: 10 },
  projection: { min: 80, max: 500, step: 10 },
  height: { min: 220, max: 350, step: 10 },
  slope: { min: 3, max: 15, step: 1 },
};

export const supports: Option<Support>[] = [
  { value: "tiang", label: "Tiang + grid", desc: "Tiang di depan, rangka kotak-kotak di bawah kaca" },
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

// Rangka tiang + grid: kaca menjorok 30 cm di depan dan kedua sisi rangka,
// rangka dibagi petak maksimal ±120 cm (satu panel kaca per petak), tiang berjarak maksimal ±3 m
export const kanopiOverhang = 30;
const frameWidth = (c: Pick<KanopiConfig, "width">) => Math.max(60, c.width - 2 * kanopiOverhang);
const frameDepth = (c: Pick<KanopiConfig, "projection">) => Math.max(50, c.projection - kanopiOverhang);
export const columnCount = (c: Pick<KanopiConfig, "width">) => Math.ceil(frameWidth(c) / 300) + 1;

/** Susunan panel kaca: kolom sepanjang lebar × baris sepanjang tonjolan.
 *  Sistem tanpa tiang memakai panel utuh sepanjang tonjolan, maksimal ±120 cm lebarnya. */
export function panelGrid(c: Pick<KanopiConfig, "width" | "projection" | "support">) {
  if (c.support !== "tiang") return { cols: Math.max(2, Math.ceil(c.width / 120)), rows: 1 };
  return { cols: Math.max(1, Math.ceil(frameWidth(c) / 120)), rows: Math.max(1, Math.ceil(frameDepth(c) / 120)) };
}

export const panelCount = (c: Pick<KanopiConfig, "width" | "projection" | "support">) => {
  const g = panelGrid(c);
  return g.cols * g.rows;
};

export function kanopiWarnings(c: KanopiConfig) {
  const w: string[] = [];
  if (c.projection > 250 && c.support !== "tiang") w.push("Tonjolan di atas 250 cm perlu tiang penyangga; pilih rangka tiang + grid.");
  if (c.projection > 180 && c.thickness === 10 && c.support !== "tiang") w.push("Untuk tonjolan di atas 180 cm, kami sarankan laminated 12 mm.");
  if (c.projection > 200 && c.support === "bracket") w.push("Bracket sirip paling cocok untuk tonjolan hingga 200 cm; pertimbangkan tiang + grid atau rangka hollow.");
  if (c.slope < 5) w.push("Kemiringan di bawah 5° membuat air hujan lambat mengalir; disarankan minimal 5°.");
  return w;
}

// ── Harga ──
export type KanopiPrices = {
  glassPerM2: Record<KanopiThickness, number>;
  glassExtraPerM2: Record<KanopiGlass, number>;
  supportPerM: Record<Exclude<Support, "tiang">, number>;
  gridPerM2: number;
  columnPrice: number;
  frameFactor: Record<FrameColor, number>;
  gutterPerM: number;
  installPerM2: number;
};

export const defaultKanopiPrices: KanopiPrices = {
  glassPerM2: { 10: 950_000, 12: 1_200_000 },
  glassExtraPerM2: { bening: 0, riben: 100_000, sandblast: 150_000 },
  supportPerM: { hollow: 550_000, bracket: 750_000 },
  gridPerM2: 650_000,
  columnPrice: 1_500_000,
  frameFactor: { hitam: 1, putih: 1, stainless: 1.2 },
  gutterPerM: 150_000,
  installPerM2: 100_000,
};

export function kanopiEstimate(c: KanopiConfig, prices: KanopiPrices) {
  const { glassPerM2, glassExtraPerM2, supportPerM, frameFactor } = prices;
  const w = c.width / 100;
  const p = c.projection / 100 / Math.cos((c.slope * Math.PI) / 180);
  const area = w * p;
  const frameLabel = `Rangka ${labelOf(supports, c.support).toLowerCase()}, ${labelOf(frameColors, c.frame).toLowerCase()}`;
  const lines: PriceLine[] = [
    { label: `Kaca laminated ${c.thickness} mm, ${area.toFixed(2).replace(".", ",")} m² (${panelCount(c)} panel)`, value: area * (glassPerM2[c.thickness] + glassExtraPerM2[c.glass]) },
  ];
  if (c.support === "tiang") {
    lines.push(
      { label: frameLabel, value: area * prices.gridPerM2 * frameFactor[c.frame] },
      { label: `Tiang penyangga (${columnCount(c)} batang)`, value: columnCount(c) * prices.columnPrice * frameFactor[c.frame] },
    );
  } else {
    lines.push({ label: frameLabel, value: w * supportPerM[c.support] * frameFactor[c.frame] });
  }
  if (c.gutter) lines.push({ label: "Talang air", value: w * prices.gutterPerM });
  if (c.install) lines.push({ label: "Pemasangan", value: area * prices.installPerM2 });
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

export function kanopiSummary(c: KanopiConfig, link: string, prices: KanopiPrices) {
  const e = kanopiEstimate(c, prices);
  return [
    "Halo Iwan Sukses, saya ingin penawaran kanopi kaca dari konfigurator:",
    "",
    `Ukuran: ${c.width} × ${c.projection} cm (lebar × tonjolan), ${panelCount(c)} panel`,
    `Tinggi pasang: ${c.height} cm, kemiringan ${c.slope}°`,
    `Kaca: laminated ${c.thickness} mm, ${labelOf(kanopiGlasses, c.glass).toLowerCase()}`,
    `Rangka: ${labelOf(supports, c.support)}, ${labelOf(frameColors, c.frame).toLowerCase()}${c.support === "tiang" ? `, ${columnCount(c)} tiang` : ""}`,
    `Talang air: ${c.gutter ? "ya" : "tidak"}`,
    `Pemasangan: ${c.install ? "ya" : "tidak"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
    "",
    `Lihat desain 3D: ${link}`,
  ].join("\n");
}
