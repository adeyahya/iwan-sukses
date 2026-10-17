// Hanya diimpor dari komponen client (konfigurator), jadi tidak perlu "use client" sendiri.
import { ScanLineIcon, SmartphoneIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderSVG } from "uqr";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Support = "checking" | "ar" | "desktop" | "unsupported";
type ModelViewerElement = HTMLElement & { canActivateAR: boolean; activateAR: () => Promise<void> };

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

// AR di web: iPhone memakai AR Quick Look (USDZ dibuat otomatis oleh model-viewer dari GLB),
// Android memakai WebXR di Chrome. Scene Viewer tidak dipakai karena butuh file yang di-hosting.
async function detectSupport(): Promise<Support> {
  const quickLook = document.createElement("a").relList.supports("ar");
  const xr = (navigator as Navigator & { xr?: { isSessionSupported: (m: string) => Promise<boolean> } }).xr;
  const webxr = xr ? await xr.isSessionSupported("immersive-ar").catch(() => false) : false;
  if (quickLook || webxr) return "ar";
  return isMobile() ? "unsupported" : "desktop";
}

export type ArExportable = { exportGLB: () => Promise<ArrayBuffer> };

export function ArDialog({
  open,
  onOpenChange,
  viewer,
  link,
  subject,
  steps,
  title = "Lihat di ruangan Anda",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewer: React.RefObject<ArExportable | null>;
  link: string;
  /** Nama produk, mis. "Shower box" */
  subject: string;
  steps: string[];
  title?: string;
}) {
  const [support, setSupport] = useState<Support>("checking");
  const [state, setState] = useState<"idle" | "preparing" | "ready" | "unavailable" | "error">("idle");
  const holderRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<ModelViewerElement | null>(null);

  // Deteksi dukungan AR saat dialog dibuka
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    detectSupport().then((s) => !cancelled && setSupport(s));
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Siapkan model setelah wadahnya tampil: ekspor GLB, muat ke model-viewer.
  // activateAR harus dipanggil langsung dari klik pengguna, jadi persiapan dilakukan lebih dulu.
  useEffect(() => {
    if (!open || support !== "ar") return;
    let cancelled = false;
    let url = "";
    (async () => {
      await Promise.resolve();
      if (cancelled || !viewer.current || !holderRef.current) return;
      setState("preparing");
      try {
        const [glb] = await Promise.all([viewer.current.exportGLB(), import("@google/model-viewer")]);
        if (cancelled || !holderRef.current) return;
        url = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
        const mv = document.createElement("model-viewer") as ModelViewerElement;
        mv.setAttribute("src", url);
        mv.setAttribute("alt", `Model 3D ${subject.toLowerCase()} sesuai konfigurasi`);
        mv.setAttribute("ar", "");
        mv.setAttribute("ar-modes", "webxr quick-look");
        mv.setAttribute("ar-scale", "fixed"); // ukuran asli, tidak bisa dicubit membesar/mengecil
        mv.setAttribute("camera-controls", "");
        mv.setAttribute("shadow-intensity", "1");
        mv.setAttribute("environment-image", "neutral");
        mv.style.cssText = "width:100%;height:100%;background:#EEF0F2";
        // Tombol AR bawaan disembunyikan; kita pakai tombol sendiri
        const slot = document.createElement("span");
        slot.setAttribute("slot", "ar-button");
        slot.style.display = "none";
        mv.appendChild(slot);
        // Setelah model dimuat, model-viewer tahu pasti apakah sesi AR bisa dibuka
        mv.addEventListener("load", () => !cancelled && setState(mv.canActivateAR ? "ready" : "unavailable"), { once: true });
        mv.addEventListener("error", () => !cancelled && setState("error"), { once: true });
        holderRef.current.replaceChildren(mv);
        mvRef.current = mv;
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
      mvRef.current?.remove();
      mvRef.current = null;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, support, viewer, subject]);

  const qr = support === "desktop" && link ? renderSVG(link, { pixelSize: 6, blackColor: "#0A0A0B", whiteColor: "#FFFFFF" }) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
          <DialogDescription>{subject} tampil dalam ukuran asli lewat kamera HP.</DialogDescription>
        </DialogHeader>

        {support === "checking" && <p className="text-sm text-muted-foreground">Memeriksa perangkat…</p>}

        {support === "ar" && (
          <div className="grid gap-4">
            <div ref={holderRef} className="relative h-56 overflow-hidden rounded-md border bg-[#EEF0F2]" />
            <ol className="grid gap-1.5 text-sm">
              {steps.map((step, i) => (
                <li key={step}>
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
            <Button
              variant="spark"
              size="xl"
              disabled={state !== "ready"}
              onClick={() => mvRef.current?.activateAR().catch(() => setState("error"))}
            >
              <ScanLineIcon />
              {state === "ready"
                ? "Buka kamera AR"
                : state === "unavailable"
                  ? "AR tidak tersedia di perangkat ini"
                  : state === "error"
                    ? "AR gagal dimuat"
                    : "Menyiapkan model…"}
            </Button>
          </div>
        )}

        {support === "desktop" && (
          <div className="grid justify-items-center gap-4 text-center">
            <div aria-label="Kode QR link desain" role="img" className="w-52 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="text-sm">
              <SmartphoneIcon className="mr-1 inline size-4 align-[-3px]" />
              Pindai dengan kamera HP. Desain yang sama akan terbuka, lalu tekan <b>{title}</b>.
            </p>
            <p className="text-xs text-muted-foreground">Butuh iPhone/iPad, atau HP Android dengan Chrome yang mendukung ARCore.</p>
          </div>
        )}

        {support === "unsupported" && (
          <p className="text-sm">
            Maaf, HP ini belum mendukung AR di browser. AR membutuhkan iPhone/iPad, atau HP Android dengan Chrome dan dukungan ARCore. Anda
            tetap bisa memutar model 3D di halaman ini dan mengirim spesifikasinya lewat WhatsApp.
          </p>
        )}

        <p className="text-xs leading-4 text-muted-foreground">
          AR untuk gambaran visual, bukan alat ukur. Ukuran final tetap mengikuti survei tim kami di lokasi.
        </p>
      </DialogContent>
    </Dialog>
  );
}
