// Konfigurator railing kaca: pilihan, estimasi harga, dan link desain.
// Mengikuti pekerjaan nyata kami: tiang bulat stainless dengan jepit kaca (tangga) atau dudukan kaca (mezanin, balkon).
// Harga diatur di panel admin (/admin/harga); nilai di bawah hanya isi awal database.
import { finishColors, labelOf, pickParam, priceRange, rupiah, sizeParam, type Option, type PriceLine } from "@/lib/configurators/shared";

export const railingPath = "/konfigurator/railing";

export type RailingLayout = "lurus" | "l" | "tangga";
export type RailingSystem = "jepit" | "dudukan";
export type RailingGlass = "bening" | "sandblast";
export type RailingThickness = 10 | 12;
export type PostFinish = "stainless" | "hitam";
export type Handrail = "stainless" | "hitam" | "kayu";

export type RailingConfig = {
  layout: RailingLayout;
  length: number; // cm, sisi utama (lurus/L) atau panjang datar tangga
  length2: number; // cm, sisi kedua untuk bentuk L
  height: number; // cm, dari lantai/anak tangga ke atas handrail
  system: RailingSystem;
  glass: RailingGlass;
  thickness: RailingThickness;
  post: PostFinish;
  handrail: Handrail;
  install: boolean;
};

export const defaultRailing: RailingConfig = {
  layout: "lurus",
  length: 400,
  length2: 200,
  height: 100,
  system: "dudukan",
  glass: "bening",
  thickness: 10,
  post: "stainless",
  handrail: "stainless",
  install: true,
};

export const railingLimits = {
  length: { min: 100, max: 1500, step: 10 },
  length2: { min: 50, max: 800, step: 10 },
  height: { min: 90, max: 120, step: 5 },
};

// Ukuran anak tangga standar untuk tampilan dan panjang miring
export const STAIR_RISE = 17;
export const STAIR_GOING = 28;
// Tiang berjarak maksimal ±100 cm, seperti di lapangan
export const POST_SPACING = 100;

export const railingLayouts: Option<RailingLayout>[] = [
  { value: "lurus", label: "Lurus", desc: "Balkon, mezanin, tepi void" },
  { value: "l", label: "Sudut L", desc: "Dua sisi bertemu di sudut" },
  { value: "tangga", label: "Tangga", desc: "Kaca miring mengikuti anak tangga" },
];

export const railingSystems: Option<RailingSystem>[] = [
  { value: "dudukan", label: "Tiang + dudukan kaca", desc: "Kaca menerus di sisi tiang, dijepit dudukan" },
  { value: "jepit", label: "Tiang + jepit kaca", desc: "Kaca di antara tiang, dijepit di kedua sisi" },
];

export const railingGlasses: Option<RailingGlass>[] = [
  { value: "bening", label: "Bening", desc: "Pandangan lepas, paling umum" },
  { value: "sandblast", label: "Sandblast", desc: "Buram, lebih privat" },
];

export const railingThicknesses: Option<RailingThickness>[] = [
  { value: 10, label: "Tempered 10 mm", desc: "Standar rumah" },
  { value: 12, label: "Tempered 12 mm", desc: "Lebih kokoh, area ramai" },
];

export const postFinishes: Option<PostFinish>[] = [
  { value: "stainless", label: "Stainless", color: finishColors.stainless },
  { value: "hitam", label: "Hitam doff", color: finishColors.hitam },
];

export const handrails: Option<Handrail>[] = [
  { value: "stainless", label: "Pipa stainless", desc: "Bulat Ø 2 inci", color: finishColors.stainless },
  { value: "hitam", label: "Pipa hitam", desc: "Bulat Ø 2 inci", color: finishColors.hitam },
  { value: "kayu", label: "Kayu", desc: "Pegangan pipih, hangat", color: "#7A4A2A" },
];

/** Sisi-sisi railing (cm, panjang datar) */
export const railingRuns = (c: Pick<RailingConfig, "layout" | "length" | "length2">) => (c.layout === "l" ? [c.length, c.length2] : [c.length]);

/** Panjang sebenarnya: tangga diukur sepanjang kemiringan */
export function railingLength(c: Pick<RailingConfig, "layout" | "length" | "length2">) {
  const flat = railingRuns(c).reduce((s, l) => s + l, 0);
  return c.layout === "tangga" ? flat * Math.hypot(1, STAIR_RISE / STAIR_GOING) : flat;
}

/** Jumlah bentang (panel) per sisi dan jumlah tiang; sudut L berbagi satu tiang */
export function railingSpans(c: Pick<RailingConfig, "layout" | "length" | "length2">) {
  const spans = railingRuns(c).map((l) => Math.max(1, Math.ceil(l / POST_SPACING)));
  const total = spans.reduce((s, n) => s + n, 0);
  return { spans, panels: total, posts: total + spans.length - (c.layout === "l" ? 1 : 0) };
}

export function railingWarnings(c: RailingConfig) {
  const w: string[] = [];
  if (c.layout !== "tangga" && c.height < 100) w.push("Untuk balkon dan mezanin, tinggi railing minimal 100 cm lebih aman.");
  if (c.system === "jepit" && c.thickness === 12 && c.handrail === "kayu") w.push("Handrail kayu paling pas dengan kaca 10 mm; untuk 12 mm kami sarankan pipa.");
  return w;
}

