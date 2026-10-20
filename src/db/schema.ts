import { blob, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

// Video yang diunggah dari admin, juga di database. Video besar, jadi isinya dipecah per 4 MB
// (video_chunks): unggahan dikirim per potongan, dan /video/<id> hanya membaca potongan yang
// diminta browser (HTTP Range, wajib untuk Safari). Video baru tampil setelah semua potongan masuk (done).
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const videoChunks = sqliteTable(
  "video_chunks",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    data: blob("data", { mode: "buffer" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.videoId, t.idx] })],
);

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


// ── Login admin (better-auth, src/lib/auth.ts) ──
// Tabel bawaan better-auth: user, session, account (akun Google), verification (state OAuth).
// Nama kunci (camelCase) harus sama dengan nama field better-auth; nama kolom boleh snake_case.

const createdAt = () => integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date());
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

// Semua akun adalah admin. Akun pertama: orang pertama yang masuk saat tabel kosong; berikutnya hanya lewat undangan.
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// Email Google yang boleh masuk sebagai admin. Undangan terpakai (dihapus) saat akun itu pertama kali masuk.
export const invites = sqliteTable("invites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});
