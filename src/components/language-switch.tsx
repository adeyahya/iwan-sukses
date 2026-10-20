"use client";

import { GlobeIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { useDict, useLang } from "@/i18n/client";
import { langNames, localePath, locales, stripLocale, type Lang } from "@/i18n/config";
import { cn } from "@/lib/utils";

// Ganti bahasa di halaman yang sama; query (desain konfigurator) dan hash ikut dibawa.
// compact: satu tombol ke bahasa lain (header desktop yang sempit); default: semua bahasa berjajar.
export function LanguageSwitch({ compact, className }: { compact?: boolean; className?: string }) {
  const lang = useLang();
  const { language } = useDict();
  const path = stripLocale(usePathname());

  const link = (l: Lang, label: React.ReactNode, cls: string) => (
    <a
      key={l}
      href={localePath(l, path)}
      hrefLang={l}
      lang={l}
      aria-label={compact ? langNames[l] : undefined}
      aria-current={l === lang ? "true" : undefined}
      onClick={(e) => {
        e.preventDefault();
        window.location.assign(localePath(l, path) + window.location.search + window.location.hash);
      }}
      className={cls}
    >
      {label}
    </a>
  );

  if (compact) {
    const other = locales.find((l) => l !== lang)!;
    return link(
      other,
      <>
        <GlobeIcon aria-hidden className="size-4" />
        {other}
      </>,
      cn("flex items-center gap-1 rounded-sm px-1.5 py-1 text-sm font-semibold text-muted-foreground uppercase transition-colors hover:text-foreground", className),
    );
  }

  return (
    <div role="group" aria-label={language.label} className={cn("flex items-center gap-1 text-sm font-semibold", className)}>
      <GlobeIcon aria-hidden className="mr-0.5 size-4 text-muted-foreground" />
      {locales.map((l) =>
        link(
          l,
          langNames[l],
          cn("rounded-sm px-2 py-1 transition-colors", l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
        ),
      )}
    </div>
  );
}
