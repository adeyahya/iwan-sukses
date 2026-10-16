import { CameraIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { QuoteForm } from "@/components/quote-form";
import { Container } from "@/components/section";
import { company, waLink, whatsapp } from "@/lib/data";

export function Contact() {
  return (
    <section id="kontak" className="dark relative overflow-hidden bg-background py-12 text-foreground sm:py-24">
      <div aria-hidden className="bg-lattice-dark absolute inset-0 opacity-60" />
      <Container className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="eyebrow mb-4 block">Kontak</span>
          <h2 className="text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            Minta penawaran hari ini
            <span aria-hidden className="spark" />
          </h2>
          <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">
            Tulis kebutuhan Anda dan pilih toko terdekat. Kami balas dengan harga dan estimasi waktu.
          </p>
          <ul className="mt-8 grid gap-6">
            <Info icon={<MapPinIcon />} label="Pusat">Jl. Raya Tempuran, Bantaran, Kab. Probolinggo</Info>
            <Info icon={<PhoneIcon />} label="Probolinggo">
              <a href={waLink(whatsapp.probolinggo.number)} target="_blank" rel="noopener" className="hover:underline">
                {whatsapp.probolinggo.display}
              </a>
            </Info>
            <Info icon={<PhoneIcon />} label="Bali (Tabanan)">
              <a href={waLink(whatsapp.bali.number)} target="_blank" rel="noopener" className="hover:underline">
                {whatsapp.bali.display}
              </a>
            </Info>
            <Info icon={<CameraIcon />} label="Instagram">
              <a href={company.instagram} target="_blank" rel="noopener" className="hover:underline">
                {company.instagramHandle}
              </a>
            </Info>
          </ul>
        </div>
        <QuoteForm />
      </Container>
    </section>
  );
}

function Info({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[24px_1fr] gap-3 [&_svg]:size-[22px] [&_svg]:stroke-[1.75]">
      {icon}
      <div>
        <small className="block text-xs leading-4 tracking-[0.01em] text-muted-foreground">{label}</small>
        {children}
      </div>
    </li>
  );
}
