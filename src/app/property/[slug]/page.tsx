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
import { bedroomLabel } from "@/data/properties";
import { getProperty } from "@/lib/server/catalog";
import { approvedReviews } from "@/lib/server/reviews";
import { PropertyReviews } from "@/components/PropertyReviews";
import { JsonLd } from "@/components/JsonLd";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { ApproxPrice } from "@/components/CurrencyProvider";
import { siteUrl } from "@/config/site";

// Homes (and edits to them) come from the database, so pages render on request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/property/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Stay not found" };
  return {
    title: `${property.title}, ${property.area}`,
    description: property.description.slice(0, 155),
    alternates: { canonical: `/property/${property.slug}` },
    openGraph: { images: [{ url: property.image }] },
  };
}

export default async function PropertyPage({
  params,
}: PageProps<"/property/[slug]">) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();
  const reviews = await approvedReviews(property.slug).catch(() => []);
  const url = `${siteUrl()}/property/${property.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "VacationRental",
              "@id": `${url}#home`,
              name: property.title,
              description: property.description,
              url,
              identifier: property.slug,
              image: property.gallery.slice(0, 8),
              brand: { "@type": "Brand", name: "DRP Holiday Homes" },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dubai",
                addressRegion: property.area,
                addressCountry: "AE",
              },
              ...(property.lat != null && property.lng != null
                ? { latitude: property.lat, longitude: property.lng }
                : {}),
              containsPlace: {
                "@type": "Accommodation",
                additionalType: "EntirePlace",
                numberOfBedrooms: property.bedrooms,
                numberOfBathroomsTotal: property.bathrooms,
                occupancy: { "@type": "QuantitativeValue", minValue: 1, maxValue: property.guests },
                ...(property.sizeSqft
                  ? { floorSize: { "@type": "QuantitativeValue", value: property.sizeSqft, unitCode: "FTK" } }
                  : {}),
              },
              checkinTime: property.checkIn,
              checkoutTime: property.checkOut,
              ...(reviews.length
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: property.rating,
                      reviewCount: reviews.length,
                      bestRating: 5,
                    },
                    review: reviews.slice(0, 8).map((r) => ({
                      "@type": "Review",
                      author: { "@type": "Person", name: r.name },
                      datePublished: r.createdAt.slice(0, 10),
                      reviewBody: r.comment,
                      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
                    })),
                  }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
                { "@type": "ListItem", position: 2, name: "Explore", item: `${siteUrl()}/explore` },
                { "@type": "ListItem", position: 3, name: property.title, item: url },
              ],
            },
          ],
        }}
      />
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
                {property.building ? `${property.building} · ${property.area}` : property.area}
              </span>
              <h1 className="display mt-1 text-3xl font-semibold text-ink sm:text-4xl">
                {property.title}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <ShareButton title={property.title} />
                <SaveButton slug={property.slug} title={property.title} className="border border-ink-20 shadow-none" />
              </div>
            </div>
            {property.rating ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-05 px-3.5 py-2 text-sm font-semibold text-ink">
                <IconStar className="h-4 w-4 text-brand" />
                {property.rating}
                <span className="font-normal text-ink-60">({property.reviews} reviews)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-05 px-3.5 py-2 text-sm text-ink-80">
                From{" "}
                <span className="font-semibold text-ink">
                  AED {property.pricePerNight.toLocaleString("en-AE")}
                </span>{" "}
                / night
                <ApproxPrice aed={property.pricePerNight} className="text-ink-60" />
              </span>
            )}
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
                  {bedroomLabel(property.bedrooms)} · {property.bathrooms}{" "}
                  {property.bathrooms === 1 ? "bath" : "baths"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-brand-600" />
                  Sleeps {property.guests}
                </span>
                {property.sizeSqft ? (
                  <span className="inline-flex items-center gap-2">
                    <IconRuler className="h-5 w-5 text-brand-600" />
                    {property.sizeSqft.toLocaleString()} sq ft
                  </span>
                ) : null}
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
              <p className="mt-2 text-sm text-ink-80">
                {property.building ? `${property.building}, ` : ""}
                {property.area}, Dubai
                {property.mapsUrl ? (
                  <>
                    {" · "}
                    <a href={property.mapsUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:underline">
                      Open in Google Maps
                    </a>
                  </>
                ) : null}
              </p>
              <MapEmbed
                query={`${property.area}, Dubai, United Arab Emirates`}
                src={
                  property.lat != null && property.lng != null
                    ? `https://www.google.com/maps?q=${property.lat},${property.lng}&z=16&output=embed`
                    : undefined
                }
                label={property.title}
                className="mt-4 h-72"
              />

              <PropertyReviews reviews={reviews} />

              <div className="mt-10 rounded-card border border-ink-10 bg-ink-05 p-6 text-sm text-ink-80">
                Every DRP home is furnished by our own design studio and
                cleaned, inspected and restocked between stays. Guests can
                also rent the DRP car, collected from our office, and our
                team is on hand for the duration of their stay.
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
