import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { hasLang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getDict, getLang } from "@/i18n/server";
import { getPublishedPosts } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/blog", dictionaries[lang].blog) : {};
}

export default async function BlogIndex() {
  const [lang, { blog: t }] = await Promise.all([getLang(), getDict()]);
  const list = await getPublishedPosts(lang);
  const [first, ...rest] = list;
  return (
    <>
      <SiteHeader />
      <main className="py-12 sm:py-20">
        <Container>
          <span className="eyebrow mb-4 block">{t.overline}</span>
          <h1 className="mb-10 max-w-[640px] text-[clamp(30px,4.6vw,52px)] leading-[1.08] font-bold tracking-[-0.02em] sm:mb-14">
            {t.heading}
            <span aria-hidden className="spark" />
          </h1>
          {t.languageNote && list.some((p) => p.locale !== lang) && <p className="-mt-6 mb-10 text-sm text-muted-foreground sm:-mt-10 sm:mb-14">{t.languageNote}</p>}
          {!first ? (
            <p className="text-muted-foreground">{t.empty}</p>
          ) : (
            <>
              <PostCard post={first} featured />
              {rest.length > 0 && (
                <div className="mt-14 grid gap-x-6 gap-y-12 border-t pt-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
