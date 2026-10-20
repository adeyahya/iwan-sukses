import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { nextCookies } from "better-auth/next-js";
import { asc, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { db } from "@/db";
import { account, invites, session, user, verification } from "@/db/schema";
import { siteUrl } from "@/lib/site";

// Login admin dengan better-auth, hanya lewat Google. Yang boleh masuk: orang pertama saat tabel user
// masih kosong, akun yang sudah ada, dan email yang diundang admin (menu Pengguna).
// Endpoint better-auth ada di /api/auth/* (src/app/api/auth/[...all]/route.ts).

// Tombol "Masuk tanpa Google" di halaman login hanya ada saat `next dev`
export const devLoginEnabled = process.env.NODE_ENV === "development";

export const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Hanya untuk `next dev`: masuk sebagai akun pertama tanpa Google (dibuat dulu kalau belum ada).
// Plugin ini tidak dipasang di produksi, jadi endpoint-nya tidak ada sama sekali.
const devLogin = {
  id: "dev-login",
  endpoints: {
    devLogin: createAuthEndpoint("/dev-login", { method: "POST" }, async (ctx) => {
      const [first] = await db.select({ id: user.id }).from(user).orderBy(asc(user.createdAt)).limit(1);
      const target = first
        ? await ctx.context.internalAdapter.findUserById(first.id)
        : await ctx.context.internalAdapter.createUser({ name: "Dev", email: "dev@localhost", emailVerified: true }, { method: "admin" });
      if (!target) throw new APIError("INTERNAL_SERVER_ERROR");
      const created = await ctx.context.internalAdapter.createSession(target.id);
      await setSessionCookie(ctx, { session: created, user: target });
      return ctx.json({ ok: true });
    }),
  },
};

export const auth = betterAuth({
  // Alamat publik situs, dibaca saat server jalan (bukan saat build): redirect URI Google = <alamat>/api/auth/callback/google
  baseURL: process.env.BETTER_AUTH_URL || siteUrl,
  // Saat `next build` belum ada rahasia (dan tidak ada sesi dibuat); saat jalan SESSION_SECRET wajib diisi
  secret: process.env.SESSION_SECRET ?? (process.env.NEXT_PHASE === "phase-production-build" ? "build-time-placeholder-never-used-for-sessions" : undefined),
  database: drizzleAdapter(db, { provider: "sqlite", schema: { user, session, account, verification } }),
  telemetry: { enabled: false },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Saringan akun baru. Kode error dikirim balik ke /admin/login?error=<kode>.
        async before(newUser) {
          if (!newUser.emailVerified) throw new APIError("FORBIDDEN", { code: "unverified", message: "Email belum terverifikasi" });
          const [{ n }] = await db.select({ n: count() }).from(user);
          if (n === 0) return;
          const used = await db.delete(invites).where(eq(invites.email, newUser.email.toLowerCase())).returning({ id: invites.id });
          if (!used.length) throw new APIError("FORBIDDEN", { code: "not_invited", message: "Belum diundang" });
        },
      },
    },
  },
  // nextCookies harus terakhir: meneruskan cookie dari pemanggilan auth.api di server action
  plugins: [...(devLoginEnabled ? [devLogin] : []), nextCookies()],
});

// Akun yang sedang masuk, atau null
export async function currentUser() {
  // Sesi dibaca dari cookie per permintaan
  await connection();
  const result = await auth.api.getSession({ headers: await headers() });
  return result ? { id: result.user.id, name: result.user.name, email: result.user.email } : null;
}

export async function isAdmin() {
  return (await currentUser()) !== null;
}

// Panggil di setiap halaman admin dan di awal setiap server action admin
export async function requireAdmin() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");
  return me;
}
