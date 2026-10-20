"use server";

import { randomBytes } from "node:crypto";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { and, asc, count, desc, eq, gt, inArray, lt, max, ne, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { account, galleryItems, invites, locations, media, posts, products, session, settings, user, videoChunks, videos } from "@/db/schema";
import { localePath } from "@/i18n/config";
import { enName, hasTranslation, priceForms, settingsSections, withEnglishColumns, type Field } from "@/lib/admin/specs";
import { auth, devLoginEnabled, requireAdmin } from "@/lib/auth";
import { autoExcerpt, cleanDoc, slugify, type DocNode } from "@/lib/blog";
import { contentTag, postsTag, readSettings } from "@/lib/content";
import { galleryCategories, type GalleryCategory } from "@/lib/data";
import { overlayKey } from "@/lib/settings";
import { isVideoSrc, MAX_VIDEO, VIDEO_CHUNK } from "@/lib/video";

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
  // React mengosongkan form ke nilai awal setelah action; muat ulang agar nilai awalnya yang baru
  refresh();
  return { ok: true, message };
};

// ── Masuk / keluar ──

// Mulai login Google: better-auth menyiapkan state (cookie) lalu kita arahkan ke Google
export async function signInWithGoogle() {
  const { url } = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: "/admin", errorCallbackURL: "/admin/login" },
    headers: await headers(),
  });
  if (!url) throw new Error("Login Google gagal dimulai");
  redirect(url);
}

// Hanya saat `next dev` (endpoint-nya tidak ada di produksi): masuk sebagai akun pertama tanpa Google
export async function devLogin() {
  if (!devLoginEnabled) throw new Error("Tidak tersedia");
  await (auth.api as unknown as { devLogin: (o: { headers: Headers }) => Promise<unknown> }).devLogin({ headers: await headers() });
  redirect("/admin");
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

// ── Pengguna & undangan ──

export async function inviteAdmin(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const address = str(form, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(address)) return { ok: false, message: "Email tidak valid." };
  const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.email, address));
  if (taken) return { ok: false, message: "Email ini sudah jadi admin." };
  await db.insert(invites).values({ email: address, invitedBy: me.id }).onConflictDoNothing();
  refresh();
  return { ok: true, message: `${address} diundang. Minta dia masuk di /admin/login dengan akun Google untuk email itu.` };
}

export async function deleteInvite(id: number) {
  await requireAdmin();
  await db.delete(invites).where(eq(invites.id, id));
  refresh();
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (id === me.id) throw new Error("Tidak bisa menghapus akun sendiri");
  // Sesi dan akun Google ikut dihapus (juga lewat ON DELETE CASCADE), jadi orangnya langsung keluar
  await db.batch([db.delete(session).where(eq(session.userId, id)), db.delete(account).where(eq(account.userId, id)), db.delete(user).where(eq(user.id, id))]);
  refresh();
}

// ── Pengaturan ──

const lines = (f: FormData, name: string) =>
  str(f, name)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// Isian Indonesia dan (bila ada) terjemahan English-nya. Daftar baris dikirim sebagai satu JSON berisi
// kolom Indonesia dan kolom `<kolom>@en`, lalu dipisah per bahasa dengan urutan baris yang sama.
function readField(field: Field, form: FormData): { id: unknown; en?: unknown } {
  const name = field.name ?? "value";
  if (field.type === "rows") {
    const columns = withEnglishColumns(field.columns);
    const rows = (JSON.parse(str(form, name) || "[]") as Record<string, unknown>[])
      // Simpan hanya kolom yang dikenal, semuanya sebagai teks; buang baris kosong
      .map((r) => Object.fromEntries(columns.map((c) => [c.name, String(r[c.name] ?? "").trim()])))
      .filter((r) => field.fixed || Object.values(r).some(Boolean));
    const translated = field.columns.filter((c) => c.translate);
    return {
      id: rows.map((r) => Object.fromEntries(field.columns.map((c) => [c.name, r[c.name]]))),
      en: translated.length ? rows.map((r) => Object.fromEntries(translated.map((c) => [c.name, r[enName(c.name)]]))) : undefined,
    };
  }
  if (field.type === "lines") return { id: lines(form, name), en: field.translate ? lines(form, enName(name)) : undefined };
  return { id: str(form, name), en: field.type !== "image" && field.translate ? str(form, enName(name)) : undefined };
}

