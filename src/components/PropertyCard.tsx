import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/data/properties";
import { IconArrowUpRight, IconBed, IconStar, IconUsers } from "./icons";

const aed = new Intl.NumberFormat("en-AE", {
  maximumFractionDigits: 0,
});

export function PropertyCard({
  property,
  query,
}: {
  property: Property;
  /** Search context (dates, guests) carried through to the booking card. */
  query?: string;
}) {
  return (
    <Link
      href={`/property/${property.slug}${query ? `?${query}` : ""}`}
      className="group flex flex-col overflow-hidden rounded-card border border-ink-10 bg-canvas shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.image}
          alt={`${property.title}, ${property.area}`}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-canvas/95 px-3 py-1 text-xs font-semibold text-ink shadow-soft">
          {property.tag}
        </span>
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-brand text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <IconArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
          {property.area}
        </span>
        <div className="mt-2 flex items-start justify-between gap-2">
          <h3 className="display text-lg font-semibold text-ink">
            {property.title}
          </h3>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
            <IconStar className="h-3.5 w-3.5 text-brand" />
            {property.rating}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-5 text-sm text-ink-80">
          <span className="inline-flex items-center gap-1.5">
            <IconBed className="h-4 w-4 text-ink-60" />
            {property.bedrooms} bed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsers className="h-4 w-4 text-ink-60" />
            {property.guests} guests
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-ink-10 pt-4">
          <p className="text-sm text-ink-60">
            <span className="text-base font-semibold text-ink">
              AED {aed.format(property.pricePerNight)}
            </span>{" "}
            / night
          </p>
          <span className="text-sm font-semibold text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
