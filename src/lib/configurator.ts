// Konfigurator shower box: pilihan, aturan ukuran, estimasi harga, dan link desain.
// DRAFT: semua harga di bawah adalah CONTOH. Ganti dengan harga asli dari pemilik.

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

// ── Harga contoh ──
const PRICE_PER_M2: Record<Thickness, number> = { 8: 650_000, 10: 800_000, 12: 1_000_000 };
const GLASS_EXTRA_PER_M2: Record<GlassType, number> = { bening: 0, sandblast: 150_000, riben: 100_000 };
const HARDWARE: Record<Layout, number> = { walkin: 450_000, ayun: 1_200_000, geser: 1_800_000, sudut: 1_600_000 };
const FINISH_FACTOR: Record<Finish, number> = { stainless: 1, hitam: 1.15, gold: 1.35 };
const HANDLE_PRICE: Record<Handle, number> = { bar: 0, knob: 0, tarik: 250_000 };
const COATING_PER_M2 = 75_000;
const SEAL = 150_000;
const TOWEL_BAR = 350_000;
const INSTALL = 350_000;

export function glassArea(c: ShowerConfig) {
  const h = c.height / 100;
  // Pintu geser menumpuk di depan panel tetap, jadi kacanya lebih lebar dari sisi depan
  const front = c.layout === "geser" ? (c.width / 2 + doorWidth(c)) / 100 : c.width / 100;
  const side = c.layout === "sudut" ? c.depth / 100 : 0;
  return (front + side) * h;
}

export function estimate(c: ShowerConfig) {
  const area = glassArea(c);
  const finish = FINISH_FACTOR[c.finish];
  const door = hasDoor(c.layout);
  const finishLabel = finishes.find((f) => f.value === c.finish)!.label.toLowerCase();
  const lines = [
    { label: `Kaca tempered ${c.thickness} mm, ${area.toFixed(2).replace(".", ",")} m²`, value: area * (PRICE_PER_M2[c.thickness] + GLASS_EXTRA_PER_M2[c.glass]) },
    { label: `Aksesoris ${finishLabel}`, value: HARDWARE[c.layout] * finish },
  ];
  if (door && HANDLE_PRICE[c.handle]) lines.push({ label: "Gagang tarik panjang", value: HANDLE_PRICE[c.handle] * finish });
  if (c.extras.includes("coating")) lines.push({ label: "Nano coating", value: area * COATING_PER_M2 });
  if (door && c.extras.includes("karet")) lines.push({ label: "Karet bawah pintu", value: SEAL });
  if (door && c.extras.includes("towel")) lines.push({ label: "Towel bar", value: TOWEL_BAR * finish });
  if (c.install) lines.push({ label: "Pemasangan", value: INSTALL });
  const total = lines.reduce((s, l) => s + l.value, 0);
  // Tampilkan sebagai rentang karena harga akhir bergantung pada survei lokasi
  const round = (n: number) => Math.round(n / 50_000) * 50_000;
  return { area, lines, low: round(total * 0.9), high: round(total * 1.1) };
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ── Link desain: semua pilihan disimpan di query string ──
const pick = <T extends string | number>(v: string | null, options: readonly { value: T }[], fallback: T): T =>
  options.find((o) => String(o.value) === v)?.value ?? fallback;
const size = (v: string | null, l: { min: number; max: number; step: number }, fallback: number) => {
  const n = Number(v);
  if (!v || !Number.isFinite(n)) return fallback;
  return Math.min(l.max, Math.max(l.min, Math.round(n / l.step) * l.step));
};

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

export function summaryText(c: ShowerConfig, link: string) {
  const e = estimate(c);
  const label = <T,>(list: { value: T; label: string }[], v: T) => list.find((x) => x.value === v)!.label;
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
