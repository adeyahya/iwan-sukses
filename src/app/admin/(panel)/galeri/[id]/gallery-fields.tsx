"use client";

import { useState } from "react";

import { FieldShell } from "@/components/admin/fields";
import { ImageInput, uploadPhoto } from "@/components/admin/image-input";
import { captureFrame, VideoInput } from "@/components/admin/video-input";
import { previewSrc } from "@/lib/admin/preview";
import { MAX_VIDEO } from "@/lib/video";

type Size = { width: number | null; height: number | null };

// Ukuran foto ikut tersimpan (terisi otomatis), supaya galeri bisa menyisakan tempat yang pas sebelum foto dimuat.
// Bila video dipasang saat foto masih kosong, posternya dipakai sebagai foto.
export function GalleryFields({ src: initialSrc, video, width, height }: { src: string; video: string; width: number | null; height: number | null }) {
  const [src, setSrc] = useState(initialSrc);
  const [size, setSize] = useState<Size>({ width, height });
  const [posterNote, setPosterNote] = useState("");

  const applyPoster = (poster: string) => {
    setSrc(poster);
    const img = new Image();
    img.onload = () => setSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = previewSrc(poster);
  };

  return (
    <>
      <FieldShell label="Foto" htmlFor="f-src" hint={posterNote || undefined}>
        <ImageInput
          id="f-src"
          name="src"
          value={src}
          onChange={(v) => {
            setSrc(v);
            setPosterNote("");
          }}
          onDimensions={setSize}
        />
        <input type="hidden" name="width" value={size.width ?? ""} />
        <input type="hidden" name="height" value={size.height ?? ""} />
      </FieldShell>
      <FieldShell
        label="Video (opsional)"
        htmlFor="f-video"
        hint={`MP4 atau MOV dari HP/komputer, maks. ${MAX_VIDEO / 1024 / 1024} MB. Foto di atas menjadi sampul video; bila foto masih kosong, sampul diambil otomatis dari videonya.`}
      >
        <VideoInput
          id="f-video"
          name="video"
          defaultValue={video}
          onUploaded={async (file) => {
            if (src) return;
            const frame = await captureFrame(file);
            if (!frame) return;
            const res = await uploadPhoto(frame);
            if ("error" in res) return;
            setSrc(res.src);
            setSize({ width: res.width, height: res.height });
            setPosterNote("Foto diambil otomatis dari video. Boleh diganti.");
          }}
          onPick={(v) => {
            if (!src && v.poster) applyPoster(v.poster);
          }}
        />
      </FieldShell>
    </>
  );
}
