// Hanya diimpor dari komponen client (konfigurator), jadi tidak perlu "use client" sendiri.
import { CheckIcon, LinkIcon, Share2Icon, TriangleAlertIcon } from "lucide-react";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { rupiah, type Option, type PriceLine, type Range } from "@/lib/configurators/shared";
import { waLink, type Store } from "@/lib/data";
import { cn } from "@/lib/utils";

// Komponen UI yang dipakai bersama oleh semua konfigurator.

export const itemClass =
  "h-auto min-h-11 flex-1 flex-col items-start gap-0.5 rounded-md bg-background px-3 py-2.5 text-left font-semibold whitespace-normal data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground [&[data-pressed]_small]:text-primary-foreground/75";

export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
  twoCols,
}: {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (v: T) => void;
  twoCols?: boolean;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <ToggleGroup
        aria-label={label}
        value={[String(value)]}
        onValueChange={(v) => {
          const next = options.find((o) => String(o.value) === v[0]);
          if (next) onChange(next.value);
        }}
        className={cn("w-full items-stretch", twoCols && "flex-wrap")}
      >
        {options.map((o) => (
          <ToggleGroupItem key={String(o.value)} value={String(o.value)} variant="outline" className={cn(itemClass, twoCols && "min-w-[calc(50%-0.25rem)]")}>
            <span className="flex items-center gap-2">
              {o.color && <span aria-hidden className="size-3.5 rounded-full border border-black/20" style={{ background: o.color }} />}
              {o.label}
            </span>
            {o.desc && <small className="text-xs leading-4 font-normal text-muted-foreground">{o.desc}</small>}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  );
}

export function SizeField({
  label,
  value,
  limits,
  onChange,
  unit = "cm",
  input,
}: {
  label: string;
  value: number;
  limits: Range;
  onChange: (v: number) => void;
  unit?: string;
  /** Tampilkan kotak angka untuk ukuran presisi */
  input?: boolean;
}) {
  const clamp = (n: number) => Math.min(limits.max, Math.max(limits.min, Math.round(n / limits.step) * limits.step));
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {input ? (
          <label className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              aria-label={`${label} (${unit})`}
              min={limits.min}
              max={limits.max}
              step={limits.step}
              value={value}
              onChange={(e) => e.target.value !== "" && onChange(clamp(Number(e.target.value)))}
              className="h-9 w-20 rounded-md text-right font-heading text-base font-bold tabular-nums"
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </label>
        ) : (
          <span className="font-heading text-base font-bold tabular-nums">
            {value}
            {unit === "°" ? "°" : ` ${unit}`}
          </span>
        )}
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={limits.min}
        max={limits.max}
        step={limits.step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-1.5"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{limits.min}</span>
        <span>{limits.max}</span>
      </div>
    </div>
  );
}

export function Intro({ title, lead }: { title: string; lead: string }) {
  const { ui } = useDict().configurator;
  return (
    <div>
      <span className="eyebrow mb-3 block">{ui.overline}</span>
      <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.015em] sm:text-4xl sm:leading-[42px]">
        {title}
        <span aria-hidden className="spark" />
      </h1>
      <p className="mt-3 text-muted-foreground">{lead}</p>
    </div>
  );
}

// Pilihan dibaca dari URL, jadi bagian interaktif dirender di browser;
// kerangka dan judul tetap ikut HTML statis lewat fallback Suspense.
export function ConfiguratorSuspense({ intro, children }: { intro: React.ReactNode; children: React.ReactNode }) {
  const { ui } = useDict().configurator;
  return (
    <Suspense
      fallback={
        <div className="grid lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="h-[42vh] min-h-[280px] border-b bg-[#EEF0F2] lg:h-[calc(100vh-76px)] lg:border-r lg:border-b-0" />
          <div className="grid content-start gap-8 px-4 py-8 sm:px-8">
            {intro}
            <p className="text-sm text-muted-foreground">{ui.loading}</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function ConfiguratorLayout({ viewer, children }: { viewer: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
      {/* Tampilan 3D menempel di atas saat menggulir. z-30: di atas kontrol yang sedang fokus
          (z-10), di bawah header (z-40). */}
      <div className="sticky top-16 z-30 h-[42vh] min-h-[280px] border-b lg:top-[76px] lg:h-[calc(100vh-76px)] lg:border-r lg:border-b-0">
        {viewer}
      </div>
      <div className="grid gap-8 px-4 py-8 sm:px-8 lg:px-8">{children}</div>
    </div>
  );
}

export function Warnings({ notes }: { notes: string[] }) {
  const { ui } = useDict().configurator;
  if (!notes.length) return null;
  return (
    <ul className="grid gap-2 rounded-lg border border-input bg-secondary p-4 text-sm" aria-label={ui.advice}>
      {notes.map((n) => (
        <li key={n} className="flex gap-2">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-accent-text" />
          <span>
            <b className="font-semibold">{ui.adviceLabel}</b>
            {n}
          </span>
        </li>
      ))}
    </ul>
  );
}

const noop = () => () => {};
const useOrigin = () => useSyncExternalStore(noop, () => window.location.origin, () => "");
const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);

/** Simpan pilihan di URL dan sediakan link desain yang bisa disalin/dibagikan.
 *  link = halaman dalam bahasa pengunjung; staffLink = versi Bahasa Indonesia untuk pesan WhatsApp ke toko. */
export function useDesignLink(path: string, qs: string) {
  const origin = useOrigin();
  const canShare = useCanShare();
  const lang = useLang();
  const { ui } = useDict().configurator;
  const [copiedLink, setCopiedLink] = useState("");
  const link = origin ? `${origin}${localePath(lang, path)}?${qs}` : "";
  const staffLink = origin ? `${origin}${path}?${qs}` : "";

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  }, [qs]);

  return {
    link,
    staffLink,
    canShare,
    copied: copiedLink !== "" && copiedLink === link,
    async copy() {
      try {
        await navigator.clipboard.writeText(link);
        setCopiedLink(link);
      } catch {
        window.prompt(ui.copyPrompt, link);
      }
    },
    share(title: string) {
      navigator.share({ title, url: link }).catch(() => {});
    },
  };
}

export function QuoteCard({
  title,
  lines,
  price,
  note,
  message,
  design,
  shareTitle,
  stores,
}: {
  title?: string;
  lines: PriceLine[];
  price: React.ReactNode;
  note: string;
  message: (link: string) => string;
  design: ReturnType<typeof useDesignLink>;
  shareTitle: string;
  stores: Store[];
}) {
  const [store, setStore] = useState<string>(stores[0]?.number ?? "");
  const { ui } = useDict().configurator;
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{title ?? ui.estimate}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ul className="grid gap-2 text-sm">
          {lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{l.label}</span>
              <span className="tabular-nums">{rupiah(l.value)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="font-heading text-2xl leading-8 font-bold tabular-nums">{price}</div>
        <p className="text-xs leading-4 text-muted-foreground">{note}</p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <ToggleGroup aria-label={ui.sendTo} value={[store]} onValueChange={(v) => v[0] && setStore(v[0])} className="w-full">
          {stores.map((s) => (
            <ToggleGroupItem key={s.number} value={s.number} variant="outline" className={cn(itemClass, "items-center text-center")}>
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <a href={waLink(store, message(design.staffLink))} target="_blank" rel="noopener" className={buttonVariants({ variant: "spark", size: "xl" })}>
          {ui.send}
        </a>
        <div className="flex gap-2">
          <Button variant="outline" size="xl" className="flex-1" onClick={design.copy} disabled={!design.link}>
            {design.copied ? <CheckIcon /> : <LinkIcon />}
            {design.copied ? ui.copied : ui.copy}
          </Button>
          {design.canShare && (
            <Button variant="outline" size="xl" onClick={() => design.share(shareTitle)} disabled={!design.link} aria-label={ui.shareLabel}>
              <Share2Icon />
              <span className="hidden sm:inline">{ui.share}</span>
            </Button>
          )}
        </div>
        <p className="text-xs leading-4 text-muted-foreground">{ui.linkNote}</p>
      </CardFooter>
    </Card>
  );
}
