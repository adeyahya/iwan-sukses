"use server";

import { randomBytes } from "node:crypto";

import { and, asc, desc, eq, gt, lt, max, ne } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { galleryItems, locations, media, products, settings } from "@/db/schema";
import { priceForms, settingsSections, type Field } from "@/lib/admin/specs";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { contentTag, readSettings } from "@/lib/content";
import { galleryCategories, type GalleryCategory } from "@/lib/data";

export type FormState = { ok: boolean; message: string } | null;

const str = (f: FormData, name: string) => String(f.get(name) ?? "").trim();
const optional = (f: FormData, name: string) => str(f, name) || null;
const int = (f: FormData, name: string) => {
  const n = Number.parseInt(str(f, name), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const bool = (f: FormData, name: string) => f.get(name) === "on";

const saved = (message = "Tersimpan. Situs sudah memakai perubahan ini."): FormState => {
  updateTag(contentTag);
  return { ok: true, message };
};

// ── Masuk / keluar ──

export async function login(_: FormState, form: FormData): Promise<FormState> {
  // Jeda kecil memperlambat tebakan kata sandi beruntun
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(form.get("password") ?? ""))) return { ok: false, message: "Kata sandi salah." };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// ── Pengaturan ──

function readField(field: Field, form: FormData): unknown {
  const name = field.name ?? "value";
  if (field.type === "lines")
    return str(form, name)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  if (field.type === "rows") {
    const rows = JSON.parse(str(form, name) || "[]") as Record<string, unknown>[];
    // Simpan hanya kolom yang dikenal, semuanya sebagai teks; buang baris kosong
    return rows
      .map((r) => Object.fromEntries(field.columns.map((c) => [c.name, String(r[c.name] ?? "").trim()])))
      .filter((r) => field.fixed || Object.values(r).some(Boolean));
  }
  return str(form, name);
}

export async function saveSettings(slug: string, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const section = settingsSections.find((s) => s.slug === slug);
  if (!section) return { ok: false, message: "Bagian tidak dikenal." };

  const current = (await readSettings())[section.key];
  let value: unknown;
  if (section.fields.length === 1 && section.fields[0].name === null) {
    value = readField(section.fields[0], form);
  } else {
    value = { ...(current as object) };
    for (const field of section.fields) (value as Record<string, unknown>)[field.name!] = readField(field, form);
  }
  await db
    .insert(settings)
    .values({ key: section.key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  return saved();
}

export async function savePrices(key: string, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const spec = priceForms.find((p) => p.key === key);
  if (!spec) return { ok: false, message: "Konfigurator tidak dikenal." };

  const value = structuredClone((await readSettings())[spec.key]) as unknown as Record<string, unknown>;
  for (const [name, raw] of form.entries()) {
    if (!name.startsWith("p:")) continue;
    const text = String(raw).trim();
    const n = Number(text);
    if (!text || !Number.isFinite(n) || n < 0) return { ok: false, message: `Angka tidak valid: "${text}"` };
    const path = name.slice(2).split(".");
    let target = value;
    for (const part of path.slice(0, -1)) target = (target[part] ??= {}) as Record<string, unknown>;
    target[path.at(-1)!] = n;
  }
  await db
    .insert(settings)
    .values({ key: spec.key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  return saved(`Harga ${spec.title.toLowerCase()} tersimpan.`);
}

// ── Tabel berurutan: produk, galeri, lokasi ──

const tables = { products, galleryItems, locations };
type TableName = keyof typeof tables;

// Argumen server action datang dari browser, jadi selalu diperiksa
const tableOf = (name: TableName) => {
  if (!Object.hasOwn(tables, name)) throw new Error("Tabel tidak dikenal");
  return tables[name];
};

async function nextSortOrder(name: TableName) {
  const t = tables[name];
  const [row] = await db.select({ n: max(t.sortOrder) }).from(t);
  return (row?.n ?? -1) + 1;
}

export async function moveRow(name: TableName, id: number, direction: "up" | "down") {
  await requireAdmin();
  const t = tableOf(name);
  const [row] = await db.select({ id: t.id, sortOrder: t.sortOrder }).from(t).where(eq(t.id, id));
  if (!row) return;
  const [neighbor] = await db
    .select({ id: t.id, sortOrder: t.sortOrder })
    .from(t)
    .where(direction === "up" ? lt(t.sortOrder, row.sortOrder) : gt(t.sortOrder, row.sortOrder))
    .orderBy(direction === "up" ? desc(t.sortOrder) : asc(t.sortOrder))
    .limit(1);
  if (!neighbor) return;
  await db.batch([
    db.update(t).set({ sortOrder: neighbor.sortOrder }).where(eq(t.id, row.id)),
    db.update(t).set({ sortOrder: row.sortOrder }).where(eq(t.id, neighbor.id)),
  ]);
  updateTag(contentTag);
  // Daftar admin membaca database langsung (tanpa cache), jadi muat ulang tampilannya
  refresh();
}

export async function toggleRow(name: TableName, id: number, enabled: boolean) {
  await requireAdmin();
  const t = tableOf(name);
  await db.update(t).set({ enabled }).where(eq(t.id, id));
  updateTag(contentTag);
  // Daftar admin membaca database langsung (tanpa cache), jadi muat ulang tampilannya
  refresh();
}

export async function deleteRow(name: TableName, id: number) {
  await requireAdmin();
  const t = tableOf(name);
  await db.delete(t).where(eq(t.id, id));
  updateTag(contentTag);
  // Daftar admin membaca database langsung (tanpa cache), jadi muat ulang tampilannya
  refresh();
}

const listPath: Record<TableName, string> = { products: "/admin/produk", galleryItems: "/admin/galeri", locations: "/admin/lokasi" };

export async function saveProduct(id: number | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const layout = str(form, "layout");
  const data = {
    title: str(form, "title"),
    note: str(form, "note"),
    image: str(form, "image"),
    alt: str(form, "alt"),
    href: str(form, "href") || "#galeri",
    layout: (["feature", "wide"] as const).find((l) => l === layout) ?? null,
    enabled: bool(form, "enabled"),
  };
  if (!data.title || !data.image) return { ok: false, message: "Judul dan foto wajib diisi." };
  if (id) await db.update(products).set(data).where(eq(products.id, id));
  else await db.insert(products).values({ ...data, sortOrder: await nextSortOrder("products") });
  updateTag(contentTag);
  redirect(listPath.products);
}

export async function saveGalleryItem(id: number | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const cat = str(form, "cat") as GalleryCategory;
  const data = {
    src: str(form, "src"),
    video: optional(form, "video"),
    cat,
    title: str(form, "title"),
    width: int(form, "width"),
    height: int(form, "height"),
    enabled: bool(form, "enabled"),
  };
  if (!data.src || !data.title) return { ok: false, message: "Foto dan judul wajib diisi." };
  if (!galleryCategories.some((c) => c.value === cat)) return { ok: false, message: "Pilih kategori." };
  if (id) await db.update(galleryItems).set(data).where(eq(galleryItems.id, id));
  else await db.insert(galleryItems).values({ ...data, sortOrder: await nextSortOrder("galleryItems") });
  updateTag(contentTag);
  redirect(listPath.galleryItems);
}

export async function saveLocation(id: number | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = {
    tag: str(form, "tag"),
    main: bool(form, "main"),
    name: str(form, "name"),
    address: str(form, "address"),
    phoneLabel: str(form, "phoneLabel"),
    phoneDisplay: str(form, "phoneDisplay"),
    // wa.me butuh format internasional tanpa tanda: 0821... → 62821...
    phoneNumber: str(form, "phoneNumber").replace(/\D/g, "").replace(/^0/, "62"),
    opens: str(form, "opens"),
    maps: str(form, "maps"),
    locality: str(form, "locality"),
    region: str(form, "region"),
    postalCode: str(form, "postalCode"),
    enabled: bool(form, "enabled"),
  };
  if (!data.name || !data.phoneNumber) return { ok: false, message: "Nama dan nomor WhatsApp wajib diisi." };
  const savedId = id
    ? (await db.update(locations).set(data).where(eq(locations.id, id)).returning({ id: locations.id }))[0]?.id
    : (await db.insert(locations).values({ ...data, sortOrder: await nextSortOrder("locations") }).returning({ id: locations.id }))[0].id;
  // Hanya satu toko utama
  if (data.main && savedId) await db.update(locations).set({ main: false }).where(and(eq(locations.main, true), ne(locations.id, savedId)));
  updateTag(contentTag);
  redirect(listPath.locations);
}

// ── Unggah foto ──

const MAX_UPLOAD = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif", "image/gif"];

export async function uploadImage(form: FormData): Promise<{ src: string; width: number | null; height: number | null } | { error: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Tidak ada file." };
  if (!IMAGE_TYPES.includes(file.type)) return { error: "Format foto harus WebP, JPEG, PNG, AVIF, atau GIF." };
  if (file.size > MAX_UPLOAD) return { error: "Foto terlalu besar (maks. 8 MB)." };
  const width = int(form, "width");
  const height = int(form, "height");
  const id = randomBytes(9).toString("base64url");
  await db.insert(media).values({ id, mime: file.type, data: Buffer.from(await file.arrayBuffer()), width, height });
  return { src: `/media/${id}`, width, height };
}
