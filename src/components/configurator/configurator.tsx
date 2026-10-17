"use client";

import { CheckIcon, DoorOpenIcon, LinkIcon, Share2Icon, TriangleAlertIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";

import { ShowerViewer } from "@/components/configurator/shower-viewer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  configToParams,
  defaultConfig,
  doorSides,
  estimate,
  extrasList,
  finishes,
  glassTypes,
  handles,
  hasDoor,
  layouts,
  paramsToConfig,
  rupiah,
  sizeLimits,
  summaryText,
  thicknesses,
  warnings,
  type Extra,
  type ShowerConfig,
} from "@/lib/configurator";
import { waLink, whatsapp } from "@/lib/data";
import { cn } from "@/lib/utils";

const itemClass =
  "h-auto min-h-11 flex-1 flex-col items-start gap-0.5 rounded-md bg-background px-3 py-2.5 text-left font-semibold whitespace-normal data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground [&[data-pressed]_small]:text-primary-foreground/75";

function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
  twoCols,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; desc?: string; color?: string }[];
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

function Size({ label, value, limits, onChange }: { label: string; value: number; limits: { min: number; max: number; step: number }; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-heading text-base font-bold tabular-nums">{value} cm</span>
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

const noop = () => () => {};
const useOrigin = () => useSyncExternalStore(noop, () => window.location.origin, () => "");
const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);

const intro = (
  <div>
    <span className="eyebrow mb-3 block">Konfigurator</span>
    <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.015em] sm:text-4xl sm:leading-[42px]">
      Rancang shower box Anda
      <span aria-hidden className="spark" />
    </h1>
    <p className="mt-3 text-muted-foreground">
      Pilih model, ukuran, dan jenis kaca. Lihat hasilnya dalam 3D, lalu kirim spesifikasinya ke kami untuk penawaran resmi.
    </p>
  </div>
);

