import imageLoader from "@/lib/image-loader";

// Pratinjau kecil di admin; foto proyek tanpa ekstensi diarahkan ke versi 800 px
export const previewSrc = (src: string) => (src ? imageLoader({ src, width: 800 }) : "");
