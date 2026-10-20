import { CameraIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { QuoteForm } from "@/components/quote-form";
import { Container } from "@/components/section";
import { getDict } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/data";

export async function Contact() {
  const [{ settings, locations, stores }, t] = await Promise.all([getContent(), getDict()]);
  const { company, sections, lists } = settings;
  const main = locations.find((l) => l.main) ?? locations[0];
  return (
    <section id="kontak" className="dark relative overflow-hidden bg-background py-12 text-foreground sm:py-24">
      <div aria-hidden className="bg-lattice-dark absolute inset-0 opacity-60" />
      <Container className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="eyebrow mb-4 block">{t.contact.overline}</span>
          <h2 className="text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            {sections.contactTitle}
            <span aria-hidden className="spark" />
          </h2>
          <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">
            {sections.contactLead}
          </p>
          <ul className="mt-8 grid gap-6">
            {main && (
              <Info icon={<MapPinIcon />} label={main.tag}>
                {main.address}
              </Info>
            )}
            {stores.map((s) => (
              <Info key={s.number} icon={<PhoneIcon />} label={s.label}>
                <a href={waLink(s.number)} target="_blank" rel="noopener" className="hover:underline">
                  {s.display}
                </a>
              </Info>
            ))}
            <Info icon={<CameraIcon />} label="Instagram">
              <a href={company.instagram} target="_blank" rel="noopener" className="hover:underline">
                {company.instagramHandle}
              </a>
            </Info>
          </ul>
        </div>
        <QuoteForm stores={stores} options={lists.quoteOptions} />
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
