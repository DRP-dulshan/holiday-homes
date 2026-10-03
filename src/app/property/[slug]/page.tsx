import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyGallery } from "@/components/PropertyGallery";
import { AmenitiesList } from "@/components/AmenitiesList";
import { BookingCard, BookingCardFallback } from "@/components/BookingCard";
import { MapEmbed } from "@/components/MapEmbed";
import { SimilarStays } from "@/components/SimilarStays";
import {
  IconArrowRight,
  IconBed,
  IconPin,
  IconRuler,
  IconStar,
  IconUsers,
} from "@/components/icons";
import { getProperty, properties } from "@/data/properties";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/property/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return { title: "Stay not found" };
  return {
    title: `${property.title}, ${property.area}`,
    description: property.description.slice(0, 155),
    openGraph: { images: [{ url: property.image }] },
  };
}

export default async function PropertyPage({
  params,
}: PageProps<"/property/[slug]">) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="container-drp pt-24 md:pt-28">
          <nav className="flex items-center gap-1.5 text-xs text-ink-60">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-brand-600">
              Explore
            </Link>
            <span>/</span>
            <span className="text-ink-80">{property.title}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
                <IconPin className="h-4 w-4" />
                {property.area}
              </span>
              <h1 className="display mt-1 text-3xl font-semibold text-ink sm:text-4xl">
                {property.title}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-05 px-3.5 py-2 text-sm font-semibold text-ink">
              <IconStar className="h-4 w-4 text-brand" />
              {property.rating}
              <span className="font-normal text-ink-60">({property.reviews} reviews)</span>
            </span>
          </div>

          <div className="mt-6">
            <PropertyGallery images={property.gallery} title={property.title} />
          </div>
        </div>

        <section className="bg-canvas py-12 md:py-16">
          <div className="container-drp grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-ink-10 pb-6 text-sm text-ink-80">
                <span className="inline-flex items-center gap-2">
                  <IconBed className="h-5 w-5 text-brand-600" />
                  {property.bedrooms} bedrooms · {property.bathrooms} baths
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-brand-600" />
                  Sleeps {property.guests}
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconRuler className="h-5 w-5 text-brand-600" />
                  {property.sizeSqft.toLocaleString()} sq ft
                </span>
                <span className="rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-600">
                  {property.tag}
                </span>
              </div>

              <h2 className="display mt-8 text-2xl font-semibold text-ink">
                About this home
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-80">
                {property.description}
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {property.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-ink-80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {h}
                  </li>
                ))}
              </ul>

              <h2 className="display mt-10 text-2xl font-semibold text-ink">
                What this place offers
              </h2>
              <div className="mt-5">
                <AmenitiesList amenities={property.amenities} />
              </div>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="display text-lg font-semibold text-ink">House rules</h3>
                  <ul className="mt-4 space-y-2 text-sm text-ink-80">
                    {property.houseRules.map((r) => (
                      <li key={r} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-20" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="display text-lg font-semibold text-ink">Check-in / check-out</h3>
                  <dl className="mt-4 space-y-2 text-sm text-ink-80">
                    <div className="flex justify-between border-b border-ink-10 pb-2">
                      <dt>Check-in</dt>
                      <dd className="font-semibold text-ink">after {property.checkIn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Check-out</dt>
                      <dd className="font-semibold text-ink">before {property.checkOut}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <h2 className="display mt-10 text-2xl font-semibold text-ink">Location</h2>
              <p className="mt-2 text-sm text-ink-80">{property.area}, Dubai</p>
              <MapEmbed
                query={`${property.area}, Dubai, United Arab Emirates`}
                label={property.area}
                className="mt-4 h-72"
              />

              <div className="mt-10 rounded-card border border-ink-10 bg-ink-05 p-6 text-sm text-ink-80">
                Every DRP home is furnished by our own design studio and
                cleaned, inspected and restocked between stays. Guests also
                get access to the DRP car fleet and a concierge for the
                duration of their stay.
                <Link
                  href="/about"
                  className="ml-1 inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                >
                  Read more about DRP
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <Suspense fallback={<BookingCardFallback />}>
              <BookingCard property={property} />
            </Suspense>
          </div>
        </section>

        <SimilarStays current={property} />
      </main>
      <Footer />
    </>
  );
}
