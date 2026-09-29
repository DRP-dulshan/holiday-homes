import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { IconArrowRight, IconBed, IconPin, IconUsers } from "@/components/icons";
import { getProperty, properties } from "@/data/properties";
import { site } from "@/data/site";

const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/property/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return { title: "Stay not found — DRP Holiday Homes" };
  return {
    title: `${property.title}, ${property.area} — DRP Holiday Homes`,
    description: property.blurb,
  };
}

export default async function PropertyPage({
  params,
}: PageProps<"/property/[slug]">) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  const more = properties.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative h-[52vh] min-h-[380px] w-full">
          <Image
            src={property.image}
            alt={`${property.title}, ${property.area}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/30" />
          <div className="container-drp absolute inset-x-0 bottom-0 pb-10 text-white">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-brand-400">
              <IconPin className="h-4 w-4" />
              {property.area}
            </span>
            <h1 className="display mt-2 text-4xl sm:text-5xl">
              {property.title}
            </h1>
          </div>
        </div>

        <section className="bg-canvas py-16 md:py-20">
          <div className="container-drp grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-6 border-b border-ink-10 pb-6 text-sm text-ink-80">
                <span className="inline-flex items-center gap-2">
                  <IconBed className="h-5 w-5 text-brand-600" />
                  {property.bedrooms} bedrooms
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-brand-600" />
                  Sleeps {property.guests}
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-600">
                  {property.tag}
                </span>
              </div>

              <h2 className="display mt-8 text-2xl font-semibold text-ink">
                About this home
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-80">
                {property.blurb}
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-80">
                Like every home in the collection, this property is furnished by
                the DRP design studio, professionally cleaned between stays, and
                supported around the clock. Guests receive access to the DRP car
                fleet and concierge for the duration of their stay.
              </p>

              <div className="mt-8 rounded-card border border-ink-10 bg-ink-05 p-6 text-sm text-ink-60">
                This is a preview page built with sample data. A full gallery,
                amenity list, map and live availability calendar arrive in the
                next release.
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
                <p className="text-sm text-ink-60">
                  <span className="text-2xl font-semibold text-ink">
                    AED {aed.format(property.pricePerNight)}
                  </span>{" "}
                  / night
                </p>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Enquire about this stay
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink-20 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-600"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-ink-05 py-16 md:py-24">
          <div className="container-drp">
            <h2 className="display text-2xl font-semibold text-ink">
              More homes to consider
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PropertyMini key={p.id} slug={p.slug} title={p.title} area={p.area} image={p.image} />
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

function PropertyMini({
  slug,
  title,
  area,
  image,
}: {
  slug: string;
  title: string;
  area: string;
  image: string;
}) {
  return (
    <Link
      href={`/property/${slug}`}
      className="group overflow-hidden rounded-card border border-ink-10 bg-canvas shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
          {area}
        </span>
        <h3 className="display mt-1.5 text-base font-semibold text-ink">
          {title}
        </h3>
      </div>
    </Link>
  );
}