// Pilihan dibaca dari URL, jadi bagian interaktif dirender di browser;
// kerangka dan judul tetap ikut HTML statis lewat fallback Suspense.
export function Configurator() {
  return (
    <Suspense
      fallback={
        <div className="grid lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="h-[42vh] min-h-[280px] border-b bg-[#EEF0F2] lg:h-[calc(100vh-76px)] lg:border-r lg:border-b-0" />
          <div className="grid content-start gap-8 px-4 py-8 sm:px-8">
            {intro}
            <p className="text-sm text-muted-foreground">Memuat konfigurator…</p>
          </div>
        </div>
      }
    >
      <ConfiguratorInner />
    </Suspense>
  );
}

function ConfiguratorInner() {
  const params = useSearchParams();
  // Buka desain dari link (?model=...&lebar=...) bila ada
  const [config, setConfig] = useState<ShowerConfig>(() =>
    params.has("model") ? paramsToConfig(new URLSearchParams(params.toString())) : defaultConfig,
  );
  const [copiedLink, setCopiedLink] = useState("");
  const origin = useOrigin();
  const canShare = useCanShare();
  const [doorOpen, setDoorOpen] = useState(false);
  const [store, setStore] = useState<string>(whatsapp.probolinggo.number);
  const set = <K extends keyof ShowerConfig>(key: K, value: ShowerConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const e = estimate(config);
  const door = hasDoor(config.layout);
  const notes = warnings(config);

  const qs = configToParams(config).toString();
  const link = origin ? `${origin}/konfigurator?${qs}` : "";
  const copied = copiedLink !== "" && copiedLink === link;

  // Simpan setiap perubahan ke URL supaya desain bisa dibagikan atau dibuka lagi
  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  }, [qs]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
    } catch {
      window.prompt("Salin link desain ini:", link);
    }
  }

  function shareLink() {
    navigator.share({ title: "Desain shower box saya", text: "Desain shower box dari konfigurator Iwan Sukses", url: link }).catch(() => {});
  }

  const availableExtras = extrasList.filter((x) => x.value === "coating" || door);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
      {/* Tampilan 3D: menempel di atas saat menggulir di HP, kolom kiri di desktop */}
      <div className="sticky top-16 z-10 h-[42vh] min-h-[280px] border-b lg:top-[76px] lg:h-[calc(100vh-76px)] lg:border-r lg:border-b-0">
        <ShowerViewer config={config} doorOpen={doorOpen && door} />
        {door && (
          <Button variant="outline" size="lg" className="absolute right-3 bottom-3 bg-background" aria-pressed={doorOpen} onClick={() => setDoorOpen((o) => !o)}>
            <DoorOpenIcon />
            {doorOpen ? "Tutup pintu" : "Buka pintu"}
          </Button>
        )}
      </div>

      <div className="grid gap-8 px-4 py-8 sm:px-8 lg:px-8">
        {intro}

        <Choice label="Model" value={config.layout} options={layouts} onChange={(v) => set("layout", v)} twoCols />

        <div className="grid gap-6">
          <Size label={config.layout === "sudut" ? "Lebar depan" : "Lebar"} value={config.width} limits={sizeLimits.width} onChange={(v) => set("width", v)} />
          {(config.layout === "walkin" || config.layout === "sudut") && (
            <Size
              label={config.layout === "sudut" ? "Lebar samping" : "Jarak ke dinding belakang"}
              value={config.depth}
              limits={sizeLimits.depth}
              onChange={(v) => set("depth", v)}
            />
          )}
          <Size label="Tinggi" value={config.height} limits={sizeLimits.height} onChange={(v) => set("height", v)} />
        </div>

        {door && (
          <>
            <Choice label="Posisi pintu" value={config.doorSide} options={doorSides} onChange={(v) => set("doorSide", v)} />
            <Choice label="Gagang pintu" value={config.handle} options={handles} onChange={(v) => set("handle", v)} />
          </>
        )}

        <Choice label="Jenis kaca" value={config.glass} options={glassTypes} onChange={(v) => set("glass", v)} />
        <Choice label="Tebal kaca tempered" value={config.thickness} options={thicknesses} onChange={(v) => set("thickness", v)} />
        <Choice label="Warna aksesoris" value={config.finish} options={finishes} onChange={(v) => set("finish", v)} />

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-semibold">
            Tambahan <span className="font-normal text-muted-foreground">(boleh lebih dari satu)</span>
          </legend>
          <ToggleGroup
            multiple
            aria-label="Tambahan"
            value={config.extras}
            onValueChange={(v) => set("extras", v as Extra[])}
            className="w-full flex-col items-stretch"
          >
            {availableExtras.map((x) => (
              <ToggleGroupItem key={x.value} value={x.value} variant="outline" className={cn(itemClass, "relative pr-10")}>
                {x.label}
                <small className="text-xs leading-4 font-normal text-muted-foreground">{x.desc}</small>
                {config.extras.includes(x.value) && <CheckIcon className="absolute top-1/2 right-3 -translate-y-1/2" />}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>

        <Choice
          label="Pemasangan"
          value={config.install ? "ya" : "tidak"}
          options={[
            { value: "ya", label: "Dipasang tim kami" },
            { value: "tidak", label: "Ambil sendiri" },
          ]}
          onChange={(v) => set("install", v === "ya")}
        />

        {notes.length > 0 && (
          <ul className="grid gap-2 rounded-lg border border-input bg-secondary p-4 text-sm" aria-label="Saran produksi">
            {notes.map((n) => (
              <li key={n} className="flex gap-2">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-accent-text" />
                <span>
                  <b className="font-semibold">Saran: </b>
                  {n}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Estimasi harga</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ul className="grid gap-2 text-sm">
              {e.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{l.label}</span>
                  <span className="tabular-nums">{rupiah(l.value)}</span>
                </li>
              ))}
            </ul>
            <Separator />
            <p className="font-heading text-2xl leading-8 font-bold tabular-nums">
              {rupiah(e.low)} – {rupiah(e.high)}
            </p>
            {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurator.ts */}
            <p className="text-xs leading-4 text-muted-foreground">
              Perkiraan awal (contoh harga untuk draft). Harga final mengikuti survei dan pengukuran di lokasi.
            </p>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <ToggleGroup aria-label="Kirim ke toko" value={[store]} onValueChange={(v) => v[0] && setStore(v[0])} className="w-full">
              {[whatsapp.probolinggo, whatsapp.bali].map((s) => (
                <ToggleGroupItem key={s.number} value={s.number} variant="outline" className={cn(itemClass, "items-center text-center")}>
                  {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <a href={waLink(store, summaryText(config, link))} target="_blank" rel="noopener" className={buttonVariants({ variant: "spark", size: "xl" })}>
              Kirim spesifikasi lewat WhatsApp
            </a>
            <div className="flex gap-2">
              <Button variant="outline" size="xl" className="flex-1" onClick={copyLink} disabled={!link}>
                {copied ? <CheckIcon /> : <LinkIcon />}
                {copied ? "Link tersalin" : "Salin link desain"}
              </Button>
              {canShare && (
                <Button variant="outline" size="xl" onClick={shareLink} disabled={!link} aria-label="Bagikan desain">
                  <Share2Icon />
                  <span className="hidden sm:inline">Bagikan</span>
                </Button>
              )}
            </div>
            <p className="text-xs leading-4 text-muted-foreground">Link menyimpan semua pilihan Anda, dan ikut terkirim di pesan WhatsApp.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
