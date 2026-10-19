import type { Metadata } from "next";

import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getPublishedPosts } from "@/lib/content";

const title = "Blog";
const description = "Tips memilih kaca, perawatan, dan cerita proyek dari Iwan Sukses, distributor kaca di Probolinggo dan Bali.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title, description },
  twitter: { title, description },
};

export default async function BlogIndex() {
  const [first, ...rest] = await getPublishedPosts();
  return (
    <>
      <SiteHeader />
      <main className="py-12 sm:py-20">
        <Container>
          <span className="eyebrow mb-4 block">Blog</span>
          <h1 className="mb-10 max-w-[640px] text-[clamp(30px,4.6vw,52px)] leading-[1.08] font-bold tracking-[-0.02em] sm:mb-14">
            Tips kaca dan cerita proyek
            <span aria-hidden className="spark" />
          </h1>
          {!first ? (
            <p className="text-muted-foreground">Belum ada artikel. Nantikan tulisan pertama kami.</p>
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
