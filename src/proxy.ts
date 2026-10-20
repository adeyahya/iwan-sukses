import { NextResponse, type NextRequest } from "next/server";

import { defaultLang, locales } from "@/i18n/config";

// Semua halaman publik ada di app/[lang]. URL tanpa awalan bahasa (/, /blog, /konfigurator/...)
// adalah Bahasa Indonesia: ditulis ulang ke /id/... tanpa redirect, jadi link lama dan link desain
// yang sudah dibagikan lewat WhatsApp tetap berfungsi.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLang}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Lewati aset, API, admin, media, file berekstensi (robots.txt, sitemap.xml, icon.svg) dan apple-icon
  matcher: ["/((?!_next|api|admin|media|video|proyek|logo|apple-icon|.*\\..*).*)"],
};
