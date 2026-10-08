import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { MapEmbed } from "@/components/MapEmbed";
import { IconArrowRight } from "@/components/icons";
import { areas } from "@/data/areas";
import { properties } from "@/data/properties";

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = areas.find((a) => a.slug === slug);
  if (!area) return { title: "Area not found" };
  return {
    title: `Stays in ${area.name}`,
    description: area.guide,
    openGraph: { images: [{ url: area.image }] },
  };
}

export default async function AreaPage({ params }: PageProps<"/areas/[slug]">) {
  const { slug } = await params;
  const area = areas.find((a) => a.slug === slug);
  if (!area) notFound();

  const stays = properties.filter((p) => p.area === area.name);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative h-[46vh] min-h-[340px] w-full">
          <Image
            src={area.image}
            alt={area.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={area.imagePosition ? { objectPosition: area.imagePosition } : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/40" />
          <div className="container-drp absolute inset-x-0 bottom-0 pb-10 text-white">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
              <span className="h-px w-6 bg-brand" />
              Areas we cover
            </span>
            <h1 className="display mt-3 text-4xl sm:text-5xl">{area.name}</h1>
            <p className="mt-2 max-w-xl text-white/75">{area.note}</p>
          </div>
        </div>

        <section className="bg-canvas py-14 md:py-20">
          <div className="container-drp grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <Reveal>
              <h2 className="display text-2xl font-semibold text-ink">
                What {area.name} is known for
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-80">{area.guide}</p>
              <p className="mt-4 text-sm font-semibold text-ink-60">
                Best for:{" "}
                <span className="font-normal text-ink-80">{area.bestFor}</span>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <MapEmbed
                query={`${area.name}, Dubai, United Arab Emirates`}
                label={area.name}
                className="h-64 lg:h-full"
              />
            </Reveal>
          </div>
        </section>

        <section className="bg-ink-05 py-14 md:py-20">
          <div className="container-drp">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display text-2xl font-semibold text-ink">
                Stays in {area.name}
              </h2>
              <Link
                href={`/explore?area=${area.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
              >
                See all filters
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {stays.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stays.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
                    <PropertyCard property={p} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-ink-60">
                No stays are published in {area.name} yet — message us and
                we&rsquo;ll let you know as soon as one is ready.
              </p>
            )}
          </div>
        </section>

        <section className="bg-canvas py-16 text-center">
          <div className="container-drp">
            <h2 className="display text-2xl font-semibold text-ink">
              Own a property in {area.name}?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-ink-80">
              DRP designs, furnishes and manages homes across this
              neighbourhood end-to-end.
            </p>
            <Link href="/owners" className="btn btn-primary mt-6">
              List your property with DRP
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
