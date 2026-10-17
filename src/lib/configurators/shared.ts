// Utilitas bersama untuk semua konfigurator.

export type Option<T extends string | number> = { value: T; label: string; desc?: string; color?: string };
export type Range = { min: number; max: number; step: number };
export type PriceLine = { label: string; value: number };

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const labelOf = <T extends string | number>(list: readonly Option<T>[], v: T) => list.find((x) => x.value === v)!.label;

// Rentang harga ±10%, dibulatkan ke 50 ribu (harga final mengikuti survei)
export function priceRange(lines: PriceLine[]) {
  const total = lines.reduce((s, l) => s + l.value, 0);
  const round = (n: number) => Math.round(n / 50_000) * 50_000;
  return { total, low: round(total * 0.9), high: round(total * 1.1) };
}

// ── Membaca pilihan dari query string dengan aman ──
export const pickParam = <T extends string | number>(v: string | null, options: readonly { value: T }[], fallback: T): T =>
  options.find((o) => String(o.value) === v)?.value ?? fallback;

export const sizeParam = (v: string | null, r: Range, fallback: number) => {
  const n = Number(v);
  if (!v || !Number.isFinite(n)) return fallback;
  return Math.min(r.max, Math.max(r.min, Math.round(n / r.step) * r.step));
};

export const finishColors = {
  stainless: "#C9CDD2",
  hitam: "#1F2023",
  putih: "#EDEEEF",
  gold: "#C8A15A",
} as const;
