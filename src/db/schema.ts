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
