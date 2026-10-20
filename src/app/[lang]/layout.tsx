import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { fontVariables } from "@/app/fonts";
import { LangProvider } from "@/i18n/client";
import { hasLang, locales, ogLocales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { siteName, siteUrl } from "@/lib/site";

import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLang(lang)) return {};
  const { meta } = dictionaries[lang];
  const page = pageMetadata(lang, "/", { title: meta.title, description: meta.description });
  return {
    ...page,
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: `%s — ${siteName}` },
    applicationName: siteName,
    keywords: meta.keywords,
    authors: [{ name: "CV Iwan Sukses Cemerlang" }],
    openGraph: { ...page.openGraph, type: "website", siteName, locale: ogLocales[lang] },
    twitter: { ...page.twitter, card: "summary_large_image" },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "light",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLang(lang)) notFound();
  return (
    <html lang={lang} className={`${fontVariables} antialiased`}>
      <body className="min-h-full">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
