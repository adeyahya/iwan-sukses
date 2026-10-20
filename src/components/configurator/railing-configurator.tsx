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
import { rupiah } from "@/lib/configurators/shared";
import type { Store } from "@/lib/data";

const intro = (
  <Intro
    title="Rancang railing kaca Anda"
    lead="Pilih bentuk, panjang, sistem tiang, kaca, dan handrail. Putar tampilan 3D untuk melihat detail jepitnya, lalu kirim spesifikasinya ke kami."
  />
);

const loadScene = () => import("@/components/configurator/scenes/railing-scene").then((m) => m.RailingScene);

type Props = { prices: RailingPrices; stores: Store[] };

export function RailingConfigurator(props: Props) {
  return (
    <ConfiguratorSuspense intro={intro}>
      <Inner {...props} />
    </ConfiguratorSuspense>
  );
}

function Inner({ prices, stores }: Props) {
  const params = useSearchParams();
  const [config, setConfig] = useState<RailingConfig>(() =>
    params.has("panjang") ? paramsToRailing(new URLSearchParams(params.toString())) : defaultRailing,
  );
  const [arOpen, setArOpen] = useState(false);
  const sceneRef = useRef<RailingScene | null>(null);
  const set = <K extends keyof RailingConfig>(key: K, value: RailingConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const design = useDesignLink(railingPath, railingToParams(config).toString());
  const e = railingEstimate(config, prices);
  const { panels, posts } = railingSpans(config);

  return (
    <ConfiguratorLayout
      viewer={
        <SceneViewer load={loadScene} config={config} sceneRef={sceneRef}>
          <Button variant="spark" size="lg" className="absolute bottom-3 left-3 z-10" onClick={() => setArOpen(true)}>
            <BoxIcon />
            Lihat di rumah Anda
          </Button>
        </SceneViewer>
      }
    >
      <ArDialog
        open={arOpen}
        onOpenChange={setArOpen}
        viewer={sceneRef}
        link={design.link}
        subject="Railing"
        title="Lihat di rumah Anda"
        steps={[
          "Berdirilah di dekat tepi balkon, mezanin, atau tangga yang akan diberi railing.",
          "Arahkan kamera ke lantai di tepi tersebut, lalu ketuk untuk menaruh.",
          "Putar dan geser railing sampai sejajar dengan tepi lantai.",
        ]}
      />

      {intro}

      <Choice label="Bentuk" value={config.layout} options={railingLayouts} onChange={(v) => set("layout", v)} />

      <div className="grid gap-6">
        <SizeField
          label={config.layout === "tangga" ? "Panjang tangga (datar)" : config.layout === "l" ? "Panjang sisi 1" : "Panjang"}
          value={config.length}
          limits={railingLimits.length}
          onChange={(v) => set("length", v)}
          input
        />
        {config.layout === "l" && <SizeField label="Panjang sisi 2" value={config.length2} limits={railingLimits.length2} onChange={(v) => set("length2", v)} input />}
        <SizeField label="Tinggi railing" value={config.height} limits={railingLimits.height} onChange={(v) => set("height", v)} />
        <p className="-mt-2 text-sm text-muted-foreground">
          {config.layout === "tangga" && <>Panjang miring ±{Math.round(railingLength(config))} cm. </>}
          <b className="text-foreground">{panels} panel</b> kaca dengan <b className="text-foreground">{posts} tiang</b>, berjarak maksimal ±100 cm.
        </p>
      </div>

      <Choice label="Sistem tiang" value={config.system} options={railingSystems} onChange={(v) => set("system", v)} />
      <Choice label="Warna tiang" value={config.post} options={postFinishes} onChange={(v) => set("post", v)} />
      <Choice label="Handrail" value={config.handrail} options={handrails} onChange={(v) => set("handrail", v)} />
      <Choice label="Jenis kaca" value={config.glass} options={railingGlasses} onChange={(v) => set("glass", v)} />
      <Choice label="Tebal kaca" value={config.thickness} options={railingThicknesses} onChange={(v) => set("thickness", v)} />
      <Choice
        label="Pemasangan"
        value={config.install ? "ya" : "tidak"}
        options={[
          { value: "ya", label: "Dipasang tim kami" },
          { value: "tidak", label: "Material saja" },
        ]}
        onChange={(v) => set("install", v === "ya")}
      />

      <Warnings notes={railingWarnings(config)} />

      <QuoteCard
        lines={e.lines}
        price={`${rupiah(e.low)} – ${rupiah(e.high)}`}
        note="Perkiraan awal (contoh harga untuk draft). Harga final mengikuti survei dan pengukuran di lokasi."
        stores={stores}
        message={(link) => railingSummary(config, link, prices)}
        design={design}
        shareTitle="Desain railing kaca saya"
      />
    </ConfiguratorLayout>
  );
}
