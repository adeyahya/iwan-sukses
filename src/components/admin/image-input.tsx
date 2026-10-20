"use client";

import { CheckIcon, ImageIcon, ImagesIcon, LoaderIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listPhotos, uploadImage, type LibraryPhoto } from "@/lib/admin/actions";
import { previewSrc } from "@/lib/admin/preview";
import { cn } from "@/lib/utils";

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

// Kolom foto: unggah (klik atau tarik file ke kotak), pilih dari foto yang sudah ada, atau hapus.
// Nilainya (alamat foto) dikirim lewat input tersembunyi, jadi pengguna tidak pernah mengetik alamat.
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
  onDimensions?: (size: { width: number | null; height: number | null }) => void;
  id?: string;
}) {
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();

  const set = (src: string, size?: { width: number | null; height: number | null }) => {
    setLocal(src);
    onChange?.(src);
    if (size) onDimensions?.(size);
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("File ini bukan foto.");
    setBusy(true);
    setError("");
    try {
      const res = await uploadPhoto(file);
      if ("error" in res) setError(res.error);
      else set(res.src, { width: res.width, height: res.height });
    } catch {
      setError("Gagal mengunggah. Coba foto lain atau periksa koneksi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const upload = () => fileRef.current?.click();

  return (
    <div className="grid gap-2">
      {name && <input type="hidden" name={name} value={value} />}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFile(e.dataTransfer.files[0]);
        }}
        className={cn("relative overflow-hidden rounded-md border-2 border-dashed bg-mist/60 transition-colors", dragging && "border-ink bg-mist")}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc(value)} alt="" className="mx-auto max-h-56 w-full object-contain" />
        ) : (
          <button
            type="button"
            id={id ?? fallbackId}
            onClick={upload}
            disabled={busy}
            className="flex w-full flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ImageIcon className="size-8" />
            <span>
              <b className="text-foreground">Klik untuk memilih foto</b>
              <br />
              atau tarik foto dari komputer ke kotak ini
            </span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 text-sm font-semibold">
            <LoaderIcon className="size-4 animate-spin" />
            Mengunggah…
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="lg" disabled={busy} onClick={upload} id={value ? (id ?? fallbackId) : undefined}>
          <UploadIcon />
          {value ? "Ganti dengan foto baru" : "Unggah foto"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => setLibraryOpen(true)}>
          <ImagesIcon />
          Pilih dari foto yang ada
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="lg" disabled={busy} onClick={() => set("", { width: null, height: null })}>
            <XIcon />
            Kosongkan
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <PhotoLibrary
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        current={value}
        onPick={(p) => {
          setLibraryOpen(false);
          if (p.width && p.height) return set(p.src, { width: p.width, height: p.height });
          // Ukuran belum tercatat (foto bawaan situs): baca dari fotonya
          set(p.src);
          const img = new Image();
          img.onload = () => onDimensions?.({ width: img.naturalWidth, height: img.naturalHeight });
          img.src = previewSrc(p.src);
        }}
      />
    </div>
  );
}

// Jendela berisi semua foto yang sudah ada di situs; klik satu untuk memakainya
export function PhotoLibrary({
  open,
  onOpenChange,
  current,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: string;
  onPick: (photo: LibraryPhoto) => void;
}) {
  const [photos, setPhotos] = useState<LibraryPhoto[] | null>(null);

  // Muat ulang tiap kali dibuka supaya foto yang baru diunggah ikut tampil
  useEffect(() => {
    if (open) listPhotos().then(setPhotos, () => setPhotos([]));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] grid-rows-[auto_1fr] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pilih foto</DialogTitle>
          <DialogDescription>Semua foto yang pernah diunggah atau dipakai di situs. Klik foto untuk memakainya.</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 overflow-y-auto px-4">
          {!photos ? (
            <p className="flex items-center gap-2 py-8 text-muted-foreground">
              <LoaderIcon className="size-4 animate-spin" />
              Memuat foto…
            </p>
          ) : photos.length === 0 ? (
            <p className="py-8 text-muted-foreground">Belum ada foto. Unggah foto baru dulu.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {photos.map((p) => (
                <li key={p.src}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden rounded-md bg-mist ring-offset-2 outline-none hover:ring-2 hover:ring-ink focus-visible:ring-2 focus-visible:ring-ink",
                      p.src === current && "ring-2 ring-ink",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewSrc(p.src)} alt="" loading="lazy" className="size-full object-cover" />
                    {p.src === current && (
                      <span className="absolute top-1 right-1 rounded-full bg-ink p-1 text-paper">
                        <CheckIcon className="size-3" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
