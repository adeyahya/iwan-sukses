"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";

const DEFAULT_META_PIXEL_ID = "1471942668166508";

// ID pixel Meta selalu angka. Nilai lain tidak dimasukkan ke skrip inline.
function metaPixelId() {
  const configured = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (configured && /^\d+$/.test(configured)) return configured;
  return DEFAULT_META_PIXEL_ID;
}

const META_PIXEL_ID = metaPixelId();

// PageView pertama dikirim oleh skrip dasar. Efek ini hanya untuk navigasi klien berikutnya.
function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (trackedUrl.current === null) {
      trackedUrl.current = url;
      return;
    }
    if (trackedUrl.current === url) return;
    trackedUrl.current = url;
    window.fbq?.("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* Pixel resmi Meta memakai img 1×1; next/image tidak berjalan tanpa JavaScript. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelPageView />
      </Suspense>
    </>
  );
}
