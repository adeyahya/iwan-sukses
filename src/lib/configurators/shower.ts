// Konfigurator shower box: pilihan, aturan ukuran, estimasi harga, dan link desain.
// DRAFT: semua harga di bawah adalah CONTOH. Ganti dengan harga asli dari pemilik.
import { labelOf, pickParam, priceRange, rupiah, sizeParam, type PriceLine } from "@/lib/configurators/shared";

export const showerPath = "/konfigurator/shower-box";

export type Layout = "walkin" | "ayun" | "geser" | "sudut";
export type Thickness = 8 | 10 | 12;
export type GlassType = "bening" | "sandblast" | "riben";
export type Finish = "stainless" | "hitam" | "gold";
export type DoorSide = "kanan" | "kiri";
export type Handle = "bar" | "knob" | "tarik";
export type Extra = "coating" | "karet" | "towel";

export type ShowerConfig = {
  layout: Layout;
  width: number; // cm, sisi depan
  depth: number; // cm, sisi samping (L) atau jarak stabilizer (walk-in)
  height: number; // cm
  thickness: Thickness;
  glass: GlassType;
  finish: Finish;
  doorSide: DoorSide;
  handle: Handle;
  extras: Extra[];
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
  doorSide: "kanan",
  handle: "bar",
  extras: [],
  install: true,
};

export const layouts: { value: Layout; label: string; desc: string }[] = [
  { value: "walkin", label: "Walk-in", desc: "Satu panel tetap tanpa pintu" },
  { value: "ayun", label: "Pintu ayun", desc: "Panel tetap + pintu, di antara dua dinding" },
  { value: "geser", label: "Pintu geser", desc: "Pintu sliding di rel atas, hemat ruang" },
  { value: "sudut", label: "Sudut L", desc: "Pintu + panel depan + panel samping" },
];

export const hasDoor = (l: Layout) => l !== "walkin";

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

export const doorSides: { value: DoorSide; label: string }[] = [
  { value: "kiri", label: "Pintu di kiri" },
  { value: "kanan", label: "Pintu di kanan" },
];

export const handles: { value: Handle; label: string; desc: string }[] = [
  { value: "bar", label: "Bar", desc: "Batang 30 cm" },
  { value: "knob", label: "Knob", desc: "Bulat, ringkas" },
  { value: "tarik", label: "Tarik panjang", desc: "Batang 60 cm" },
];

export const extrasList: { value: Extra; label: string; desc: string }[] = [
  { value: "coating", label: "Nano coating", desc: "Air & noda kapur mudah dibersihkan" },
  { value: "karet", label: "Karet bawah pintu", desc: "Mengurangi air merembes keluar" },
  { value: "towel", label: "Towel bar", desc: "Gantungan handuk di pintu" },
];

export const sizeLimits = {
  width: { min: 70, max: 180, step: 5 },
  depth: { min: 70, max: 120, step: 5 },
  height: { min: 180, max: 210, step: 5 },
};

// Lebar pintu ayun: 70 cm, tapi tidak lebih dari setengah sisi depan.
// Pintu geser: setengah sisi depan + 5 cm tumpang tindih dengan panel tetap.
export const doorWidth = (c: Pick<ShowerConfig, "layout" | "width">) =>
  c.layout === "geser" ? Math.round(c.width / 2) + 5 : Math.min(70, Math.round(c.width / 2));

// Peringatan produksi berdasarkan ukuran dan ketebalan
export function warnings(c: ShowerConfig) {
  const w: string[] = [];
  if (c.width > 160 && c.thickness === 8) w.push("Untuk lebar di atas 160 cm, kami sarankan kaca 10 mm agar lebih kokoh.");
  if (c.height > 200) w.push("Pastikan tinggi plafon kamar mandi minimal 220 cm.");
  if (c.layout === "ayun" && c.width < 90) w.push("Lebar di bawah 90 cm membuat pintu ayun sempit; pertimbangkan pintu geser.");
  return w;
}

// ── Harga (diatur di /admin/harga; nilai di bawah hanya isi awal database) ──
export type ShowerPrices = {
  pricePerM2: Record<Thickness, number>;
  glassExtraPerM2: Record<GlassType, number>;
  hardware: Record<Layout, number>;
  finishFactor: Record<Finish, number>;
  handlePrice: Record<Handle, number>;
  coatingPerM2: number;
  seal: number;
  towelBar: number;
  install: number;
};

export const defaultShowerPrices: ShowerPrices = {
  pricePerM2: { 8: 650_000, 10: 800_000, 12: 1_000_000 },
  glassExtraPerM2: { bening: 0, sandblast: 150_000, riben: 100_000 },
  hardware: { walkin: 450_000, ayun: 1_200_000, geser: 1_800_000, sudut: 1_600_000 },
  finishFactor: { stainless: 1, hitam: 1.15, gold: 1.35 },
  handlePrice: { bar: 0, knob: 0, tarik: 250_000 },
  coatingPerM2: 75_000,
  seal: 150_000,
  towelBar: 350_000,
  install: 350_000,
};

