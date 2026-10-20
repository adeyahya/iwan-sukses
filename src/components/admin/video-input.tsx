"use client";

import { CheckIcon, FilmIcon, LoaderIcon, PlayIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appendVideoChunk, beginVideo, finishVideo, listVideos, type LibraryVideo } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import { MAX_VIDEO, VIDEO_CHUNK } from "@/lib/video";

const isVideoFile = (file: File) => /^video\/(mp4|quicktime)$/.test(file.type) || /\.(mp4|m4v|mov)$/i.test(file.name);

// Video HEVC (bawaan kamera iPhone) tidak bisa diputar di banyak browser Chrome/Windows.
// Penanda kodeknya ada di bagian "moov", yang letaknya di awal atau di akhir file: sample entry
// "hvc1"/"hev1" diikuti 6 byte nol dan data_reference_index 1 (supaya tidak salah kena data video biasa).
async function isHevc(file: File) {
  const edge = 4 * 1024 * 1024;
  const parts = file.size <= edge * 2 ? [file] : [file.slice(0, edge), file.slice(file.size - edge)];
  for (const part of parts) {
    const text = new TextDecoder("latin1").decode(await part.arrayBuffer());
    if (/(hvc1|hev1)\0{7}\x01/.test(text)) return true;
  }
  return false;
}

// Ambil satu gambar dari video (detik ke-1) untuk dijadikan poster bila foto masih kosong
export function captureFrame(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (result: File | null) => {
      URL.revokeObjectURL(url);
      resolve(result);
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => done(null);
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (!canvas.width || !canvas.height) return done(null);
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      canvas.toBlob((blob) => done(blob && new File([blob], "poster.webp", { type: blob.type })), "image/webp", 0.85);
    };
    setTimeout(() => done(null), 15000);
    video.src = url;
  });
}

// Kolom video: unggah dari HP/komputer (dikirim per potongan, dengan kemajuan), pilih video yang sudah ada,
// atau kosongkan. Nilainya (alamat video) dikirim lewat input tersembunyi.
export function VideoInput({
  name,
  defaultValue = "",
  onUploaded,
  onPick,
  id,
}: {
  name: string;
  defaultValue?: string;
  // File asli video yang baru diunggah, misalnya untuk membuat poster
  onUploaded?: (file: File) => void;
  onPick?: (video: LibraryVideo) => void;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const busy = progress !== null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!isVideoFile(file)) return setError("File ini bukan video MP4 atau MOV.");
    if (file.size > MAX_VIDEO) return setError(`Video terlalu besar (maks. ${MAX_VIDEO / 1024 / 1024} MB). Potong videonya dulu.`);
    setProgress(0);
    try {
      if (await isHevc(file)) {
        return setError(
          "Video ini memakai format HEVC yang tidak bisa diputar di semua browser. Di iPhone, pilih Pengaturan › Kamera › Format › Paling Kompatibel lalu rekam ulang, atau kirim videonya lewat WhatsApp dulu lalu unggah hasil kirimannya.",
        );
      }
      const begin = await beginVideo("video/" + (file.type === "video/quicktime" || /\.mov$/i.test(file.name) ? "quicktime" : "mp4"), file.size);
      if ("error" in begin) return setError(begin.error);
      const chunks = Math.ceil(file.size / VIDEO_CHUNK);
      for (let idx = 0; idx < chunks; idx++) {
        const form = new FormData();
        form.set("id", begin.id);
        form.set("idx", String(idx));
        form.set("chunk", file.slice(idx * VIDEO_CHUNK, (idx + 1) * VIDEO_CHUNK));
        // Koneksi HP bisa putus sesaat: coba lagi satu kali sebelum menyerah
        let res = await appendVideoChunk(form).catch(() => null);
        if (!res) res = await appendVideoChunk(form);
        if ("error" in res) return setError(res.error);
        setProgress((idx + 1) / chunks);
      }
      const res = await finishVideo(begin.id);
      if ("error" in res) return setError(res.error);
      setValue(res.src);
      onUploaded?.(file);
    } catch {
      setError("Gagal mengunggah. Periksa koneksi lalu coba lagi.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const upload = () => fileRef.current?.click();

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={value} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) onFile(e.dataTransfer.files[0]);
        }}
        className={cn("relative overflow-hidden rounded-md border-2 border-dashed bg-mist/60 transition-colors", dragging && "border-ink bg-mist")}
      >
        {value ? (
          <video key={value} src={value} controls muted playsInline preload="metadata" className="mx-auto max-h-72 w-full bg-ink object-contain" />
        ) : (
          <button
            type="button"
            id={id ?? fallbackId}
            onClick={upload}
            disabled={busy}
            className="flex w-full flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            <FilmIcon className="size-8" />
            <span>
              <b className="text-foreground">Klik untuk memilih video</b>
              <br />
              atau tarik video dari komputer ke kotak ini
            </span>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 px-6 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <LoaderIcon className="size-4 animate-spin" />
              Mengunggah video… {Math.round(progress * 100)}%
            </span>
            <span className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-mist">
              <span className="block h-full bg-ink transition-[width]" style={{ width: `${progress * 100}%` }} />
            </span>
            <span className="text-xs font-normal text-muted-foreground">Jangan tutup halaman ini sampai selesai.</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="lg" disabled={busy} onClick={upload} id={value ? (id ?? fallbackId) : undefined}>
          <UploadIcon />
          {value ? "Ganti dengan video baru" : "Unggah video"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => setLibraryOpen(true)}>
          <PlayIcon />
          Pilih dari video yang ada
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="lg" disabled={busy} onClick={() => setValue("")}>
            <XIcon />
            Hapus video
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov,.m4v" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <VideoLibrary
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        current={value}
        onPick={(v) => {
          setLibraryOpen(false);
          setValue(v.src);
          onPick?.(v);
        }}
      />
    </div>
  );
}

function VideoLibrary({
  open,
  onOpenChange,
  current,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: string;
  onPick: (video: LibraryVideo) => void;
}) {
  const [items, setItems] = useState<LibraryVideo[] | null>(null);

  // Muat ulang tiap kali dibuka supaya video yang baru diunggah ikut tampil
  useEffect(() => {
    if (open) listVideos().then(setItems, () => setItems([]));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] grid-rows-[auto_1fr] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pilih video</DialogTitle>
          <DialogDescription>Semua video yang pernah diunggah atau dipakai di situs. Klik video untuk memakainya.</DialogDescription>
        </DialogHeader>
        <div className="-mx-4 overflow-y-auto px-4">
          {!items ? (
            <p className="flex items-center gap-2 py-8 text-muted-foreground">
              <LoaderIcon className="size-4 animate-spin" />
              Memuat video…
            </p>
          ) : items.length === 0 ? (
            <p className="py-8 text-muted-foreground">Belum ada video. Unggah video baru dulu.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((v) => (
                <li key={v.src}>
                  <button
                    type="button"
                    onClick={() => onPick(v)}
                    className={cn(
                      "relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-ink ring-offset-2 outline-none hover:ring-2 hover:ring-ink focus-visible:ring-2 focus-visible:ring-ink",
                      v.src === current && "ring-2 ring-ink",
                    )}
                  >
                    {v.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.poster} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      // #t=1: tampilkan gambar dari detik pertama sebagai sampul
                      <video src={`${v.src}#t=1`} muted playsInline preload="metadata" className="pointer-events-none size-full object-cover" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-ink/70 p-2 text-paper">
                        <PlayIcon className="size-4" />
                      </span>
                    </span>
                    {v.src === current && (
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
