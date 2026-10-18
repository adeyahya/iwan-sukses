"use client";

import { useState } from "react";

import { FieldShell, TextField } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";

// Ukuran foto terisi otomatis setelah unggah, supaya galeri bisa menyisakan tempat yang pas sebelum foto dimuat
export function GalleryFields({ src, width, height }: { src: string; width: number | null; height: number | null }) {
  const [size, setSize] = useState({ width, height });
  return (
    <>
      <FieldShell label="Foto" htmlFor="f-src">
        <ImageInput id="f-src" name="src" defaultValue={src} onDimensions={setSize} />
      </FieldShell>
      <div key={`${size.width}x${size.height}`} className="grid grid-cols-2 gap-5">
        <TextField name="width" label="Lebar foto (px)" type="number" defaultValue={size.width} hint="Terisi otomatis saat unggah." />
        <TextField name="height" label="Tinggi foto (px)" type="number" defaultValue={size.height} hint="Kosongkan untuk kotak persegi." />
      </div>
    </>
  );
}