// ── Harga ──
export type RailingPrices = {
  glassPerM2: Record<RailingThickness, number>;
  glassExtraPerM2: Record<RailingGlass, number>;
  postPrice: Record<RailingSystem, number>;
  postFactor: Record<PostFinish, number>;
  handrailPerM: Record<Handrail, number>;
  stairPerM: number;
  installPerM: number;
};

export const defaultRailingPrices: RailingPrices = {
  glassPerM2: { 10: 650_000, 12: 850_000 },
  glassExtraPerM2: { bening: 0, sandblast: 100_000 },
  postPrice: { dudukan: 550_000, jepit: 450_000 },
  postFactor: { stainless: 1, hitam: 1.1 },
  handrailPerM: { stainless: 350_000, hitam: 300_000, kayu: 400_000 },
  stairPerM: 100_000,
  installPerM: 150_000,
};

// Kaca dari ±10 cm di atas lantai sampai ±10 cm di bawah handrail
const glassHeight = (c: Pick<RailingConfig, "height">) => Math.max(0.5, c.height / 100 - 0.2);

export function railingEstimate(c: RailingConfig, prices: RailingPrices) {
  const L = railingLength(c) / 100;
  const { panels, posts } = railingSpans(c);
  const area = L * glassHeight(c);
  const lines: PriceLine[] = [
    {
      label: `Kaca tempered ${c.thickness} mm ${labelOf(railingGlasses, c.glass).toLowerCase()}, ${area.toFixed(2).replace(".", ",")} m² (${panels} panel)`,
      value: area * (prices.glassPerM2[c.thickness] + prices.glassExtraPerM2[c.glass]),
    },
    {
      label: `${posts} ${labelOf(railingSystems, c.system).toLowerCase()}, ${labelOf(postFinishes, c.post).toLowerCase()}`,
      value: posts * prices.postPrice[c.system] * prices.postFactor[c.post],
    },
    { label: `Handrail ${labelOf(handrails, c.handrail).toLowerCase()}, ${L.toFixed(1).replace(".", ",")} m`, value: L * prices.handrailPerM[c.handrail] },
  ];
  if (c.layout === "tangga") lines.push({ label: "Potong miring kaca tangga", value: L * prices.stairPerM });
  if (c.install) lines.push({ label: "Pemasangan", value: L * prices.installPerM });
  return { area, length: L, lines, ...priceRange(lines) };
}

export function railingToParams(c: RailingConfig) {
  const p = new URLSearchParams({
    bentuk: c.layout,
    panjang: String(c.length),
    tinggi: String(c.height),
    sistem: c.system,
    kaca: c.glass,
    tebal: String(c.thickness),
    tiang: c.post,
    handrail: c.handrail,
    pasang: c.install ? "1" : "0",
  });
  if (c.layout === "l") p.set("panjang2", String(c.length2));
  return p;
}

export function paramsToRailing(p: URLSearchParams): RailingConfig {
  const d = defaultRailing;
  return {
    layout: pickParam(p.get("bentuk"), railingLayouts, d.layout),
    length: sizeParam(p.get("panjang"), railingLimits.length, d.length),
    length2: sizeParam(p.get("panjang2"), railingLimits.length2, d.length2),
    height: sizeParam(p.get("tinggi"), railingLimits.height, d.height),
    system: pickParam(p.get("sistem"), railingSystems, d.system),
    glass: pickParam(p.get("kaca"), railingGlasses, d.glass),
    thickness: pickParam(p.get("tebal"), railingThicknesses, d.thickness),
    post: pickParam(p.get("tiang"), postFinishes, d.post),
    handrail: pickParam(p.get("handrail"), handrails, d.handrail),
    install: p.get("pasang") !== "0",
  };
}

export function railingSummary(c: RailingConfig, link: string, prices: RailingPrices) {
  const e = railingEstimate(c, prices);
  const { panels, posts } = railingSpans(c);
  const size =
    c.layout === "l"
      ? `${c.length} + ${c.length2} cm (sudut L)`
      : c.layout === "tangga"
        ? `${c.length} cm datar, ±${Math.round(railingLength(c))} cm miring (tangga)`
        : `${c.length} cm (lurus)`;
  return [
    "Halo Iwan Sukses, saya ingin penawaran railing kaca dari konfigurator:",
    "",
    `Panjang: ${size}, ${panels} panel, ${posts} tiang`,
    `Tinggi: ${c.height} cm`,
    `Sistem: ${labelOf(railingSystems, c.system)}, tiang ${labelOf(postFinishes, c.post).toLowerCase()}`,
    `Kaca: tempered ${c.thickness} mm, ${labelOf(railingGlasses, c.glass).toLowerCase()}`,
    `Handrail: ${labelOf(handrails, c.handrail).toLowerCase()}`,
    `Pemasangan: ${c.install ? "ya" : "tidak"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
    "",
    `Lihat desain 3D: ${link}`,
  ].join("\n");
}
