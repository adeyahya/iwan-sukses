"use client";

import { BoxIcon, SunIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { ArDialog } from "@/components/configurator/ar-dialog";
import { Choice, ConfiguratorLayout, ConfiguratorSuspense, Intro, QuoteCard, SizeField, useDesignLink, Warnings } from "@/components/configurator/configurator-ui";
import { SceneViewer } from "@/components/configurator/scene-viewer";
import type { KanopiScene } from "@/components/configurator/scenes/kanopi-scene";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  defaultKanopi,
  frameColors,
  kanopiEstimate,
  kanopiGlasses,
  kanopiLimits,
  kanopiPath,
  kanopiSummary,
  kanopiThicknesses,
  kanopiToParams,
  kanopiWarnings,
  panelCount,
  paramsToKanopi,
  supports,
  type KanopiConfig,
} from "@/lib/configurators/kanopi";
import { rupiah } from "@/lib/configurators/shared";

const intro = (
  <Intro
    title="Rancang kanopi kaca Anda"
    lead="Atur ukuran, kemiringan, kaca, dan rangka. Geser waktu untuk melihat bayangan matahari di teras, lalu kirim spesifikasinya ke kami."
  />
);

const loadScene = () => import("@/components/configurator/scenes/kanopi-scene").then((m) => m.KanopiScene);

const sunTimes = [
  { value: "8", label: "Pagi" },
  { value: "12", label: "Siang" },
  { value: "16", label: "Sore" },
];

export function KanopiConfigurator() {
  return (
    <ConfiguratorSuspense intro={intro}>
      <Inner />
    </ConfiguratorSuspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const [config, setConfig] = useState<KanopiConfig>(() =>
    params.has("lebar") ? paramsToKanopi(new URLSearchParams(params.toString())) : defaultKanopi,
  );
  const [hour, setHour] = useState("8");
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<KanopiScene | null>(null);
  const set = <K extends keyof KanopiConfig>(key: K, value: KanopiConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(kanopiPath, kanopiToParams(config).toString());
  const e = kanopiEstimate(config);
  const onReady = useCallback((s: KanopiScene) => s.setSunHour(Number(hour)), [hour]);

  const changeHour = (h: string) => {
    setHour(h);
    sceneRef.current?.setSunHour(Number(h));
  };

  return (
    <ConfiguratorLayout
      viewer={
        <SceneViewer load={loadScene} config={config} sceneRef={sceneRef} onReady={onReady}>
          <Button variant="spark" size="lg" className="absolute bottom-3 left-3 z-10" onClick={() => setArOpen(true)}>
            <BoxIcon />
            Lihat di rumah Anda
          </Button>
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-background/95 p-1 pl-2">
            <SunIcon className="size-4 text-muted-foreground" aria-hidden />
            <ToggleGroup aria-label="Waktu matahari" value={[hour]} onValueChange={(v) => v[0] && changeHour(v[0])} spacing={0}>
              {sunTimes.map((t) => (
                <ToggleGroupItem
                  key={t.value}
                  value={t.value}
                  size="sm"
                  className="px-2.5 font-semibold data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
                >
                  {t.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </SceneViewer>
      }
    >
      <ArDialog
        open={arOpen}
        onOpenChange={setArOpen}
        viewer={sceneRef}
        link={design.link}
        subject="Kanopi"
        title="Lihat di rumah Anda"
        steps={[
          "Berdirilah di teras, menghadap dinding tempat kanopi akan dipasang.",
          "Arahkan kamera ke lantai dekat kaki dinding, lalu ketuk untuk menaruh.",
          "Mundur beberapa langkah dan lihat ke atas: kanopi melayang di tinggi pasang yang Anda pilih.",
        ]}
      />

      {intro}

      <div className="grid gap-6">
        <SizeField label="Lebar (sepanjang dinding)" value={config.width} limits={kanopiLimits.width} onChange={(v) => set("width", v)} />
        <SizeField label="Tonjolan dari dinding" value={config.projection} limits={kanopiLimits.projection} onChange={(v) => set("projection", v)} />
        <SizeField label="Tinggi pasang" value={config.height} limits={kanopiLimits.height} onChange={(v) => set("height", v)} />
        <SizeField label="Kemiringan" value={config.slope} limits={kanopiLimits.slope} unit="°" onChange={(v) => set("slope", v)} />
        <p className="-mt-2 text-sm text-muted-foreground">
          Terbagi menjadi <b className="text-foreground">{panelCount(config)} panel</b> selebar ±{Math.round(config.width / panelCount(config))} cm.
        </p>
      </div>

      <Choice label="Sistem rangka" value={config.support} options={supports} onChange={(v) => set("support", v)} />
      <Choice label="Warna rangka" value={config.frame} options={frameColors} onChange={(v) => set("frame", v)} />
      <Choice label="Jenis kaca" value={config.glass} options={kanopiGlasses} onChange={(v) => set("glass", v)} />
      <Choice label="Tebal kaca" value={config.thickness} options={kanopiThicknesses} onChange={(v) => set("thickness", v)} />
      <Choice
        label="Talang air"
        value={config.gutter ? "ya" : "tidak"}
        options={[
          { value: "ya", label: "Pakai talang", desc: "Air hujan dialirkan ke pipa" },
          { value: "tidak", label: "Tanpa talang" },
        ]}
        onChange={(v) => set("gutter", v === "ya")}
      />
      <Choice
        label="Pemasangan"
        value={config.install ? "ya" : "tidak"}
        options={[
          { value: "ya", label: "Dipasang tim kami" },
          { value: "tidak", label: "Material saja" },
        ]}
        onChange={(v) => set("install", v === "ya")}
      />

      <Warnings notes={kanopiWarnings(config)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/kanopi.ts */}
      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note="Perkiraan awal (contoh harga untuk draft). Harga final mengikuti survei kondisi dinding dan pengukuran di lokasi."
        message={(link) => kanopiSummary(config, link)}
        design={design}
        shareTitle="Desain kanopi kaca saya"
      />
    </ConfiguratorLayout>
  );
}
