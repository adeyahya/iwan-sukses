// Konfigurator kanopi kaca: pilihan, estimasi harga, dan link desain.
// Harga diatur di panel admin (/admin/harga); nilai di bawah hanya isi awal database.
import type { Lang } from "@/i18n/config";
import { decimal, finishColors, labelOf, pickParam, priceRange, rupiah, sizeParam, tr, type Option, type PriceLine } from "@/lib/configurators/shared";

export const kanopiPath = "/konfigurator/kanopi";

export type Support = "tiang" | "hollow" | "bracket";
export type BracketArm = "y" | "lengkung";
export type KanopiGlass = "bening" | "riben" | "sandblast";
export type KanopiThickness = 10 | 12;
export type FrameColor = "hitam" | "putih" | "stainless";

export type KanopiConfig = {
  width: number; // cm, sepanjang dinding
  projection: number; // cm, tonjolan dari dinding
  height: number; // cm, tinggi pasang di dinding
  slope: number; // derajat kemiringan
  support: Support;
  arm: BracketArm; // bentuk lengan tiang bercabang
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
  arm: "y",
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
  { value: "tiang", label: "Tiang + grid", desc: "Tiang di depan, rangka kotak-kotak di bawah kaca", en: { label: "Posts + grid", desc: "Posts at the front, a grid frame under the glass" } },
  { value: "hollow", label: "Hollow antar dinding", desc: "Balok hollow bertumpu di dua dinding, tanpa tiang", en: { label: "Wall-to-wall hollow", desc: "Hollow beams resting on two walls, no posts" } },
  { value: "bracket", label: "Tiang bercabang", desc: "Tiang dengan lengan Y atau lengkung menopang rangka", en: { label: "Branched posts", desc: "Posts with Y or curved arms holding the frame" } },
];

export const bracketArms: Option<BracketArm>[] = [
  { value: "y", label: "Lengan Y", desc: "Tiang bercabang dua ke balok depan", en: { label: "Y arm", desc: "Post splits in two to the front beam" } },
  { value: "lengkung", label: "Lengan lengkung", desc: "Tiang ganda dengan lengan melengkung", en: { label: "Curved arm", desc: "Double post with curved arms" } },
];

export const kanopiGlasses: Option<KanopiGlass>[] = [
  { value: "bening", label: "Bening", desc: "Terang, cahaya masuk penuh", en: { label: "Clear", desc: "Bright, full daylight" } },
  { value: "riben", label: "Riben", desc: "Lebih teduh, mengurangi silau", en: { label: "Tinted", desc: "More shade, less glare" } },
  { value: "sandblast", label: "Sandblast", desc: "Cahaya lembut, tidak tembus pandang", en: { label: "Sandblasted", desc: "Soft light, not see-through" } },
];

export const kanopiThicknesses: Option<KanopiThickness>[] = [
  { value: 10, label: "Laminated 10 mm", desc: "5 + 5 mm" },
  { value: 12, label: "Laminated 12 mm", desc: "6 + 6 mm, untuk bentang lebar", en: { label: "Laminated 12 mm", desc: "6 + 6 mm, for wide spans" } },
];

export const frameColors: Option<FrameColor>[] = [
  { value: "hitam", label: "Hitam doff", color: finishColors.hitam, en: { label: "Matte black" } },
  { value: "putih", label: "Putih", color: finishColors.putih, en: { label: "White" } },
  { value: "stainless", label: "Stainless", color: finishColors.stainless },
];

// Semua sistem memakai rangka grid hollow di bawah kaca, dibagi petak maksimal ±120 cm
// (satu panel kaca per petak). Sistem bertiang: kaca menjorok 30 cm di depan dan kedua sisi
// rangka, tiang berjarak maksimal ±3 m. Rangka hollow antar dinding: kaca pas di antara dinding.
export const kanopiOverhang = 30;
type Size = Pick<KanopiConfig, "width" | "projection" | "support">;
export const hasColumns = (c: Pick<KanopiConfig, "support">) => c.support !== "hollow";
const frameWidth = (c: Size) => (hasColumns(c) ? Math.max(60, c.width - 2 * kanopiOverhang) : c.width);
const frameDepth = (c: Size) => (hasColumns(c) ? Math.max(50, c.projection - kanopiOverhang) : c.projection);
export const columnCount = (c: Size) => (hasColumns(c) ? Math.ceil(frameWidth(c) / 300) + 1 : 0);

/** Susunan petak rangka (= panel kaca): kolom sepanjang lebar × baris sepanjang tonjolan */
export function panelGrid(c: Size) {
  return { cols: Math.max(1, Math.ceil(frameWidth(c) / 120)), rows: Math.max(1, Math.ceil(frameDepth(c) / 120)) };
}

export const panelCount = (c: Pick<KanopiConfig, "width" | "projection" | "support">) => {
  const g = panelGrid(c);
  return g.cols * g.rows;
};

export function kanopiWarnings(c: KanopiConfig, lang: Lang = "id") {
  const w: string[] = [];
  if (c.support === "hollow")
    w.push(tr(lang, "Rangka hollow antar dinding butuh dua dinding kokoh di kiri dan kanan sepanjang tonjolan.", "A wall-to-wall hollow frame needs two solid walls on the left and right along the full projection."));
  if (c.support === "hollow" && c.width > 400)
    w.push(tr(lang, "Bentang antar dinding di atas 400 cm perlu balok lebih besar; kami pastikan saat survei.", "Spans over 400 cm between walls need larger beams; we confirm this during the site survey."));
  if (c.slope < 5)
    w.push(tr(lang, "Kemiringan di bawah 5° membuat air hujan lambat mengalir; disarankan minimal 5°.", "Below 5°, rainwater drains slowly; we recommend at least 5°."));
  return w;
}

