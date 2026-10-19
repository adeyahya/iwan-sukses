"use client";

import { BoxIcon, CheckIcon, DoorOpenIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { ArDialog } from "@/components/configurator/ar-dialog";
import { Choice, ConfiguratorLayout, ConfiguratorSuspense, Intro, itemClass, QuoteCard, SizeField, useDesignLink, Warnings } from "@/components/configurator/configurator-ui";
import { SceneViewer } from "@/components/configurator/scene-viewer";
import type { ShowerScene } from "@/components/configurator/scenes/shower-scene";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";
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
  showerPath,
  sizeLimits,
  summaryText,
  thicknesses,
  warnings,
  type Extra,
  type ShowerConfig,
  type ShowerPrices,
} from "@/lib/configurators/shower";
import { cn } from "@/lib/utils";

const intro = (
  <Intro
    title="Rancang shower box Anda"
    lead="Pilih model, ukuran, dan jenis kaca. Lihat hasilnya dalam 3D, lalu kirim spesifikasinya ke kami untuk penawaran resmi."
  />
);

const loadScene = () => import("@/components/configurator/scenes/shower-scene").then((m) => m.ShowerScene);

type Props = { prices: ShowerPrices; stores: Store[] };

export function ShowerConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={intro}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  // Buka desain dari link (?model=...&lebar=...) bila ada
  const [config, setConfig] = useState<ShowerConfig>(() =>
    params.has("model") ? paramsToConfig(new URLSearchParams(params.toString())) : defaultConfig,
  );
  const [doorOpen, setDoorOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<ShowerScene | null>(null);
  const set = <K extends keyof ShowerConfig>(key: K, value: ShowerConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(showerPath, configToParams(config).toString());
  const e = estimate(config, prices);
  const door = hasDoor(config.layout);
  const availableExtras = extrasList.filter((x) => x.value === "coating" || door);

  const toggleDoor = () => {
    const next = !doorOpen;
    setDoorOpen(next);
    sceneRef.current?.setDoorOpen(next);
  };
  const onReady = useCallback((s: ShowerScene) => s.setDoorOpen(false), []);

  return (
    <ConfiguratorLayout
      viewer={
        <SceneViewer load={loadScene} config={config} sceneRef={sceneRef} onReady={onReady}>
          <Button variant="spark" size="lg" className="absolute bottom-3 left-3 z-10" onClick={() => setArOpen(true)}>
            <BoxIcon />
            Lihat di ruangan Anda
          </Button>
          {door && (
            <Button variant="outline" size="lg" className="absolute right-3 bottom-3 z-10 bg-background" aria-pressed={doorOpen} onClick={toggleDoor}>
              <DoorOpenIcon />
              {doorOpen ? "Tutup pintu" : "Buka pintu"}
            </Button>
          )}
        </SceneViewer>
      }
    >
      <ArDialog
        open={arOpen}
        onOpenChange={setArOpen}
        viewer={sceneRef}
        link={design.link}
        subject="Shower box"
        steps={[
          "Arahkan kamera ke lantai kamar mandi dan gerakkan HP perlahan.",
          "Ketuk layar untuk menaruh shower box, geser untuk memindahkan.",
          "Berjalanlah mengelilinginya untuk melihat dari berbagai sisi.",
        ]}
      />

      {intro}

      <Choice label="Model" value={config.layout} options={layouts} onChange={(v) => set("layout", v)} twoCols />

      <div className="grid gap-6">
        <SizeField label={config.layout === "sudut" ? "Lebar depan" : "Lebar"} value={config.width} limits={sizeLimits.width} onChange={(v) => set("width", v)} />
        {(config.layout === "walkin" || config.layout === "sudut") && (
          <SizeField
            label={config.layout === "sudut" ? "Lebar samping" : "Jarak ke dinding belakang"}
            value={config.depth}
            limits={sizeLimits.depth}
            onChange={(v) => set("depth", v)}
          />
        )}
        <SizeField label="Tinggi" value={config.height} limits={sizeLimits.height} onChange={(v) => set("height", v)} />
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
        <ToggleGroup multiple aria-label="Tambahan" value={config.extras} onValueChange={(v) => set("extras", v as Extra[])} className="w-full flex-col items-stretch">
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

      <Warnings notes={warnings(config)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/shower.ts */}
      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note="Perkiraan awal (contoh harga untuk draft). Harga final mengikuti survei dan pengukuran di lokasi."
        stores={stores}
        message={(link) => summaryText(config, link, prices)}
        design={design}
        shareTitle="Desain shower box saya"
      />
    </ConfiguratorLayout>
  );
}
