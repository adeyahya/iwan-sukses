"use client";

import { RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ShowerScene } from "@/components/configurator/shower-scene";
import type { ShowerConfig } from "@/lib/configurator";

export type ShowerViewerApi = { exportGLB: () => Promise<ArrayBuffer> };

// Pembungkus React untuk ShowerScene; Three.js dimuat dinamis hanya di halaman ini
export function ShowerViewer({
  config,
  doorOpen,
  apiRef,
}: {
  config: ShowerConfig;
  doorOpen: boolean;
  apiRef?: React.RefObject<ShowerViewerApi | null>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ShowerScene | null>(null);
  const configRef = useRef(config);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    configRef.current = config;
    sceneRef.current?.update(config);
  }, [config]);

  useEffect(() => {
    sceneRef.current?.setDoorOpen(doorOpen);
  }, [doorOpen]);

  useEffect(() => {
    let disposed = false;
    import("@/components/configurator/shower-scene")
      .then(({ ShowerScene }) => {
        if (disposed || !hostRef.current) return;
        const s = new ShowerScene(hostRef.current);
        s.update(configRef.current, true);
        sceneRef.current = s;
        if (apiRef) apiRef.current = { exportGLB: () => s.exportGLB() };
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  return (
    <div ref={hostRef} className="relative size-full overflow-hidden bg-[#EEF0F2]">
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Memuat tampilan 3D…</div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">
          Tampilan 3D tidak didukung di perangkat ini. Anda tetap bisa memilih spesifikasi dan mengirimnya lewat WhatsApp.
        </div>
      )}
      {status === "ready" && (
        <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-sm bg-background/90 px-2 py-1 text-xs font-semibold text-muted-foreground">
          <RotateCcwIcon className="size-3.5" />
          Geser untuk memutar
        </span>
      )}
    </div>
  );
}