export function glassArea(c: ShowerConfig) {
  const h = c.height / 100;
  // Pintu geser menumpuk di depan panel tetap, jadi kacanya lebih lebar dari sisi depan
  const front = c.layout === "geser" ? (c.width / 2 + doorWidth(c)) / 100 : c.width / 100;
  const side = c.layout === "sudut" ? c.depth / 100 : 0;
  return (front + side) * h;
}

export function estimate(c: ShowerConfig, prices: ShowerPrices) {
  const area = glassArea(c);
  const finish = prices.finishFactor[c.finish];
  const door = hasDoor(c.layout);
  const finishLabel = finishes.find((f) => f.value === c.finish)!.label.toLowerCase();
  const lines: PriceLine[] = [
    { label: `Kaca tempered ${c.thickness} mm, ${area.toFixed(2).replace(".", ",")} m²`, value: area * (prices.pricePerM2[c.thickness] + prices.glassExtraPerM2[c.glass]) },
    { label: `Aksesoris ${finishLabel}`, value: prices.hardware[c.layout] * finish },
  ];
  if (door && prices.handlePrice[c.handle]) lines.push({ label: "Gagang tarik panjang", value: prices.handlePrice[c.handle] * finish });
  if (c.extras.includes("coating")) lines.push({ label: "Nano coating", value: area * prices.coatingPerM2 });
  if (door && c.extras.includes("karet")) lines.push({ label: "Karet bawah pintu", value: prices.seal });
  if (door && c.extras.includes("towel")) lines.push({ label: "Towel bar", value: prices.towelBar * finish });
  if (c.install) lines.push({ label: "Pemasangan", value: prices.install });
  // Tampilkan sebagai rentang karena harga akhir bergantung pada survei lokasi
  return { area, lines, ...priceRange(lines) };
}

// ── Link desain: semua pilihan disimpan di query string ──
const pick = pickParam;
const size = sizeParam;

export function configToParams(c: ShowerConfig) {
  const p = new URLSearchParams({
    model: c.layout,
    lebar: String(c.width),
    tinggi: String(c.height),
    tebal: String(c.thickness),
    kaca: c.glass,
    aksesoris: c.finish,
    pasang: c.install ? "1" : "0",
  });
  if (c.layout === "walkin" || c.layout === "sudut") p.set("samping", String(c.depth));
  if (hasDoor(c.layout)) {
    p.set("pintu", c.doorSide);
    p.set("gagang", c.handle);
  }
  if (c.extras.length) p.set("opsi", c.extras.join(","));
  return p;
}

export function paramsToConfig(p: URLSearchParams): ShowerConfig {
  const d = defaultConfig;
  return {
    layout: pick(p.get("model"), layouts, d.layout),
    width: size(p.get("lebar"), sizeLimits.width, d.width),
    depth: size(p.get("samping"), sizeLimits.depth, d.depth),
    height: size(p.get("tinggi"), sizeLimits.height, d.height),
    thickness: pick(p.get("tebal"), thicknesses, d.thickness),
    glass: pick(p.get("kaca"), glassTypes, d.glass),
    finish: pick(p.get("aksesoris"), finishes, d.finish),
    doorSide: pick(p.get("pintu"), doorSides, d.doorSide),
    handle: pick(p.get("gagang"), handles, d.handle),
    extras: (p.get("opsi") ?? "").split(",").filter((x): x is Extra => extrasList.some((e) => e.value === x)),
    install: p.get("pasang") !== "0",
  };
}

export { rupiah };

export function summaryText(c: ShowerConfig, link: string, prices: ShowerPrices) {
  const e = estimate(c, prices);
  const label = labelOf;
  const size =
    c.layout === "sudut"
      ? `${c.width} × ${c.depth} × ${c.height} cm (depan × samping × tinggi)`
      : `${c.width} × ${c.height} cm (lebar × tinggi)`;
  const door = hasDoor(c.layout);
  const extras = c.extras.filter((x) => x === "coating" || door).map((x) => label(extrasList, x));
  return [
    "Halo Iwan Sukses, saya ingin penawaran shower box dari konfigurator:",
    "",
    `Model: ${label(layouts, c.layout)}`,
    `Ukuran: ${size}`,
    `Kaca: tempered ${c.thickness} mm, ${label(glassTypes, c.glass).toLowerCase()}`,
    `Aksesoris: ${label(finishes, c.finish)}`,
    ...(door ? [`Pintu: ${label(doorSides, c.doorSide).replace("Pintu di ", "")}, gagang ${label(handles, c.handle).toLowerCase()}`] : []),
    `Tambahan: ${extras.length ? extras.join(", ") : "-"}`,
    `Pemasangan: ${c.install ? "ya" : "tidak, ambil sendiri"}`,
    `Estimasi di situs: ${rupiah(e.low)} – ${rupiah(e.high)}`,
    "",
    `Lihat desain 3D: ${link}`,
  ].join("\n");
}
