"use client";

import { ImageIcon, LoaderIcon, UploadIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { inputClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/admin/actions";
import { previewSrc } from "@/lib/admin/preview";

// Foto diperkecil di browser sebelum diunggah (sisi terpanjang 2000 px, WebP),
// supaya foto HP belasan MB tetap ringan di situs.
const MAX_SIDE = 2000;

export async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  // Browser lama tanpa encoder WebP: kirim file aslinya
  return blob && blob.type === "image/webp" ? { blob, width, height } : { blob: file, width, height };
}

// Perkecil lalu unggah; dipakai juga oleh editor blog
export async function uploadPhoto(file: File): Promise<{ src: string; width: number; height: number } | { error: string }> {
  const { blob, width, height } = await shrink(file);
  const form = new FormData();
  form.set("file", new File([blob], file.name, { type: blob.type }));
  form.set("width", String(width));
  form.set("height", String(height));
  const res = await uploadImage(form);
  return "error" in res ? res : { src: res.src, width, height };
}

export function ImageInput({
  name,
  value: controlled,
  defaultValue = "",
  onChange,
  onDimensions,
  id,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (src: string) => void;
  onDimensions?: (size: { width: number; height: number }) => void;
  id?: string;
}) {
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();

  const set = (src: string) => {
    setLocal(src);
    onChange?.(src);
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const res = await uploadPhoto(file);
      if ("error" in res) setError(res.error);
      else {
        set(res.src);
        onDimensions?.({ width: res.width, height: res.height });
      }
    } catch {
      setError("Gagal mengunggah. Coba foto lain atau periksa koneksi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-mist">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc(value)} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="grid flex-1 content-start gap-2">
          <Input
            id={id ?? fallbackId}
            name={name}
            value={value}
            onChange={(e) => set(e.target.value)}
            placeholder="/media/… atau https://…"
            className={inputClass}
          />
          <div>
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? <LoaderIcon className="animate-spin" /> : <UploadIcon />}
              {busy ? "Mengunggah…" : "Unggah foto"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
