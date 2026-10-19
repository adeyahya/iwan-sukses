// Dijalankan sekali saat server mulai. Di produksi (`next start` / Docker):
// 1. Siapkan database (migrasi + isi awal), jadi image Docker tidak butuh tsx atau langkah terpisah.
// 2. Tandai konten cache basi. Halaman yang di-prerender saat build memakai database build,
//    bukan database di volume (/data), jadi isinya harus diambil ulang dari database yang sebenarnya.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { prepareDatabase } = await import("@/db/prepare");
  await prepareDatabase();
  const { refreshCacheAfterStart } = await import("@/lib/startup");
  refreshCacheAfterStart();
}
