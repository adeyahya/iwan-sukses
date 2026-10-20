import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { count, eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { db } from "@/db";
import { invites, users } from "@/db/schema";

// Admin masuk lewat Google (OAuth 2.0 + PKCE, tanpa library). Yang boleh masuk: orang pertama saat
// tabel users masih kosong, akun yang sudah ada, dan email yang diundang admin. Sesi berupa cookie
// bertanda tangan HMAC (SESSION_SECRET) berisi id akun, berlaku 7 hari. Akun yang dihapus langsung
// kehilangan aksesnya karena setiap permintaan memeriksa akunnya masih ada.
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

// Tombol "Masuk tanpa Google" di halaman login hanya ada saat `next dev`
export const devLoginEnabled = process.env.NODE_ENV === "development";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET belum diisi (minimal 32 karakter). Lihat .env.example.");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// ── Google ──

const OAUTH_COOKIE = "google_oauth";
export const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const googleCallbackPath = "/admin/login/google/callback";

// Alamat Google untuk memulai login; state + PKCE disimpan di cookie singkat untuk dicek saat kembali
export async function googleAuthUrl(origin: string) {
  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  (await cookies()).set(OAUTH_COOKIE, `${state}.${verifier}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin/login/google",
    maxAge: 600,
  });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: origin + googleCallbackPath,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

type GoogleProfile = { sub: string; email: string; email_verified: boolean; name?: string; picture?: string };

// Tukar kode dari Google dengan profil akun. null kalau state tidak cocok atau Google menolak.
export async function googleProfile(origin: string, code: string, state: string): Promise<GoogleProfile | null> {
  const jar = await cookies();
  const [expected, verifier] = (jar.get(OAUTH_COOKIE)?.value ?? "").split(".");
  jar.delete({ name: OAUTH_COOKIE, path: "/admin/login/google" });
  if (!expected || !verifier || !safeEqual(state, expected)) return null;

  const token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: origin + googleCallbackPath,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!token.ok) return null;
  const { access_token } = (await token.json()) as { access_token: string };
  // Profil diambil langsung dari Google lewat HTTPS, jadi tidak perlu memverifikasi tanda tangan id_token
  const profile = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
  return profile.ok ? ((await profile.json()) as GoogleProfile) : null;
}

export type SignInResult = { userId: number } | { error: "unverified" | "not_invited" };

// Tentukan akun untuk profil Google: akun yang sudah ada, admin pertama, atau pemakai undangan
export async function signInWithGoogle(p: GoogleProfile): Promise<SignInResult> {
  if (!p.email_verified) return { error: "unverified" };
  const email = p.email.toLowerCase();
  const profile = { name: p.name || email, email, googleId: p.sub, image: p.picture ?? null };
  // Transaksi "immediate" mengunci tulis, jadi dua orang bersamaan tidak bisa sama-sama jadi admin pertama
  return db.transaction(
    async (tx) => {
      // Cocokkan id Google dulu, lalu email (akun dev, atau email yang diganti di Google)
      const matches = await tx.select({ id: users.id, googleId: users.googleId }).from(users).where(or(eq(users.googleId, p.sub), eq(users.email, email)));
      const existing = matches.find((u) => u.googleId === p.sub) ?? matches[0];
      if (existing) {
        await tx.update(users).set(profile).where(eq(users.id, existing.id));
        return { userId: existing.id };
      }
      const [{ n }] = await tx.select({ n: count() }).from(users);
      const invited = await tx.delete(invites).where(eq(invites.email, email)).returning({ id: invites.id });
      if (n > 0 && !invited.length) return { error: "not_invited" as const };
      const [u] = await tx.insert(users).values(profile).returning({ id: users.id });
      return { userId: u.id };
    },
    { behavior: "immediate" },
  );
}

// ── Sesi ──

export async function createSession(userId: number) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${userId}.${expires}.${sign(`session:${userId}:${expires}`)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

// Akun yang sedang masuk, atau null
export async function currentUser() {
  // Masa berlaku dibandingkan dengan waktu sekarang, jadi selalu dihitung saat permintaan
  await connection();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature || Number(expires) * 1000 < Date.now()) return null;
  if (!safeEqual(signature, sign(`session:${id}:${expires}`))) return null;
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, Number(id)));
  return user ?? null;
}

export async function isAdmin() {
  return (await currentUser()) !== null;
}

// Panggil di setiap halaman admin dan di awal setiap server action admin
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  return user;
}
