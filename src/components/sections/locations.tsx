import { Container, SectionHead } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDict } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/data";

export async function Locations() {
  const [{ locations, settings }, { locations: t }] = await Promise.all([getContent(), getDict()]);
  return (
    <section id="lokasi" className="pb-12 sm:pb-24">
      <Container>
        <SectionHead
          overline={t.overline}
          title={settings.sections.locationsTitle}
          lead={settings.sections.locationsLead}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((l) => (
            <Card key={l.name} className="rounded-lg">
              <CardHeader className="gap-3">
                <Badge variant={l.main ? "default" : "secondary"} className="rounded-sm">
                  {l.tag}
                </Badge>
                <CardTitle className="font-heading text-lg">{l.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <address className="flex-1 text-sm leading-5 text-muted-foreground not-italic">{l.address}</address>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">{t.phone}</dt>
                  <dd>{l.phone.display}</dd>
                  <dt className="text-muted-foreground">{t.opens}</dt>
                  <dd>{l.opens}</dd>
                </dl>
              </CardContent>
              <CardFooter className="gap-2 border-t-0 bg-transparent">
                <a href={l.maps} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {t.route}
                </a>
                <a href={waLink(l.phone.number)} target="_blank" rel="noopener" className={buttonVariants({ size: "lg" })}>
                  WhatsApp
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-secondary p-6">
          <span className="eyebrow">{t.delivery}</span>
          {settings.lists.serviceAreas.map((a) => (
            <b key={a} className="font-heading font-medium">
              {a}
            </b>
          ))}
        </div>
      </Container>
    </section>
  );
}
