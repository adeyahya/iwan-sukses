import { Suspense } from "react";

import { AdminNav } from "@/app/admin/(panel)/admin-nav";

// Kerangka statis tampil langsung; isi halaman (yang membaca sesi dan database) menyusul di dalam Suspense
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_1fr]">
      <AdminNav />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-[880px]">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat…</p>}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
