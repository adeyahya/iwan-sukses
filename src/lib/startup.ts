import { randomUUID } from "node:crypto";

// Token sekali pakai antara instrumentation dan route /api/startup-revalidate (satu proses yang sama)
const store = globalThis as { __startupToken?: string };

export function takeStartupToken(token: string | null) {
  if (!store.__startupToken || token !== store.__startupToken) return false;
  delete store.__startupToken;
  return true;
}

/** revalidateTag hanya bisa dipanggil dalam request, jadi server memanggil route-nya sendiri begitu siap */
export function refreshCacheAfterStart() {
  const token = randomUUID();
  store.__startupToken = token;
  const url = `http://127.0.0.1:${process.env.PORT ?? 3000}/api/startup-revalidate`;
  void (async () => {
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await fetch(url, { method: "POST", headers: { "x-startup-token": token } });
        if (res.ok) return console.log("cache: konten disegarkan dari database");
      } catch {
        // server belum mendengarkan
      }
    }
    console.error("cache: gagal menyegarkan konten saat start; simpan sesuatu di admin untuk menyegarkan");
  })();
}