const upsertSetting = (key: string, value: unknown) =>
  db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });

export async function saveSettings(slug: string, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const section = settingsSections.find((s) => s.slug === slug);
  if (!section) return { ok: false, message: "Bagian tidak dikenal." };

  const current = (await readSettings())[section.key];
  let value: unknown;
  let en: unknown;
  if (section.fields.length === 1 && section.fields[0].name === null) {
    ({ id: value, en } = readField(section.fields[0], form));
  } else {
    const id: Record<string, unknown> = { ...(current as object) };
    const translated: Record<string, unknown> = {};
    for (const field of section.fields) {
      const read = readField(field, form);
      id[field.name!] = read.id;
      if (read.en !== undefined) translated[field.name!] = read.en;
    }
    value = id;
    en = translated;
  }
  await upsertSetting(section.key, value);
  // Terjemahan disimpan utuh (termasuk yang kosong); saat dibaca, isian kosong memakai teks Indonesia
  if (hasTranslation(section)) await upsertSetting(overlayKey(section.key, "en"), en);
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
  await upsertSetting(spec.key, value);
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

// Urutan baru hasil seret-lepas: ids = semua baris tabel dalam urutan tampil
export async function reorderRows(name: TableName, ids: number[]) {
  await requireAdmin();
  const t = tableOf(name);
  const existing = new Set((await db.select({ id: t.id }).from(t)).map((r) => r.id));
  if (!Array.isArray(ids) || ids.length !== existing.size || !ids.every((id) => existing.has(id))) throw new Error("Daftar tidak cocok");
  const [first, ...rest] = ids.map((id, i) => db.update(t).set({ sortOrder: i }).where(eq(t.id, id)));
  if (first) await db.batch([first, ...rest]);
  updateTag(contentTag);
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
    // English kosong = tampil teks Indonesia di /en
    titleEn: optional(form, "titleEn"),
    noteEn: optional(form, "noteEn"),
    altEn: optional(form, "altEn"),
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
    titleEn: optional(form, "titleEn"),
    width: int(form, "width"),
    height: int(form, "height"),
    enabled: bool(form, "enabled"),
  };
  if (!data.src || !data.title) return { ok: false, message: "Foto dan judul wajib diisi." };
  if (!galleryCategories.some((c) => c.value === cat)) return { ok: false, message: "Pilih kategori." };
  if (data.video && !isVideoSrc(data.video)) return { ok: false, message: "Video tidak dikenal. Unggah atau pilih ulang videonya." };
  if (id) await db.update(galleryItems).set(data).where(eq(galleryItems.id, id));
  else await db.insert(galleryItems).values({ ...data, sortOrder: await nextSortOrder("galleryItems") });
  updateTag(contentTag);
  redirect(listPath.galleryItems);
}

