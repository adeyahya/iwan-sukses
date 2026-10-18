import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 sm:p-8">
        <Image src="/logo/lockup-horizontal_black.svg" alt="Iwan Sukses" width={146} height={40} className="mb-6 h-9 w-auto" />
        <h1 className="mb-1 font-heading text-xl font-bold">Masuk ke panel admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">Atur konten, foto, lokasi, dan harga situs.</p>
        <LoginForm />
      </div>
    </main>
  );
}
