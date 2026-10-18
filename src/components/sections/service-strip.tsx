import { Container } from "@/components/section";
import { getContent } from "@/lib/content";

export async function ServiceStrip() {
  const { services, glassBrands } = (await getContent()).settings.lists;
  return (
    <>
      <div className="border-b py-6">
        <Container className="flex flex-wrap gap-x-8 gap-y-3 font-heading text-[15px] font-medium">
          {services.map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-2.5 bg-ink [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
              {s}
            </span>
          ))}
        </Container>
      </div>
      <div className="border-b bg-secondary py-4">
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="eyebrow">Merek kaca tersedia</span>
          {glassBrands.map((b) => (
            <b key={b} className="font-heading text-lg tracking-[0.02em] text-muted-foreground">
              {b}
            </b>
          ))}
        </Container>
      </div>
    </>
  );
}
