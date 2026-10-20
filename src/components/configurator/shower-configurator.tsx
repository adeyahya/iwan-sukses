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
import { useDict, useLang } from "@/i18n/client";
import { localize, rupiah } from "@/lib/configurators/shared";
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

function ShowerIntro() {
  const t = useDict().configurator.shower;
  return <Intro title={t.heading} lead={t.lead} />;
}

const loadScene = () => import("@/components/configurator/scenes/shower-scene").then((m) => m.ShowerScene);

type Props = { prices: ShowerPrices; stores: Store[] };

export function ShowerConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={<ShowerIntro />}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const lang = useLang();
  const { ui, ar, shower: t } = useDict().configurator;
  // Buka desain dari link (?model=...&lebar=...) bila ada
  const [config, setConfig] = useState<ShowerConfig>(() =>
    params.has("model") ? paramsToConfig(new URLSearchParams(params.toString())) : defaultConfig,
  );
  const [doorOpen, setDoorOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<ShowerScene | null>(null);
  const set = <K extends keyof ShowerConfig>(key: K, value: ShowerConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(showerPath, configToParams(config).toString());
  const e = estimate(config, prices, lang);
  const door = hasDoor(config.layout);
  const availableExtras = localize(extrasList, lang).filter((x) => x.value === "coating" || door);

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
            {ar.title}
          </Button>
          {door && (
            <Button variant="outline" size="lg" className="absolute right-3 bottom-3 z-10 bg-background" aria-pressed={doorOpen} onClick={toggleDoor}>
              <DoorOpenIcon />
              {doorOpen ? t.closeDoor : t.openDoor}
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
        subject={t.subject}
        steps={t.arSteps}
      />

      <ShowerIntro />

      <Choice label={t.model} value={config.layout} options={localize(layouts, lang)} onChange={(v) => set("layout", v)} twoCols />

      <div className="grid gap-6">
        <SizeField label={config.layout === "sudut" ? t.frontWidth : t.width} value={config.width} limits={sizeLimits.width} onChange={(v) => set("width", v)} />
        {(config.layout === "walkin" || config.layout === "sudut") && (
          <SizeField
            label={config.layout === "sudut" ? t.sideWidth : t.backWall}
            value={config.depth}
            limits={sizeLimits.depth}
            onChange={(v) => set("depth", v)}
          />
        )}
        <SizeField label={t.height} value={config.height} limits={sizeLimits.height} onChange={(v) => set("height", v)} />
      </div>

      {door && (
        <>
          <Choice label={t.doorSide} value={config.doorSide} options={localize(doorSides, lang)} onChange={(v) => set("doorSide", v)} />
          <Choice label={t.handle} value={config.handle} options={localize(handles, lang)} onChange={(v) => set("handle", v)} />
        </>
      )}

      <Choice label={ui.glassType} value={config.glass} options={localize(glassTypes, lang)} onChange={(v) => set("glass", v)} />
      <Choice label={t.temperedThickness} value={config.thickness} options={thicknesses} onChange={(v) => set("thickness", v)} />
      <Choice label={t.finish} value={config.finish} options={localize(finishes, lang)} onChange={(v) => set("finish", v)} />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">
          {t.extras} <span className="font-normal text-muted-foreground">{t.extrasHint}</span>
        </legend>
        <ToggleGroup multiple aria-label={t.extras} value={config.extras} onValueChange={(v) => set("extras", v as Extra[])} className="w-full flex-col items-stretch">
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
        label={ui.install}
        value={config.install ? "ya" : "tidak"}
        options={[
          { value: "ya", label: ui.installed },
          { value: "tidak", label: ui.pickup },
        ]}
        onChange={(v) => set("install", v === "ya")}
      />

      <Warnings notes={warnings(config, lang)} />

      {/* DRAFT: harga contoh, ganti dengan harga asli di src/lib/configurators/shower.ts */}
      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note={ui.draftNote}
        stores={stores}
        message={(link) => summaryText(config, link, prices)}
        design={design}
        shareTitle={t.shareTitle}
      />
    </ConfiguratorLayout>
  );
}
