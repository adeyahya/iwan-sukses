import { GalleryClient } from "@/components/sections/gallery-client";
import { getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";

export async function Gallery() {
  const { gallery, settings } = await getLang().then(getContent);
  return <GalleryClient gallery={gallery} title={settings.sections.galleryTitle} lead={settings.sections.galleryLead} />;
}
