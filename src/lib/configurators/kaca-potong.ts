// Konfigurator kaca potong custom: bentuk, ukuran, jenis, tebal, finishing, lubang, jumlah.
// Harga diatur di panel admin (/admin/harga); nilai di bawah hanya isi awal database.
import type { Lang } from "@/i18n/config";
import { decimal, labelOf, pickParam, rupiah, sizeParam, tr, type Option, type PriceLine } from "@/lib/configurators/shared";

export const kacaPotongPath = "/konfigurator/kaca-potong";

export type CutShape = "persegi" | "tumpul" | "bulat";
export type CutGlass = "bening" | "riben" | "es" | "cermin" | "tempered";
export type CutEdge = "potong" | "poles" | "bevel";

export type CutConfig = {
  shape: CutShape;
  length: number; // cm
  width: number; // cm
  glass: CutGlass;
  thickness: number; // mm
  edge: CutEdge;
  holes: 0 | 2 | 4;
  qty: number;
};

export const defaultCut: CutConfig = {
  shape: "tumpul",
  length: 120,
  width: 60,
  glass: "tempered",
  thickness: 8,
  edge: "poles",
  holes: 0,
  qty: 1,
};

// Lembaran standar 183 × 244 cm
export const cutLimits = {
  length: { min: 10, max: 244, step: 1 },
  width: { min: 10, max: 183, step: 1 },
  qty: { min: 1, max: 50, step: 1 },
};

export const cutShapes: Option<CutShape>[] = [
  { value: "persegi", label: "Persegi", desc: "Sudut siku", en: { label: "Rectangle", desc: "Square corners" } },
  { value: "tumpul", label: "Sudut tumpul", desc: "Radius 3 cm, lebih aman", en: { label: "Rounded corners", desc: "3 cm radius, safer" } },
  { value: "bulat", label: "Bulat / oval", desc: "Lingkaran bila ukuran sama", en: { label: "Round / oval", desc: "A circle when both sides match" } },
];

export const cutGlasses: Option<CutGlass>[] = [
  { value: "bening", label: "Bening (float)", desc: "Jendela, rak, bingkai", en: { label: "Clear (float)", desc: "Windows, shelves, frames" } },
  { value: "tempered", label: "Tempered bening", desc: "5× lebih kuat, untuk meja & pintu", en: { label: "Clear tempered", desc: "5× stronger, for tables & doors" } },
  { value: "riben", label: "Riben", desc: "Gelap, mengurangi silau", en: { label: "Tinted", desc: "Dark, reduces glare" } },
  { value: "es", label: "Es / sandblast", desc: "Buram untuk privasi", en: { label: "Frosted / sandblasted", desc: "Opaque for privacy" } },
  { value: "cermin", label: "Cermin", desc: "Dinding, lemari, salon", en: { label: "Mirror", desc: "Walls, wardrobes, salons" } },
];

// Tebal yang tersedia per jenis kaca (mm)
export const thicknessByGlass: Record<CutGlass, number[]> = {
  bening: [3, 5, 6, 8, 10, 12],
  tempered: [5, 6, 8, 10, 12],
  riben: [5, 6, 8],
  es: [5, 6, 8],
  cermin: [3, 5],
};

export const cutEdges: Option<CutEdge>[] = [
  { value: "potong", label: "Potong saja", desc: "Tepi kasar, untuk dibingkai", en: { label: "Cut only", desc: "Raw edge, for framing" } },
  { value: "poles", label: "Poles", desc: "Tepi halus mengkilap, aman disentuh", en: { label: "Polished", desc: "Smooth glossy edge, safe to touch" } },
  { value: "bevel", label: "Bevel 1 cm", desc: "Tepi miring dekoratif", en: { label: "1 cm bevel", desc: "Decorative angled edge" } },
];

export const holeOptions: Option<0 | 2 | 4>[] = [
  { value: 0, label: "Tanpa lubang", en: { label: "No holes" } },
  { value: 2, label: "2 lubang", en: { label: "2 holes" } },
  { value: 4, label: "4 lubang", en: { label: "4 holes" } },
];

export const presets: { label: string; en: string; config: Partial<CutConfig> }[] = [
  { label: "Kaca meja", en: "Table top", config: { shape: "tumpul", length: 120, width: 60, glass: "tempered", thickness: 8, edge: "poles", holes: 0 } },
  { label: "Rak dinding", en: "Wall shelf", config: { shape: "persegi", length: 80, width: 25, glass: "bening", thickness: 6, edge: "poles", holes: 0 } },
  { label: "Cermin dinding", en: "Wall mirror", config: { shape: "persegi", length: 90, width: 60, glass: "cermin", thickness: 5, edge: "bevel", holes: 4 } },
  { label: "Jendela", en: "Window", config: { shape: "persegi", length: 100, width: 60, glass: "bening", thickness: 5, edge: "potong", holes: 0 } },
];

// Menyesuaikan pilihan yang tidak lagi valid setelah jenis kaca/bentuk berubah
export function normalizeCut(c: CutConfig): CutConfig {
  const allowed = thicknessByGlass[c.glass];
  const thickness = allowed.includes(c.thickness) ? c.thickness : allowed.reduce((a, b) => (Math.abs(b - c.thickness) < Math.abs(a - c.thickness) ? b : a));
  const edge = c.edge === "bevel" && thickness < 5 ? "poles" : c.edge;
  const holes = c.shape === "bulat" ? 0 : c.holes;
  return { ...c, thickness, edge, holes };
}

