"use client";

import { useState } from "react";

import { FieldShell } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";

// Ukuran foto ikut tersimpan (terisi otomatis), supaya galeri bisa menyisakan tempat yang pas sebelum foto dimuat
export function GalleryFields({ src, width, height }: { src: string; width: number | null; height: number | null }) {
  const [size, setSize] = useState({ width, height });
  return (
    <FieldShell label="Foto" htmlFor="f-src">
      <ImageInput id="f-src" name="src" defaultValue={src} onDimensions={setSize} />
      <input type="hidden" name="width" value={size.width ?? ""} />
      <input type="hidden" name="height" value={size.height ?? ""} />
    </FieldShell>
  );
}
