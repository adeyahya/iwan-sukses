import type { MetadataRoute } from "next";

import { siteDescription, siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Distributor Kaca`,
    short_name: siteName,
    description: siteDescription,
    lang: "id",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0A0A0B",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
