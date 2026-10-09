import Image from "next/image";
import { bedroomLabel, type Property } from "@/data/properties";
import { formatDate } from "@/lib/dates";
import { aed, rateLines, type Quote } from "@/lib/pricing";
import { IconStar } from "../icons";

/** Property + dates + price breakdown, used on checkout and booking pages. */
export function StaySummary({
  property,
  checkIn,
  checkOut,
  guests,
  quote,
  children,
}: {
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: Quote;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
      <div className="flex gap-4">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
          <Image src={property.image} alt={property.title} fill sizes="112px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
            {property.area}
          </p>
          <p className="display mt-1 font-semibold text-ink">{property.title}</p>
          {property.rating ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-60">
              <IconStar className="h-3.5 w-3.5 text-brand" />
              {property.rating} · {property.reviews} reviews
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-60">
              {bedroomLabel(property.bedrooms)} · sleeps {property.guests}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-10 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">Check-in</dt>
          <dd className="mt-1 font-medium text-ink">{formatDate(checkIn)}</dd>
          <dd className="text-xs text-ink-60">from {property.checkIn}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">Check-out</dt>
          <dd className="mt-1 font-medium text-ink">{formatDate(checkOut)}</dd>
          <dd className="text-xs text-ink-60">by {property.checkOut}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">Guests</dt>
          <dd className="mt-1 font-medium text-ink">
            {guests} {guests === 1 ? "guest" : "guests"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 space-y-2 border-t border-ink-10 pt-5 text-sm text-ink-80">
        {rateLines(quote).map((l) => (
          <div key={l.rate} className="flex justify-between">
            <span>
              AED {aed.format(l.rate)} × {l.nights} night{l.nights === 1 ? "" : "s"}
            </span>
            <span>AED {aed.format(l.rate * l.nights)}</span>
          </div>
        ))}
        {quote.discount ? (
          <div className="flex justify-between text-emerald-700">
            <span>{quote.discountLabel ?? "Stay discount"}</span>
            <span>−AED {aed.format(quote.discount)}</span>
          </div>
        ) : null}
        {quote.promo ? (
          <div className="flex justify-between text-emerald-700">
            <span>Promo code {quote.promo.code}</span>
            <span>−AED {aed.format(quote.promo.amount)}</span>
          </div>
        ) : null}
        {quote.cleaningFee > 0 ? (
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>AED {aed.format(quote.cleaningFee)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Tourism Dirham fee</span>
          <span>AED {aed.format(quote.tourismFee)}</span>
        </div>
        <div className="flex justify-between border-t border-ink-10 pt-3 text-base font-semibold text-ink">
          <span>Total (AED)</span>
          <span>AED {aed.format(quote.total)}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
