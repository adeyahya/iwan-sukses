"use client";

import { ImagesIcon, LoaderIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";

import { PhotoLibrary, uploadPhoto } from "@/components/admin/image-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addGalleryItems } from "@/lib/admin/actions";
import { galleryCategories, type GalleryCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

// Nama file dari HP/kamera (IMG_2041, DSC0012, WhatsApp Image ...) tidak berguna sebagai judul
const cameraName = /^(img|dsc|dscn|pxl|mvimg|photo|image|foto|whatsapp image|screenshot)\b|^\d|^[\W\d_]+$/i;

function titleFor(file: File, cat: GalleryCategory) {
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!base || cameraName.test(base)) return galleryCategories.find((c) => c.value === cat)!.label;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// Tambah banyak foto sekaligus: pilih kategori, lalu pilih/tarik foto. Judul bisa diubah nanti.
export function AddPhotos() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<GalleryCategory>(galleryCategories[0].value);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(list: FileList | null) {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setError("");
    setProgress({ done: 0, total: files.length });
    const items = [];
    let failed = 0;
    for (const file of files) {
      try {
        const res = await uploadPhoto(file);
        if ("error" in res) failed++;
        else items.push({ src: res.src, width: res.width, height: res.height, title: titleFor(file, cat) });
      } catch {
        failed++;
      }
      setProgress((p) => p && { ...p, done: p.done + 1 });
    }
    if (items.length) await addGalleryItems(cat, items);
    setProgress(null);
    if (fileRef.current) fileRef.current.value = "";
    if (failed) setError(`${failed} foto gagal diunggah. Coba lagi untuk foto tersebut.`);
    else setOpen(false);
  }

  const busy = progress !== null;

  return (
    <>
      <Button size="xl" onClick={() => setOpen(true)}>
        <PlusIcon />
        Tambah foto
      </Button>
      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah foto ke galeri</DialogTitle>
            <DialogDescription>Bisa pilih banyak foto sekaligus. Foto baru masuk di urutan paling akhir.</DialogDescription>
          </DialogHeader>
          <fieldset className="grid gap-2" disabled={busy}>
            <legend className="mb-2 text-sm font-semibold">1. Kategori</legend>
            <div className="flex flex-wrap gap-2">
              {galleryCategories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={cat === c.value}
                  onClick={() => setCat(c.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-semibold",
                    cat === c.value ? "border-ink bg-ink text-paper" : "bg-background hover:bg-muted",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">2. Foto</p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!busy) onFiles(e.dataTransfer.files);
              }}
              className={cn("rounded-md border-2 border-dashed bg-mist/60", dragging && "border-ink bg-mist")}
            >
              {busy ? (
                <p className="flex items-center justify-center gap-2 px-4 py-10 text-sm font-semibold">
                  <LoaderIcon className="size-4 animate-spin" />
                  Mengunggah {progress.done + 1 > progress.total ? progress.total : progress.done + 1} dari {progress.total}…
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <UploadIcon className="size-8" />
                  <span>
                    <b className="text-foreground">Klik untuk memilih foto</b>
                    <br />
                    atau tarik foto dari komputer ke kotak ini
                  </span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => setLibraryOpen(true)} className="justify-self-start">
              <ImagesIcon />
              Pakai foto yang sudah ada
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>
      <PhotoLibrary
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onPick={async (p) => {
          setLibraryOpen(false);
          await addGalleryItems(cat, [{ src: p.src, width: p.width, height: p.height, title: galleryCategories.find((c) => c.value === cat)!.label }]);
          setOpen(false);
        }}
      />
    </>
  );
}
