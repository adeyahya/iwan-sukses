// Konfigurator kaca potong custom: bentuk, ukuran, jenis, tebal, finishing, lubang, jumlah.
// Harga diatur di panel admin (/admin/harga); nilai di bawah hanya isi awal database.
import { labelOf, pickParam, rupiah, sizeParam, type Option, type PriceLine } from "@/lib/configurators/shared";

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
  { value: "persegi", label: "Persegi", desc: "Sudut siku" },
  { value: "tumpul", label: "Sudut tumpul", desc: "Radius 3 cm, lebih aman" },
  { value: "bulat", label: "Bulat / oval", desc: "Lingkaran bila ukuran sama" },
];

export const cutGlasses: Option<CutGlass>[] = [
  { value: "bening", label: "Bening (float)", desc: "Jendela, rak, bingkai" },
  { value: "tempered", label: "Tempered bening", desc: "5× lebih kuat, untuk meja & pintu" },
  { value: "riben", label: "Riben", desc: "Gelap, mengurangi silau" },
  { value: "es", label: "Es / sandblast", desc: "Buram untuk privasi" },
  { value: "cermin", label: "Cermin", desc: "Dinding, lemari, salon" },
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
  { value: "potong", label: "Potong saja", desc: "Tepi kasar, untuk dibingkai" },
  { value: "poles", label: "Poles", desc: "Tepi halus mengkilap, aman disentuh" },
  { value: "bevel", label: "Bevel 1 cm", desc: "Tepi miring dekoratif" },
];

export const holeOptions: Option<0 | 2 | 4>[] = [
  { value: 0, label: "Tanpa lubang" },
  { value: 2, label: "2 lubang" },
  { value: 4, label: "4 lubang" },
];

export const presets: { label: string; config: Partial<CutConfig> }[] = [
  { label: "Kaca meja", config: { shape: "tumpul", length: 120, width: 60, glass: "tempered", thickness: 8, edge: "poles", holes: 0 } },
  { label: "Rak dinding", config: { shape: "persegi", length: 80, width: 25, glass: "bening", thickness: 6, edge: "poles", holes: 0 } },
  { label: "Cermin dinding", config: { shape: "persegi", length: 90, width: 60, glass: "cermin", thickness: 5, edge: "bevel", holes: 4 } },
  { label: "Jendela", config: { shape: "persegi", length: 100, width: 60, glass: "bening", thickness: 5, edge: "potong", holes: 0 } },
];

// Menyesuaikan pilihan yang tidak lagi valid setelah jenis kaca/bentuk berubah
export function normalizeCut(c: CutConfig): CutConfig {
  const allowed = thicknessByGlass[c.glass];
  const thickness = allowed.includes(c.thickness) ? c.thickness : allowed.reduce((a, b) => (Math.abs(b - c.thickness) < Math.abs(a - c.thickness) ? b : a));
  const edge = c.edge === "bevel" && thickness < 5 ? "poles" : c.edge;
  const holes = c.shape === "bulat" ? 0 : c.holes;
  return { ...c, thickness, edge, holes };
}

export function cutWarnings(c: CutConfig) {
  const w: string[] = [];
  if (c.thickness <= 3 && Math.max(c.length, c.width) > 120) w.push("Kaca 3 mm di atas 120 cm mudah pecah; kami sarankan minimal 5 mm.");
  if (c.glass === "tempered") w.push("Kaca tempered tidak bisa dipotong ulang. Proses produksi 3–5 hari kerja.");
  if (c.glass !== "tempered" && c.thickness >= 8 && c.edge === "potong") w.push("Untuk kaca tebal yang sering disentuh, tepi poles lebih aman.");
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

export function cutEstimate(c: CutConfig, prices: CutPrices) {
  const area = cutArea(c);
  const billed = Math.max(area, prices.minArea);
  const glass = billed * (prices.pricePerM2[c.glass][c.thickness] ?? 0) * (c.shape === "bulat" ? prices.roundSurcharge : 1);
  const lines: PriceLine[] = [
    { label: `${labelOf(cutGlasses, c.glass)} ${c.thickness} mm, ${billed.toFixed(2).replace(".", ",")} m²`, value: glass },
  ];
  if (prices.edgePerM[c.edge]) lines.push({ label: `${labelOf(cutEdges, c.edge)}, keliling ${cutPerimeter(c).toFixed(2).replace(".", ",")} m`, value: cutPerimeter(c) * prices.edgePerM[c.edge] });
  if (c.holes) lines.push({ label: `${c.holes} lubang`, value: c.holes * prices.hole });
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
