import Link from "next/link";
import { properties } from "@/data/properties";
import { PropertyCard } from "./PropertyCard";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconArrowRight } from "./icons";

// A spread of homes across areas for the homepage grid — the full collection lives at /explore.
const FEATURED_SLUGS = [
  "st-regis-residences-30th-floor-palm-jumeirah",
  "difc-penthouse-city-skyline-signature-living",
  "shoreline-palm-jumeirah-garden-view-paradise",
  "sparkle-towers-marina-stunning-views-jbr-beach",
  "seven-palm-1br-west-beach-living-at-his-finest",
  "stylish-1br-with-balcony-heart-of-business-bay",
];

export function FeaturedStays() {
  const featured = FEATURED_SLUGS.map((slug) =>
    properties.find((p) => p.slug === slug),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section id="stays" className="bg-ink-05 py-24 md:py-32">
      <div className="container-drp">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Featured stays"
            title="A few homes from the current collection."
            intro="Hand-picked across Dubai's most sought-after addresses — each one designed, furnished and managed by DRP."
          />
          <Reveal delay={0.1}>
            <Link
              href="/explore"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-ink-20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-600 md:inline-flex"
            >
              Explore all stays
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 0.08}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-ink-20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-600"
          >
            Explore all stays
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
