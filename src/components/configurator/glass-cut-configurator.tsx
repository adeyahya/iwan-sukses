"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { Choice, ConfiguratorLayout, ConfiguratorSuspense, Intro, QuoteCard, SizeField, useDesignLink, Warnings } from "@/components/configurator/configurator-ui";
import { SceneViewer } from "@/components/configurator/scene-viewer";
import type { GlassCutScene } from "@/components/configurator/scenes/glass-cut-scene";
import { Button } from "@/components/ui/button";
import {
  cutEdges,
  cutEstimate,
  cutGlasses,
  cutLimits,
  cutShapes,
  cutSummary,
  cutToParams,
  cutWarnings,
  defaultCut,
  holeOptions,
  kacaPotongPath,
  normalizeCut,
  paramsToCut,
  presets,
  thicknessByGlass,
  type CutConfig,
  type CutPrices,
} from "@/lib/configurators/kaca-potong";
import { rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";

const intro = (
  <Intro
    title="Pesan kaca potong sesuai ukuran"
    lead="Masukkan ukuran sampai sentimeter, pilih jenis kaca, tebal, dan finishing tepi. Harga per lembar langsung terhitung."
  />
);

const loadScene = () => import("@/components/configurator/scenes/glass-cut-scene").then((m) => m.GlassCutScene);

type Props = { prices: CutPrices; stores: Store[] };

export function GlassCutConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={intro}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const [config, setConfig] = useState<CutConfig>(() =>
    params.has("panjang") ? paramsToCut(new URLSearchParams(params.toString())) : defaultCut,
  );
  const sceneRef = useRef<GlassCutScene | null>(null);
  // Setiap perubahan dinormalkan: tebal/finishing/lubang yang tidak cocok disesuaikan otomatis
  const set = <K extends keyof CutConfig>(key: K, value: CutConfig[K]) => setConfig((c) => normalizeCut({ ...c, [key]: value }));
  const design = useDesignLink(kacaPotongPath, cutToParams(config).toString());
  const e = cutEstimate(config, prices);
  const thicknessOptions = thicknessByGlass[config.glass].map((t) => ({ value: t, label: `${t} mm` }));
  const edgeOptions = cutEdges.map((o) => (o.value === "bevel" && config.thickness < 5 ? { ...o, desc: "Minimal 5 mm" } : o));

  return (
    <ConfiguratorLayout viewer={<SceneViewer load={loadScene} config={config} sceneRef={sceneRef} />}>
      {intro}

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Contoh cepat</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p.label} variant="outline" size="lg" onClick={() => setConfig((c) => normalizeCut({ ...c, ...p.config }))}>
              {p.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <Choice label="Bentuk" value={config.shape} options={cutShapes} onChange={(v) => set("shape", v)} />

      <div className="grid gap-6">
        <SizeField label="Panjang" value={config.length} limits={cutLimits.length} onChange={(v) => set("length", v)} input />
        <SizeField label="Lebar" value={config.width} limits={cutLimits.width} onChange={(v) => set("width", v)} input />
      </div>

      <Choice label="Jenis kaca" value={config.glass} options={cutGlasses} onChange={(v) => set("glass", v)} twoCols />
      <Choice label="Tebal" value={config.thickness} options={thicknessOptions} onChange={(v) => set("thickness", v)} twoCols />
      <Choice label="Finishing tepi" value={config.edge} options={edgeOptions} onChange={(v) => set("edge", v)} />
      {config.shape !== "bulat" && <Choice label="Lubang baut (⌀ 1 cm)" value={config.holes} options={holeOptions} onChange={(v) => set("holes", v)} />}
      <SizeField label="Jumlah" value={config.qty} limits={cutLimits.qty} unit="lembar" onChange={(v) => set("qty", v)} input />

      <Warnings notes={cutWarnings(config)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/kaca-potong.ts */}
      <QuoteCard
        title="Harga"
        lines={e.lines}
        price={
          <>
            {rupiah(e.total)}
            {config.qty > 1 && (
              <span className="block font-sans text-sm font-normal text-muted-foreground">
                {rupiah(e.perPiece)} × {config.qty} lembar
              </span>
            )}
          </>
        }
        note="Contoh harga untuk draft. Belum termasuk ongkos kirim; bisa diambil di toko Probolinggo atau Bali."
        stores={stores}
        message={(link) => cutSummary(config, link, prices)}
        design={design}
        shareTitle="Pesanan kaca potong saya"
      />
    </ConfiguratorLayout>
  );
}
