// Utilitas bersama untuk semua konfigurator.
import type { Lang } from "@/i18n/config";

// label/desc dalam Bahasa Indonesia (juga dipakai admin dan pesan WhatsApp); en = teks untuk tampilan English
export type Option<T extends string | number> = { value: T; label: string; desc?: string; color?: string; en?: { label: string; desc?: string } };
export type Range = { min: number; max: number; step: number };
export type PriceLine = { label: string; value: number };

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const labelOf = <T extends string | number>(list: readonly Option<T>[], v: T, lang: Lang = "id") => {
  const o = list.find((x) => x.value === v)!;
  return lang === "en" && o.en ? o.en.label : o.label;
};

/** Pilihan dengan label sesuai bahasa tampilan */
export const localize = <T extends string | number, O extends Option<T>>(list: readonly O[], lang: Lang): O[] =>
  list.map((o) => (lang === "en" && o.en ? { ...o, label: o.en.label, desc: o.en.desc ?? o.desc } : o));

/** Pilih teks sesuai bahasa: tr(lang, "Pemasangan", "Installation") */
export const tr = (lang: Lang, id: string, en: string) => (lang === "en" ? en : id);

/** Angka desimal: koma untuk Bahasa Indonesia, titik untuk English */
export const decimal = (n: number, digits: number, lang: Lang = "id") => (lang === "en" ? n.toFixed(digits) : n.toFixed(digits).replace(".", ","));

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
