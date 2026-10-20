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
import { useDict, useLang } from "@/i18n/client";
import { localize, rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";

function GlassCutIntro() {
  const t = useDict().configurator.kacaPotong;
  return <Intro title={t.heading} lead={t.lead} />;
}

const loadScene = () => import("@/components/configurator/scenes/glass-cut-scene").then((m) => m.GlassCutScene);

type Props = { prices: CutPrices; stores: Store[] };

export function GlassCutConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={<GlassCutIntro />}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const lang = useLang();
  const { ui, kacaPotong: t } = useDict().configurator;
  const [config, setConfig] = useState<CutConfig>(() =>
    params.has("panjang") ? paramsToCut(new URLSearchParams(params.toString())) : defaultCut,
  );
  const sceneRef = useRef<GlassCutScene | null>(null);
  // Setiap perubahan dinormalkan: tebal/finishing/lubang yang tidak cocok disesuaikan otomatis
  const set = <K extends keyof CutConfig>(key: K, value: CutConfig[K]) => setConfig((c) => normalizeCut({ ...c, [key]: value }));
  const design = useDesignLink(kacaPotongPath, cutToParams(config).toString());
  const e = cutEstimate(config, prices, lang);
  const thicknessOptions = thicknessByGlass[config.glass].map((t) => ({ value: t, label: `${t} mm` }));
  const edgeOptions = localize(cutEdges, lang).map((o) => (o.value === "bevel" && config.thickness < 5 ? { ...o, desc: t.bevelMin } : o));

  return (
    <ConfiguratorLayout viewer={<SceneViewer load={loadScene} config={config} sceneRef={sceneRef} />}>
      <GlassCutIntro />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">{t.presets}</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p.label} variant="outline" size="lg" onClick={() => setConfig((c) => normalizeCut({ ...c, ...p.config }))}>
              {lang === "en" ? p.en : p.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <Choice label={t.shape} value={config.shape} options={localize(cutShapes, lang)} onChange={(v) => set("shape", v)} />

      <div className="grid gap-6">
        <SizeField label={t.length} value={config.length} limits={cutLimits.length} onChange={(v) => set("length", v)} input />
        <SizeField label={t.width} value={config.width} limits={cutLimits.width} onChange={(v) => set("width", v)} input />
      </div>

      <Choice label={ui.glassType} value={config.glass} options={localize(cutGlasses, lang)} onChange={(v) => set("glass", v)} twoCols />
      <Choice label={t.thickness} value={config.thickness} options={thicknessOptions} onChange={(v) => set("thickness", v)} twoCols />
      <Choice label={t.edge} value={config.edge} options={edgeOptions} onChange={(v) => set("edge", v)} />
      {config.shape !== "bulat" && <Choice label={t.holes} value={config.holes} options={localize(holeOptions, lang)} onChange={(v) => set("holes", v)} />}
      <SizeField label={t.qty} value={config.qty} limits={cutLimits.qty} unit={t.pieces} onChange={(v) => set("qty", v)} input />

      <Warnings notes={cutWarnings(config, lang)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/kaca-potong.ts */}
      <QuoteCard
        title={t.price}
        lines={e.lines}
        price={
          <>
            {rupiah(e.total)}
            {config.qty > 1 && (
              <span className="block font-sans text-sm font-normal text-muted-foreground">
                {t.perPiece(rupiah(e.perPiece), config.qty)}
              </span>
            )}
          </>
        }
        note={t.note}
        stores={stores}
        message={(link) => cutSummary(config, link, prices)}
        design={design}
        shareTitle={t.shareTitle}
      />
    </ConfiguratorLayout>
  );
}