export async function saveLocation(id: number | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const data = {
    tag: str(form, "tag"),
    tagEn: optional(form, "tagEn"),
    main: bool(form, "main"),
    name: str(form, "name"),
    address: str(form, "address"),
    phoneLabel: str(form, "phoneLabel"),
    phoneLabelEn: optional(form, "phoneLabelEn"),
    phoneDisplay: str(form, "phoneDisplay"),
    // wa.me butuh format internasional tanpa tanda: 0821... → 62821...
    phoneNumber: str(form, "phoneNumber").replace(/\D/g, "").replace(/^0/, "62"),
    opens: str(form, "opens"),
    opensEn: optional(form, "opensEn"),
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

// ── Unggah video ──
// Video dikirim per potongan VIDEO_CHUNK: beginVideo → appendVideoChunk (berulang) → finishVideo.

export async function beginVideo(mime: string, size: number): Promise<{ id: string } | { error: string }> {
  await requireAdmin();
  if (!["video/mp4", "video/quicktime"].includes(mime)) return { error: "Format video harus MP4 atau MOV." };
  if (!Number.isInteger(size) || size <= 0) return { error: "File video kosong." };
  if (size > MAX_VIDEO) return { error: `Video terlalu besar (maks. ${MAX_VIDEO / 1024 / 1024} MB). Potong videonya dulu.` };
  // Unggahan yang terputus lebih dari sehari lalu tidak akan dilanjutkan: buang potongannya
  const stale = await db
    .select({ id: videos.id })
    .from(videos)
    .where(and(eq(videos.done, false), lt(videos.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))));
  if (stale.length) {
    const ids = stale.map((v) => v.id);
    await db.delete(videoChunks).where(inArray(videoChunks.videoId, ids));
    await db.delete(videos).where(inArray(videos.id, ids));
  }
  const id = randomBytes(9).toString("base64url");
  // MOV dari HP (H.264) diputar Chrome dan Safari bila disajikan sebagai MP4
  await db.insert(videos).values({ id, mime: "video/mp4", size });
  return { id };
}

export async function appendVideoChunk(form: FormData): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const id = str(form, "id");
  const idx = Number(str(form, "idx"));
  const chunk = form.get("chunk");
  const [video] = await db.select().from(videos).where(eq(videos.id, id));
  if (!video || video.done) return { error: "Unggahan tidak ditemukan. Coba unggah ulang." };
  const chunks = Math.ceil(video.size / VIDEO_CHUNK);
  if (!Number.isInteger(idx) || idx < 0 || idx >= chunks) return { error: "Potongan video tidak valid." };
  const expected = idx === chunks - 1 ? video.size - idx * VIDEO_CHUNK : VIDEO_CHUNK;
  if (!(chunk instanceof Blob) || chunk.size !== expected) return { error: "Potongan video tidak lengkap. Coba unggah ulang." };
  const data = Buffer.from(await chunk.arrayBuffer());
  // Potongan yang dikirim ulang (koneksi putus) menimpa yang lama
  await db
    .insert(videoChunks)
    .values({ videoId: id, idx, data })
    .onConflictDoUpdate({ target: [videoChunks.videoId, videoChunks.idx], set: { data } });
  return { ok: true };
}

export async function finishVideo(id: string): Promise<{ src: string } | { error: string }> {
  await requireAdmin();
  const [video] = await db.select().from(videos).where(eq(videos.id, id));
  if (!video) return { error: "Unggahan tidak ditemukan. Coba unggah ulang." };
  const [stored] = await db
    .select({ n: count(), bytes: sql<number>`coalesce(sum(length(${videoChunks.data})), 0)` })
    .from(videoChunks)
    .where(eq(videoChunks.videoId, id));
  if (stored.n !== Math.ceil(video.size / VIDEO_CHUNK) || Number(stored.bytes) !== video.size) {
    return { error: "Video belum terunggah lengkap. Coba unggah ulang." };
  }
  await db.update(videos).set({ done: true }).where(eq(videos.id, id));
  return { src: `/video/${id}` };
}

export type LibraryVideo = { src: string; poster: string | null };

// Semua video yang bisa dipakai: unggahan, video bawaan di public/proyek, dan yang sudah dipakai galeri
export async function listVideos(): Promise<LibraryVideo[]> {
  await requireAdmin();
  const [uploads, gallery, bundled] = await Promise.all([
    db.select({ id: videos.id }).from(videos).where(eq(videos.done, true)).orderBy(desc(videos.createdAt)),
    db.select({ src: galleryItems.src, video: galleryItems.video }).from(galleryItems).orderBy(asc(galleryItems.sortOrder)),
    readdir(join(process.cwd(), "public/proyek")).catch(() => [] as string[]),
  ]);
  const posterOf = new Map<string, string>();
  for (const g of gallery) if (g.video && !posterOf.has(g.video)) posterOf.set(g.video, g.src);
  const found = new Map<string, LibraryVideo>();
  const add = (src: string, poster: string | null = null) => {
    if (isVideoSrc(src) && !found.has(src)) found.set(src, { src, poster: posterOf.get(src) ?? poster });
  };
  for (const v of uploads) add(`/video/${v.id}`);
  for (const file of bundled.filter((f) => f.endsWith(".mp4")).sort()) {
    const poster = file.replace(/\.mp4$/, "-poster-800.webp");
    add(`/proyek/${file}`, bundled.includes(poster) ? `/proyek/${poster}` : null);
  }
  for (const g of gallery) if (g.video) add(g.video);
  return [...found.values()];
}

export type LibraryPhoto = { src: string; width: number | null; height: number | null };

const isPhotoSrc = (v: unknown): v is string => typeof v === "string" && /^(\/media\/|\/proyek\/|https:\/\/images\.unsplash\.com\/)/.test(v);

