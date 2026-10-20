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
  bracketArms,
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
  panelGrid,
  paramsToKanopi,
  supportNote,
  supports,
  type KanopiConfig,
  type KanopiPrices,
} from "@/lib/configurators/kanopi";
import { useDict, useLang } from "@/i18n/client";
import { localize, rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";

function KanopiIntro() {
  const t = useDict().configurator.kanopi;
  return <Intro title={t.heading} lead={t.lead} />;
}

const loadScene = () => import("@/components/configurator/scenes/kanopi-scene").then((m) => m.KanopiScene);

const sunTimes = ["8", "12", "16"];

type Props = { prices: KanopiPrices; stores: Store[] };

export function KanopiConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={<KanopiIntro />}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const lang = useLang();
  const { ui, ar, kanopi: t } = useDict().configurator;
  const [config, setConfig] = useState<KanopiConfig>(() =>
    params.has("lebar") ? paramsToKanopi(new URLSearchParams(params.toString())) : defaultKanopi,
  );
  const [hour, setHour] = useState("8");
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<KanopiScene | null>(null);
  const set = <K extends keyof KanopiConfig>(key: K, value: KanopiConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(kanopiPath, kanopiToParams(config).toString());
  const e = kanopiEstimate(config, prices, lang);
  const grid = panelGrid(config);
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
            {ar.titleHome}
          </Button>
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-background/95 p-1 pl-2">
            <SunIcon className="size-4 text-muted-foreground" aria-hidden />
            <ToggleGroup aria-label={t.sunTime} value={[hour]} onValueChange={(v) => v[0] && changeHour(v[0])} spacing={0}>
              {sunTimes.map((h) => (
                <ToggleGroupItem
                  key={h}
                  value={h}
                  size="sm"
                  className="px-2.5 font-semibold data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
                >
                  {t.sun[h]}
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
        subject={t.subject}
        title={ar.titleHome}
        steps={t.arSteps}
      />

      <KanopiIntro />

      <div className="grid gap-6">
        <SizeField label={t.width} value={config.width} limits={kanopiLimits.width} onChange={(v) => set("width", v)} />
        <SizeField label={t.projection} value={config.projection} limits={kanopiLimits.projection} onChange={(v) => set("projection", v)} />
        <SizeField label={t.height} value={config.height} limits={kanopiLimits.height} onChange={(v) => set("height", v)} />
        <SizeField label={t.slope} value={config.slope} limits={kanopiLimits.slope} unit="°" onChange={(v) => set("slope", v)} />
        <p className="-mt-2 text-sm text-muted-foreground">
          {t.grid(grid.cols, grid.rows)}
          <b className="text-foreground">{t.panels(panelCount(config))}</b>
          {t.glassSuffix}
          {config.support === "hollow" ? (
            supportNote(config, lang)
          ) : (
            <>
              {t.supportedBy}
              <b className="text-foreground">{supportNote(config, lang)}</b>
            </>
          )}
          .
        </p>
      </div>

      <Choice label={t.support} value={config.support} options={localize(supports, lang)} onChange={(v) => set("support", v)} />
      {config.support === "bracket" && <Choice label={t.arm} value={config.arm} options={localize(bracketArms, lang)} onChange={(v) => set("arm", v)} />}
      <Choice label={t.frame} value={config.frame} options={localize(frameColors, lang)} onChange={(v) => set("frame", v)} />
      <Choice label={ui.glassType} value={config.glass} options={localize(kanopiGlasses, lang)} onChange={(v) => set("glass", v)} />
      <Choice label={ui.thickness} value={config.thickness} options={localize(kanopiThicknesses, lang)} onChange={(v) => set("thickness", v)} />
      <Choice
        label={t.gutter}
        value={config.gutter ? "ya" : "tidak"}
        options={[
          { value: "ya", label: t.withGutter, desc: t.withGutterDesc },
          { value: "tidak", label: t.noGutter },
        ]}
        onChange={(v) => set("gutter", v === "ya")}
      />
      <Choice
        label={ui.install}
        value={config.install ? "ya" : "tidak"}
        options={[
          { value: "ya", label: ui.installed },
          { value: "tidak", label: ui.materialOnly },
        ]}
        onChange={(v) => set("install", v === "ya")}
      />

      <Warnings notes={kanopiWarnings(config, lang)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/kanopi.ts */}
      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note={t.note}
        stores={stores}
        message={(link) => kanopiSummary(config, link, prices)}
        design={design}
        shareTitle={t.shareTitle}
      />
    </ConfiguratorLayout>
  );
}
