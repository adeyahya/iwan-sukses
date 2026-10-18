import { GalleryClient } from "@/components/sections/gallery-client";
import { getContent } from "@/lib/content";

export async function Gallery() {
  const { gallery, settings } = await getContent();
  return <GalleryClient gallery={gallery} title={settings.sections.galleryTitle} lead={settings.sections.galleryLead} />;
}
