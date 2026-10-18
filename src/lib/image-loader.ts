type LoaderArgs = { src: string; width: number; quality?: number };

// Unsplash (imgix) memotong dan mengompres gambar sesuai parameter URL,
// jadi Next.js tidak perlu mengoptimasi ulang. Foto proyek (/proyek/<nama>, tanpa
// ekstensi) sudah disiapkan dalam dua lebar: <nama>-800.webp dan <nama>-1600.webp.
// File lokal lain dipakai apa adanya.
export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("https://images.unsplash.com/")) {
    return `${src}?w=${width}&q=${quality ?? 75}&auto=format&fit=crop`;
  }
  if (/^\/proyek\/[\w-]+$/.test(src)) {
    return `${src}-${width <= 800 ? 800 : 1600}.webp`;
  }
  return src;
}
