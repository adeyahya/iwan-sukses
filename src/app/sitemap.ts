import type { MetadataRoute } from "next";

import { configurators } from "@/lib/configurators";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/konfigurator`, changeFrequency: "monthly", priority: 0.8 },
    ...configurators.map((c) => ({ url: `${siteUrl}${c.path}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
