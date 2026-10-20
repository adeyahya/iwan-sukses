import { count } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/app/admin/login/auth-card";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { user } from "@/db/schema";
import { devLogin, signInWithGoogle } from "@/lib/admin/actions";
import { devLoginEnabled, googleConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk" };

const errors: Record<string, string> = {
  not_invited: "Akun Google ini belum diundang. Minta admin mengundang email Anda di menu Pengguna.",
  unverified: "Email akun Google ini belum terverifikasi.",
  access_denied: "Masuk dibatalkan.",
  google: "Gagal masuk lewat Google. Coba lagi.",
  config: "Login Google belum diatur: isi GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET.",
};

// Sesi dan jumlah akun dibaca per permintaan, jadi dirender di dalam Suspense
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Suspense>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const [{ n }] = await db.select({ n: count() }).from(user);
  const firstRun = n === 0;
  const message = typeof error === "string" ? (errors[error] ?? errors.google) : !googleConfigured ? errors.config : null;

  return (
    <AuthCard
      title={firstRun ? "Buat akun admin pertama" : "Masuk ke panel admin"}
      description={
        firstRun ? "Belum ada akun. Akun Google pertama yang masuk menjadi admin dan bisa mengundang admin lain." : "Atur konten, foto, lokasi, dan harga situs."
      }
    >
      {message && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {message}
        </p>
      )}
      <form action={signInWithGoogle}>
        <Button type="submit" size="xl" className="w-full" disabled={!googleConfigured}>
          <GoogleIcon />
          Masuk dengan Google
        </Button>
      </form>
      {devLoginEnabled && (
        <form action={devLogin} className="mt-4 border-t border-dashed pt-4">
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Masuk tanpa Google (dev)
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Hanya muncul saat <code>pnpm dev</code>. Masuk sebagai akun pertama{firstRun && " (dibuat otomatis: dev@localhost)"}.
          </p>
        </form>
      )}
    </AuthCard>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.8 14c-.2-.7-.4-1.3-.4-2s.2-1.4.4-2V7.1H2.1A11 11 0 0 0 1 12c0 1.8.4 3.4 1.1 4.9L5.8 14Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1L5.8 10c.9-2.7 3.3-4.6 6.2-4.6Z" />
    </svg>
  );
}
