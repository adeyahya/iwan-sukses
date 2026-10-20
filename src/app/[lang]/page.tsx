import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ArtGlass } from "@/components/sections/art-glass";
import { Contact } from "@/components/sections/contact";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Instagram } from "@/components/sections/instagram";
import { Locations } from "@/components/sections/locations";
import { Process } from "@/components/sections/process";
import { Products } from "@/components/sections/products";
import { ServiceStrip } from "@/components/sections/service-strip";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function Home() {
  return (
    <>
      <JsonLd />
      <SiteHeader />
      <main>
        <Hero />
        <ServiceStrip />
        <Products />
        <Gallery />
        <ArtGlass />
        <Process />
        <Locations />
        <Instagram />
        <Contact />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