export function cutWarnings(c: CutConfig, lang: Lang = "id") {
  const w: string[] = [];
  if (c.thickness <= 3 && Math.max(c.length, c.width) > 120)
    w.push(tr(lang, "Kaca 3 mm di atas 120 cm mudah pecah; kami sarankan minimal 5 mm.", "3 mm glass over 120 cm breaks easily; we recommend at least 5 mm."));
  if (c.glass === "tempered")
    w.push(tr(lang, "Kaca tempered tidak bisa dipotong ulang. Proses produksi 3–5 hari kerja.", "Tempered glass cannot be re-cut. Production takes 3–5 working days."));
  if (c.glass !== "tempered" && c.thickness >= 8 && c.edge === "potong")
    w.push(tr(lang, "Untuk kaca tebal yang sering disentuh, tepi poles lebih aman.", "For thick glass that is touched often, a polished edge is safer."));
  return w;
}

// ── Harga ──
export type CutPrices = {
  pricePerM2: Record<CutGlass, Record<string, number>>; // per tebal (mm)
  edgePerM: Record<CutEdge, number>;
  hole: number;
  minArea: number; // m², luas minimum yang dihitung
  roundSurcharge: number; // faktor potong bulat/oval
};

export const defaultCutPrices: CutPrices = {
  pricePerM2: {
    bening: { 3: 110_000, 5: 165_000, 6: 200_000, 8: 290_000, 10: 380_000, 12: 480_000 },
    tempered: { 5: 420_000, 6: 480_000, 8: 600_000, 10: 750_000, 12: 950_000 },
    riben: { 5: 210_000, 6: 250_000, 8: 340_000 },
    es: { 5: 240_000, 6: 280_000, 8: 370_000 },
    cermin: { 3: 180_000, 5: 260_000 },
  },
  edgePerM: { potong: 0, poles: 15_000, bevel: 45_000 },
  hole: 10_000,
  minArea: 0.1,
  roundSurcharge: 1.2,
};

export function cutArea(c: CutConfig) {
  const l = c.length / 100;
  const w = c.width / 100;
  return c.shape === "bulat" ? (Math.PI * l * w) / 4 : l * w;
}

export function cutPerimeter(c: CutConfig) {
  const a = c.length / 200;
  const b = c.width / 200;
  // Ramanujan untuk elips; persegi panjang biasa untuk lainnya
  return c.shape === "bulat" ? Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))) : 2 * (a + b) * 2;
}

export function cutEstimate(c: CutConfig, prices: CutPrices, lang: Lang = "id") {
  const area = cutArea(c);
  const billed = Math.max(area, prices.minArea);
  const glass = billed * (prices.pricePerM2[c.glass][c.thickness] ?? 0) * (c.shape === "bulat" ? prices.roundSurcharge : 1);
  const lines: PriceLine[] = [
    { label: `${labelOf(cutGlasses, c.glass, lang)} ${c.thickness} mm, ${decimal(billed, 2, lang)} m²`, value: glass },
  ];
  if (prices.edgePerM[c.edge]) {
    const m = `${decimal(cutPerimeter(c), 2, lang)} m`;
    lines.push({ label: `${labelOf(cutEdges, c.edge, lang)}, ${tr(lang, `keliling ${m}`, `${m} perimeter`)}`, value: cutPerimeter(c) * prices.edgePerM[c.edge] });
  }
  if (c.holes) lines.push({ label: labelOf(holeOptions, c.holes, lang), value: c.holes * prices.hole });
  const perPiece = Math.round(lines.reduce((s, l) => s + l.value, 0) / 1000) * 1000;
  return { area, lines, perPiece, total: perPiece * c.qty };
}

export function cutToParams(c: CutConfig) {
  return new URLSearchParams({
    bentuk: c.shape,
    panjang: String(c.length),
    lebar: String(c.width),
    kaca: c.glass,
    tebal: String(c.thickness),
    tepi: c.edge,
    lubang: String(c.holes),
    jumlah: String(c.qty),
  });
}

export function paramsToCut(p: URLSearchParams): CutConfig {
  const d = defaultCut;
  const glass = pickParam(p.get("kaca"), cutGlasses, d.glass);
  return normalizeCut({
    shape: pickParam(p.get("bentuk"), cutShapes, d.shape),
    length: sizeParam(p.get("panjang"), cutLimits.length, d.length),
    width: sizeParam(p.get("lebar"), cutLimits.width, d.width),
    glass,
    thickness: Number(p.get("tebal")) || d.thickness,
    edge: pickParam(p.get("tepi"), cutEdges, d.edge),
    holes: pickParam(p.get("lubang"), holeOptions, d.holes),
    qty: sizeParam(p.get("jumlah"), cutLimits.qty, d.qty),
  });
}

export function cutSummary(c: CutConfig, link: string, prices: CutPrices) {
  const e = cutEstimate(c, prices);
  return [
    "Halo Iwan Sukses, saya ingin pesan kaca potong:",
    "",
    `Bentuk: ${labelOf(cutShapes, c.shape)}`,
    `Ukuran: ${c.length} × ${c.width} cm`,
    `Kaca: ${labelOf(cutGlasses, c.glass)} ${c.thickness} mm`,
    `Tepi: ${labelOf(cutEdges, c.edge)}`,
    `Lubang: ${c.holes || "tidak ada"}`,
    `Jumlah: ${c.qty} lembar`,
    `Estimasi di situs: ${rupiah(e.perPiece)} per lembar, total ${rupiah(e.total)}`,
    "",
    `Lihat desain: ${link}`,
  ].join("\n");
}
