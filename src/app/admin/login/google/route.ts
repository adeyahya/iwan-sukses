import { redirect } from "next/navigation";
import { connection, type NextRequest } from "next/server";

import { googleAuthUrl, googleConfigured, oauthOrigin } from "@/lib/auth";

// Mulai login: arahkan ke halaman pilih akun Google
export async function GET(request: NextRequest) {
  // state dan PKCE baru untuk setiap permintaan; jangan sampai di-prerender
  await connection();
  if (!googleConfigured) redirect("/admin/login?error=config");
  redirect(await googleAuthUrl(oauthOrigin(request)));
}
