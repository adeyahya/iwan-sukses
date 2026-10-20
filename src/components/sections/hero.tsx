import { HeroGlass } from "@/components/hero-glass";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getDict } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export async function Hero() {
  const [{ settings }, t] = await Promise.all([getContent(), getDict()]);
  const { hero } = settings;
  return (
    <section className="dark relative isolate overflow-hidden bg-ink text-foreground">
      {/* Satu kanvas 3D untuk seluruh hero, supaya pola kisi di balik teks dan di balik kaca menyatu */}
      <HeroGlass focusId="hero-focus" fallbackImage={hero.fallbackImage} />
      <div className="relative mx-auto grid max-w-[1240px] px-4 sm:px-8 lg:min-h-[640px] lg:grid-cols-2 lg:px-16">
        {/* Teks; di HP turun ke bawah pita 3D */}
        <div className="relative flex flex-col justify-center py-6 pb-8 sm:py-16 lg:py-24 lg:pr-12">
          <div className="relative">
            <span className="eyebrow mb-2 block sm:mb-4">{hero.eyebrow}</span>
            <h1 className="mb-3 text-[30px] leading-[34px] font-bold tracking-[-0.02em] sm:mb-5 sm:text-[clamp(36px,3.9vw,54px)] sm:leading-[1.04]">
              {hero.title}
              <span aria-hidden className="spark" />
            </h1>
            <p className="mb-5 max-w-[560px] text-[15px] leading-[22px] text-muted-foreground sm:mb-8 sm:text-lg sm:leading-7">
              {hero.lead}
            </p>
            <div className="mb-5 flex gap-2 sm:mb-12 sm:gap-3">
              <a href="#kontak" className={cn(buttonVariants({ variant: "spark", size: "xl" }), "flex-1 sm:flex-none")}>
                {t.hero.quote}
              </a>
              <a href="#galeri" className={cn(buttonVariants({ variant: "outline", size: "xl" }), "flex-1 sm:flex-none")}>
                {t.hero.gallery}
              </a>
            </div>
            <dl className="grid grid-cols-3 gap-3 border-t pt-4 sm:w-fit sm:grid-cols-[repeat(3,auto)] sm:gap-8 sm:pt-6">
              {hero.facts.map((f) => (
                <div key={f.value}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="font-heading text-lg leading-6 font-bold sm:text-[22px] sm:leading-7">{f.value}</dd>
                  <dd className="text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-5">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Area fokus kamera: rak kaca tampil di sini (pita atas di HP, kolom kanan di desktop) */}
        <div id="hero-focus" className="pointer-events-none relative -order-1 -mx-4 h-[260px] sm:-mx-8 sm:h-[460px] lg:order-none lg:mx-0 lg:h-auto">
          <div className="pointer-events-none absolute bottom-6 left-6 hidden gap-2 sm:flex">
            {hero.badges.map((t) => (
              <Badge key={t} className="rounded-sm bg-paper text-ink">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
