// Hanya diimpor dari komponen client (konfigurator), jadi tidak perlu "use client" sendiri.
import { RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ProductScene } from "@/components/configurator/scenes/product-scene";

// Pembungkus React untuk scene konfigurator; Three.js dimuat dinamis hanya di halaman konfigurator
export function SceneViewer<C, S extends ProductScene<C>>({
  load,
  config,
  sceneRef,
  onReady,
  children,
}: {
  load: () => Promise<new (host: HTMLElement) => S>;
  config: C;
  sceneRef: React.RefObject<S | null>;
  /** Terapkan state tambahan (pintu terbuka, jam matahari) saat scene siap */
  onReady?: (scene: S) => void;
  children?: React.ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(config);
  const loadRef = useRef(load);
  const readyRef = useRef(onReady);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    configRef.current = config;
    readyRef.current = onReady;
    sceneRef.current?.update(config);
  }, [config, onReady, sceneRef]);

  useEffect(() => {
    let disposed = false;
    loadRef
      .current()
      .then((Scene) => {
        if (disposed || !hostRef.current) return;
        const s = new Scene(hostRef.current);
        s.update(configRef.current, true);
        sceneRef.current = s;
        readyRef.current?.(s);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [sceneRef]);

  return (
    <div ref={hostRef} className="relative size-full overflow-hidden bg-[#EEF0F2]">
      {status === "loading" && <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Memuat tampilan 3D…</div>}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">
          Tampilan 3D tidak didukung di perangkat ini. Anda tetap bisa memilih spesifikasi dan mengirimnya lewat WhatsApp.
        </div>
      )}
      {status === "ready" && (
        <>
          <span className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-sm bg-background/90 px-2 py-1 text-xs font-semibold text-muted-foreground">
            <RotateCcwIcon className="size-3.5" />
            Geser untuk memutar
          </span>
          {children}
        </>
      )}
    </div>
  );
}