// ── Harga ──
export type KanopiPrices = {
  glassPerM2: Record<KanopiThickness, number>;
  glassExtraPerM2: Record<KanopiGlass, number>;
  gridPerM2: number;
  columnPrice: number;
  bracketColumnPrice: number;
  frameFactor: Record<FrameColor, number>;
  gutterPerM: number;
  installPerM2: number;
};

export const defaultKanopiPrices: KanopiPrices = {
  glassPerM2: { 10: 950_000, 12: 1_200_000 },
  glassExtraPerM2: { bening: 0, riben: 100_000, sandblast: 150_000 },
  gridPerM2: 650_000,
  columnPrice: 1_500_000,
  bracketColumnPrice: 2_250_000,
  frameFactor: { hitam: 1, putih: 1, stainless: 1.2 },
  gutterPerM: 150_000,
  installPerM2: 100_000,
};

export function kanopiEstimate(c: KanopiConfig, prices: KanopiPrices, lang: Lang = "id") {
  const { glassPerM2, glassExtraPerM2, frameFactor } = prices;
  const w = c.width / 100;
  const p = c.projection / 100 / Math.cos((c.slope * Math.PI) / 180);
  const area = w * p;
  const support = labelOf(supports, c.support, lang).toLowerCase();
  const color = labelOf(frameColors, c.frame, lang).toLowerCase();
  const m2 = `${decimal(area, 2, lang)} m²`;
  const panels = panelCount(c);
  const lines: PriceLine[] = [
    {
      label: tr(lang, `Kaca laminated ${c.thickness} mm, ${m2} (${panels} panel)`, `${c.thickness} mm laminated glass, ${m2} (${panels} ${panels === 1 ? "panel" : "panels"})`),
      value: area * (glassPerM2[c.thickness] + glassExtraPerM2[c.glass]),
    },
  ];
  lines.push({ label: tr(lang, `Rangka ${support}, ${color}`, `Frame, ${support}, ${color}`), value: area * prices.gridPerM2 * frameFactor[c.frame] });
  const n = columnCount(c);
  if (c.support === "tiang") lines.push({ label: tr(lang, `Tiang penyangga (${n} batang)`, `Support posts (${n})`), value: n * prices.columnPrice * frameFactor[c.frame] });
  if (c.support === "bracket")
    lines.push({
      label: tr(lang, `Tiang ${labelOf(bracketArms, c.arm).toLowerCase()} (${n} batang)`, `Posts with ${labelOf(bracketArms, c.arm, lang).toLowerCase()} (${n})`),
      value: n * prices.bracketColumnPrice * frameFactor[c.frame],
    });
  if (c.gutter) lines.push({ label: tr(lang, "Talang air", "Rain gutter"), value: w * prices.gutterPerM });
  if (c.install) lines.push({ label: tr(lang, "Pemasangan", "Installation"), value: area * prices.installPerM2 });
  return { area, lines, ...priceRange(lines) };
}

export function kanopiToParams(c: KanopiConfig) {
  return new URLSearchParams({
    lebar: String(c.width),
    tonjolan: String(c.projection),
    tinggi: String(c.height),
    miring: String(c.slope),
    rangka: c.support,
    lengan: c.arm,
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
    arm: pickParam(p.get("lengan"), bracketArms, d.arm),
    glass: pickParam(p.get("kaca"), kanopiGlasses, d.glass),
    thickness: pickParam(p.get("tebal"), kanopiThicknesses, d.thickness),
    frame: pickParam(p.get("warna"), frameColors, d.frame),
    gutter: p.get("talang") !== "0",
    install: p.get("pasang") !== "0",
  };
}

/** Keterangan penopang: jumlah tiang atau tumpuan dinding */
export function supportNote(c: KanopiConfig, lang: Lang = "id") {
  if (c.support === "hollow") return tr(lang, "bertumpu di dua dinding", "resting on two walls");
  const count = columnCount(c);
  if (lang === "en") {
    const n = `${count} ${count === 1 ? "post" : "posts"}`;
    return c.support === "bracket" ? `${n} with ${labelOf(bracketArms, c.arm, lang).toLowerCase()}s` : n;
  }
  const n = `${count} tiang`;
  return c.support === "bracket" ? `${n} ${labelOf(bracketArms, c.arm).toLowerCase()}` : n;
}

export function kanopiSummary(c: KanopiConfig, link: string, prices: KanopiPrices) {
  const e = kanopiEstimate(c, prices);
  return [
    "Halo Iwan Sukses, saya ingin penawaran kanopi kaca dari konfigurator:",
    "",
    `Ukuran: ${c.width} × ${c.projection} cm (lebar × tonjolan), ${panelCount(c)} panel`,
    `Tinggi pasang: ${c.height} cm, kemiringan ${c.slope}°`,
    `Kaca: laminated ${c.thickness} mm, ${labelOf(kanopiGlasses, c.glass).toLowerCase()}`,
    `Rangka: ${labelOf(supports, c.support)}, ${labelOf(frameColors, c.frame).toLowerCase()}, ${supportNote(c)}`,
    `Talang air: ${c.gutter ? "ya" : "tidak"}`,
    `Pemasangan: ${c.install ? "ya" : "tidak"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
    "",
    `Lihat desain 3D: ${link}`,
  ].join("\n");
}
