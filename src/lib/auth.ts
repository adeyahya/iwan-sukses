import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

// Satu akun admin: kata sandi dari ADMIN_PASSWORD, sesi berupa cookie bertanda tangan HMAC
// (SESSION_SECRET) yang berlaku 7 hari. Tidak ada data sesi di server.
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

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

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD belum diisi. Lihat .env.example.");
  // Bandingkan hash agar panjang input tidak bocor lewat waktu respons
  return safeEqual(sign(`pw:${input}`), sign(`pw:${expected}`));
}

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${expires}.${sign(`session:${expires}`)}`;
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

export async function isAdmin() {
  // Masa berlaku dibandingkan dengan waktu sekarang, jadi selalu dihitung saat permintaan
  await connection();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  return safeEqual(signature, sign(`session:${expires}`));
}

// Panggil di setiap halaman admin dan di awal setiap server action admin
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
