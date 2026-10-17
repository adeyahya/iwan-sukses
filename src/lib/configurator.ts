// Konfigurator shower box: pilihan, aturan ukuran, dan estimasi harga.
// DRAFT: semua harga di bawah adalah CONTOH. Ganti dengan harga asli dari pemilik.

export type Layout = "walkin" | "ayun" | "sudut";
export type Thickness = 8 | 10 | 12;
export type GlassType = "bening" | "sandblast" | "riben";
export type Finish = "stainless" | "hitam" | "gold";

export type ShowerConfig = {
  layout: Layout;
  width: number; // cm, sisi depan
  depth: number; // cm, sisi samping (L) atau jarak stabilizer (walk-in)
  height: number; // cm
  thickness: Thickness;
  glass: GlassType;
  finish: Finish;
  install: boolean;
};

export const defaultConfig: ShowerConfig = {
  layout: "sudut",
  width: 120,
  depth: 90,
  height: 200,
  thickness: 10,
  glass: "bening",
  finish: "hitam",
  install: true,
};

export const layouts: { value: Layout; label: string; desc: string }[] = [
  { value: "walkin", label: "Walk-in", desc: "Satu panel tetap tanpa pintu" },
  { value: "ayun", label: "Pintu ayun", desc: "Panel tetap + pintu, di antara dua dinding" },
  { value: "sudut", label: "Sudut L", desc: "Pintu + panel depan + panel samping" },
];

export const thicknesses: { value: Thickness; label: string }[] = [
  { value: 8, label: "8 mm" },
  { value: 10, label: "10 mm" },
  { value: 12, label: "12 mm" },
];

export const glassTypes: { value: GlassType; label: string; desc: string }[] = [
  { value: "bening", label: "Bening", desc: "Jernih, ruangan terasa lega" },
  { value: "sandblast", label: "Sandblast", desc: "Buram untuk privasi" },
  { value: "riben", label: "Riben", desc: "Gelap keabu-abuan" },
];

export const finishes: { value: Finish; label: string; color: string }[] = [
  { value: "stainless", label: "Stainless", color: "#C9CDD2" },
  { value: "hitam", label: "Hitam doff", color: "#1F2023" },
  { value: "gold", label: "Gold", color: "#C8A15A" },
];

export const sizeLimits = {
  width: { min: 70, max: 180, step: 5 },
  depth: { min: 70, max: 120, step: 5 },
  height: { min: 180, max: 210, step: 5 },
};

// Lebar pintu: 70 cm, tapi tidak lebih dari setengah sisi depan
export const doorWidth = (width: number) => Math.min(70, Math.round(width / 2));

// ── Harga contoh ──
const PRICE_PER_M2: Record<Thickness, number> = { 8: 650_000, 10: 800_000, 12: 1_000_000 };
const GLASS_EXTRA_PER_M2: Record<GlassType, number> = { bening: 0, sandblast: 150_000, riben: 100_000 };
const HARDWARE: Record<Layout, number> = { walkin: 450_000, ayun: 1_200_000, sudut: 1_600_000 };
const FINISH_FACTOR: Record<Finish, number> = { stainless: 1, hitam: 1.15, gold: 1.35 };
const INSTALL = 350_000;

export function glassArea(c: ShowerConfig) {
  const h = c.height / 100;
  const front = c.width / 100;
  const side = c.layout === "sudut" ? c.depth / 100 : 0;
  return (front + side) * h;
}

export function estimate(c: ShowerConfig) {
  const area = glassArea(c);
  const glass = area * (PRICE_PER_M2[c.thickness] + GLASS_EXTRA_PER_M2[c.glass]);
  const hardware = HARDWARE[c.layout] * FINISH_FACTOR[c.finish];
  const install = c.install ? INSTALL : 0;
  const total = glass + hardware + install;
  // Tampilkan sebagai rentang karena harga akhir bergantung pada survei lokasi
  const round = (n: number) => Math.round(n / 50_000) * 50_000;
  return {
    area,
    lines: [
      { label: `Kaca tempered ${c.thickness} mm, ${area.toFixed(2).replace(".", ",")} m²`, value: glass },
      { label: `Aksesoris ${finishes.find((f) => f.value === c.finish)!.label.toLowerCase()}`, value: hardware },
      ...(c.install ? [{ label: "Pemasangan", value: install }] : []),
    ],
    low: round(total * 0.9),
    high: round(total * 1.1),
  };
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function summaryText(c: ShowerConfig) {
  const e = estimate(c);
  const layout = layouts.find((l) => l.value === c.layout)!.label;
  const glass = glassTypes.find((g) => g.value === c.glass)!.label;
  const finish = finishes.find((f) => f.value === c.finish)!.label;
  const size =
    c.layout === "sudut" ? `${c.width} × ${c.depth} × ${c.height} cm (depan × samping × tinggi)` : `${c.width} × ${c.height} cm (lebar × tinggi)`;
  return [
    "Halo Iwan Sukses, saya ingin penawaran shower box dari konfigurator:",
    "",
    `Model: ${layout}`,
    `Ukuran: ${size}`,
    `Kaca: tempered ${c.thickness} mm, ${glass.toLowerCase()}`,
    `Aksesoris: ${finish}`,
    `Pemasangan: ${c.install ? "ya" : "tidak, ambil sendiri"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
  ].join("\n");
}
