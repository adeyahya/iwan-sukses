import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Pengaturan situs: satu baris per bagian (company, hero, prices.kanopi, ...), nilainya JSON.
// Bentuk tiap nilai ada di src/lib/settings.ts.
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  image: text("image").notNull(),
  alt: text("alt").notNull().default(""),
  href: text("href").notNull().default("#galeri"),
  layout: text("layout", { enum: ["feature", "wide"] }),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const galleryItems = sqliteTable("gallery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  src: text("src").notNull(),
  video: text("video"),
  cat: text("cat", { enum: ["shower", "pintu", "kanopi", "railing", "fasad", "interior", "seni"] }).notNull(),
  title: text("title").notNull(),
  width: integer("width"),
  height: integer("height"),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tag: text("tag").notNull(),
  main: integer("main", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phoneLabel: text("phone_label").notNull(),
  phoneDisplay: text("phone_display").notNull(),
  phoneNumber: text("phone_number").notNull(),
  opens: text("opens").notNull().default(""),
  maps: text("maps").notNull().default(""),
  locality: text("locality").notNull().default(""),
  region: text("region").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

// Foto yang diunggah dari admin, disimpan di database agar ikut ke mana pun database dipindah.
// Disajikan lewat /media/<id>.
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Artikel blog. Isi disimpan sebagai dokumen JSON Tiptap dan dirender sendiri di server
// (src/components/blog/post-body.tsx), jadi tidak ada HTML mentah dari editor yang masuk ke halaman.
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  coverAlt: text("cover_alt").notNull().default(""),
  content: text("content", { mode: "json" }).notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
