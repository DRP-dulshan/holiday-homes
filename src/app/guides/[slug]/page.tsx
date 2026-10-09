import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { JsonLd } from "@/components/JsonLd";
import { IconArrowRight } from "@/components/icons";
import { site, siteUrl } from "@/config/site";
import { areas } from "@/data/areas";
import { getGuide, guides } from "@/data/guides";
import { formatDate } from "@/lib/dates";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  const cover = areas.find((a) => a.slug === guide.coverArea);
  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.excerpt, images: cover ? [{ url: cover.image }] : undefined },
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const cover = areas.find((a) => a.slug === guide.coverArea);
  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.excerpt,
          datePublished: guide.published,
          dateModified: guide.published,
          image: cover?.image,
          mainEntityOfPage: `${siteUrl()}/guides/${guide.slug}`,
          author: { "@type": "Organization", name: site.name },
          publisher: { "@type": "Organization", name: site.name },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <div className="relative h-[40vh] min-h-[300px] w-full">
          {cover ? (
            <Image src={cover.image} alt={cover.alt} fill priority sizes="100vw" className="object-cover" style={cover.imagePosition ? { objectPosition: cover.imagePosition } : undefined} />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/40" />
          <div className="container-drp absolute inset-x-0 bottom-0 max-w-3xl pb-10 text-white">
            <Link href="/guides" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400 hover:underline">
              ← Travel guides
            </Link>
            <h1 className="display mt-3 text-3xl leading-tight sm:text-4xl">{guide.title}</h1>
            <p className="mt-3 text-sm text-white/70">
              {formatDate(guide.published)} · {guide.minutes} min read
            </p>
          </div>
        </div>

        <article className="bg-canvas py-12 md:py-16">
          <div className="container-drp max-w-3xl">
            {guide.blocks.map((b, i) => {
              if (b.type === "h2")
                return (
                  <h2 key={i} className="display mt-10 text-2xl font-semibold text-ink first:mt-0">
                    {b.text}
                  </h2>
                );
              if (b.type === "list")
                return (
                  <ul key={i} className="mt-4 space-y-2 text-base leading-relaxed text-ink-80">
                    {b.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {it}
                      </li>
                    ))}
                  </ul>
                );
              if (b.type === "tip")
                return (
                  <p key={i} className="mt-8 rounded-2xl bg-brand-soft p-5 text-sm leading-relaxed text-ink">
                    <strong className="text-brand-600">Tip: </strong>
                    {b.text}
                  </p>
                );
              return (
                <p key={i} className="mt-4 text-base leading-relaxed text-ink-80">
                  {b.text}
                </p>
              );
            })}

            <div className="mt-12 rounded-card border border-ink-10 bg-ink-05 p-6 text-center">
              <p className="display text-lg font-semibold text-ink">Ready to find your home in Dubai?</p>
              <Link href="/explore" className="btn btn-primary mt-4">
                Explore stays
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>

        <section className="bg-ink-05 py-12 md:py-16">
          <div className="container-drp">
            <h2 className="display text-xl font-semibold text-ink">More guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {others.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft transition-colors hover:border-brand/40">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">{g.minutes} min read</span>
                  <span className="display mt-1.5 block font-semibold text-ink">{g.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