// Semua foto yang sudah ada di situs (unggahan + foto yang dipakai di mana pun), terbaru dulu
export async function listPhotos(): Promise<LibraryPhoto[]> {
  await requireAdmin();
  const [uploads, gallery, prods, postCovers, settingRows] = await Promise.all([
    db.select({ id: media.id, width: media.width, height: media.height }).from(media).orderBy(desc(media.createdAt)),
    db.select({ src: galleryItems.src, width: galleryItems.width, height: galleryItems.height }).from(galleryItems).orderBy(asc(galleryItems.sortOrder)),
    db.select({ src: products.image }).from(products),
    db.select({ src: posts.coverImage }).from(posts),
    db.select({ value: settings.value }).from(settings),
  ]);
  const found = new Map<string, LibraryPhoto>();
  const add = (src: unknown, width: number | null = null, height: number | null = null) => {
    if (isPhotoSrc(src) && !found.has(src)) found.set(src, { src, width, height });
  };
  for (const m of uploads) add(`/media/${m.id}`, m.width, m.height);
  for (const g of gallery) add(g.src, g.width, g.height);
  for (const p of [...prods, ...postCovers]) add(p.src);
  // Foto di pengaturan (hero, seni kaca, Instagram, ...) bisa ada di dalam objek atau daftar
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
    else add(v);
  };
  settingRows.forEach((r) => walk(r.value));
  return [...found.values()];
}

// Beberapa foto sekaligus ke galeri (sudah diunggah lewat uploadImage); judul bisa diubah nanti
export async function addGalleryItems(cat: GalleryCategory, items: { src: string; title: string; width: number | null; height: number | null }[]) {
  await requireAdmin();
  if (!galleryCategories.some((c) => c.value === cat)) throw new Error("Kategori tidak dikenal");
  const rows = items.filter((i) => isPhotoSrc(i.src));
  if (!rows.length) return;
  let order = await nextSortOrder("galleryItems");
  await db.insert(galleryItems).values(
    rows.map((i) => ({
      src: i.src,
      cat,
      title: String(i.title).trim().slice(0, 120) || "Foto proyek",
      width: Number.isInteger(i.width) ? i.width : null,
      height: Number.isInteger(i.height) ? i.height : null,
      sortOrder: order++,
    })),
  );
  updateTag(contentTag);
  refresh();
}

// ── Blog ──

export async function savePost(id: number | null, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const title = str(form, "title");
  if (!title) return { ok: false, message: "Judul wajib diisi." };
  const slug = slugify(str(form, "slug") || title);
  if (!slug) return { ok: false, message: "Alamat (slug) tidak valid." };

  let content: DocNode;
  try {
    content = cleanDoc(JSON.parse(str(form, "content"))) ?? { type: "doc", content: [] };
  } catch {
    return { ok: false, message: "Isi artikel tidak terbaca. Muat ulang halaman lalu coba lagi." };
  }
  const status = str(form, "status") === "published" ? ("published" as const) : ("draft" as const);
  const date = str(form, "publishedAt");
  // Tanggal terbit dipakai sebagai tanggal tampil; kosong saat terbit = hari ini
  const publishedAt = date ? new Date(`${date}T09:00:00+07:00`) : status === "published" ? new Date() : null;
  const locale = str(form, "locale") === "en" ? ("en" as const) : ("id" as const);
  const url = localePath(locale, `/blog/${slug}`);
  const data = {
    locale,
    title,
    slug,
    excerpt: str(form, "excerpt") || autoExcerpt(content),
    coverImage: str(form, "coverImage"),
    coverAlt: str(form, "coverAlt"),
    content,
    status,
    publishedAt,
    updatedAt: new Date(),
  };

  const [taken] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
  if (taken && taken.id !== id) return { ok: false, message: `Alamat "${slug}" sudah dipakai artikel lain. Ganti slug.` };

  if (id) await db.update(posts).set(data).where(eq(posts.id, id));
  else {
    const [row] = await db.insert(posts).values(data).returning({ id: posts.id });
    updateTag(postsTag);
    redirect(`/admin/blog/${row.id}?baru=1`);
  }
  updateTag(postsTag);
  refresh();
  return { ok: true, message: status === "published" ? `Tersimpan dan tayang di ${url}.` : "Draf tersimpan (belum tampil di situs)." };
}

export async function deletePost(id: number) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, Number(id)));
  updateTag(postsTag);
  redirect("/admin/blog");
}
