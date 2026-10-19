import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Unggah foto dari panel admin (sudah diperkecil di browser, tapi beri ruang untuk PNG/GIF)
    serverActions: { bodySizeLimit: "10mb" },
  },
  async redirects() {
    return [
      // Link desain shower box lama (/konfigurator?model=...) ke halaman barunya; query ikut diteruskan
      { source: "/konfigurator", has: [{ type: "query", key: "model" }], destination: "/konfigurator/shower-box", permanent: true },
    ];
  },
  images: {
    // Foto draft dari Unsplash; loader meminta ukuran langsung ke CDN Unsplash
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
    qualities: [70, 75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
