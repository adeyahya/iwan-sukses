type LoaderArgs = { src: string; width: number; quality?: number };

// Unsplash (imgix) memotong dan mengompres gambar sesuai parameter URL,
// jadi Next.js tidak perlu mengoptimasi ulang. File lokal dipakai apa adanya.
export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("https://images.unsplash.com/")) {
    return `${src}?w=${width}&q=${quality ?? 75}&auto=format&fit=crop`;
  }
  return src;
}
