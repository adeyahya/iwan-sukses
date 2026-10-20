"use client";

import { BoxIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { ArDialog } from "@/components/configurator/ar-dialog";
import { Choice, ConfiguratorLayout, ConfiguratorSuspense, Intro, QuoteCard, SizeField, useDesignLink, Warnings } from "@/components/configurator/configurator-ui";
import { SceneViewer } from "@/components/configurator/scene-viewer";
import type { RailingScene } from "@/components/configurator/scenes/railing-scene";
import { Button } from "@/components/ui/button";
import {
  defaultRailing,
  handrails,
  isFrameless,
  paramsToRailing,
  postFinishes,
  railingEstimate,
  railingGlasses,
  railingLayouts,
  railingLength,
  railingLimits,
  railingPath,
  railingSpans,
  railingSummary,
  railingSystems,
  railingThicknesses,
  railingToParams,
  railingWarnings,
  type RailingConfig,
  type RailingPrices,
} from "@/lib/configurators/railing";
import { useDict, useLang } from "@/i18n/client";
import { localize, rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";

function RailingIntro() {
  const t = useDict().configurator.railing;
  return <Intro title={t.heading} lead={t.lead} />;
}

const loadScene = () => import("@/components/configurator/scenes/railing-scene").then((m) => m.RailingScene);

type Props = { prices: RailingPrices; stores: Store[] };

export function RailingConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={<RailingIntro />}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const lang = useLang();
  const { ui, ar, railing: t } = useDict().configurator;
  const [config, setConfig] = useState<RailingConfig>(() =>
    params.has("panjang") ? paramsToRailing(new URLSearchParams(params.toString())) : defaultRailing,
  );
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<RailingScene | null>(null);
  const set = <K extends keyof RailingConfig>(key: K, value: RailingConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(railingPath, railingToParams(config).toString());
  const e = railingEstimate(config, prices, lang);
  const { panels, posts, spigots } = railingSpans(config);
  const frameless = isFrameless(config);

  return (
    <ConfiguratorLayout
      viewer={
        <SceneViewer load={loadScene} config={config} sceneRef={sceneRef}>
          <Button variant="spark" size="lg" className="absolute bottom-3 left-3 z-10" onClick={() => setArOpen(true)}>
            <BoxIcon />
            {ar.titleHome}
          </Button>
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

      <RailingIntro />

      <Choice label={t.layout} value={config.layout} options={localize(railingLayouts, lang)} onChange={(v) => set("layout", v)} />

      <div className="grid gap-6">
        <SizeField
          label={config.layout === "tangga" ? t.stairLength : config.layout === "l" ? t.side1 : t.length}
          value={config.length}
          limits={railingLimits.length}
          onChange={(v) => set("length", v)}
          input
        />
        {config.layout === "l" && <SizeField label={t.side2} value={config.length2} limits={railingLimits.length2} onChange={(v) => set("length2", v)} input />}
        <SizeField label={t.height} value={config.height} limits={railingLimits.height} onChange={(v) => set("height", v)} />
        <p className="-mt-2 text-sm text-muted-foreground">
          {config.layout === "tangga" && t.raked(Math.round(railingLength(config)))}
          <b className="text-foreground">{t.panels(panels)}</b>
          {(() => {
            const [before, count, after] = frameless ? t.frameless(t.spigots(spigots)) : t.posted(t.posts(posts));
            return (
              <>
                {before}
                <b className="text-foreground">{count}</b>
                {after}
              </>
            );
          })()}
        </p>
      </div>

      <Choice label={t.system} value={config.system} options={localize(railingSystems, lang)} onChange={(v) => set("system", v)} />
      <Choice label={frameless ? t.spigotColor : t.postColor} value={config.post} options={localize(postFinishes, lang)} onChange={(v) => set("post", v)} />
      {!frameless && <Choice label={t.handrail} value={config.handrail} options={localize(handrails, lang)} onChange={(v) => set("handrail", v)} />}
      <Choice label={ui.glassType} value={config.glass} options={localize(railingGlasses, lang)} onChange={(v) => set("glass", v)} />
      <Choice label={ui.thickness} value={config.thickness} options={localize(railingThicknesses, lang)} onChange={(v) => set("thickness", v)} />
      <Choice
        label={ui.install}
        value={config.install ? "ya" : "tidak"}
        options={[
          { value: "ya", label: ui.installed },
          { value: "tidak", label: ui.materialOnly },
        ]}
        onChange={(v) => set("install", v === "ya")}
      />

      <Warnings notes={railingWarnings(config, lang)} />

      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note={ui.draftNote}
        stores={stores}
        message={(link) => railingSummary(config, link, prices)}
        design={design}
        shareTitle={t.shareTitle}
      />
    </ConfiguratorLayout>
  );
}
