"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Property } from "@/data/properties";
import { bookingRules, site, whatsappLink } from "@/config/site";
import {
  addDays,
  formatShortDate,
  isIsoDate,
  rangesOverlap,
  todayIso,
} from "@/lib/dates";
import { aed, quoteStay, rateLines, validateStay } from "@/lib/pricing";
import { ContactForm } from "./ContactForm";
import { ApproxPrice } from "./CurrencyProvider";
import { BookDirectList } from "./BookDirect";
import { Modal } from "./Modal";
import { DateRangeCalendar } from "./booking/DateRangeCalendar";
import { useAvailability } from "./booking/useAvailability";
import { IconArrowRight, IconCalendar, IconWhatsApp } from "./icons";

export function BookingCard({ property }: { property: Property }) {
  const params = useSearchParams();
  const today = todayIso();
  const maxDate = addDays(today, bookingRules.maxAdvanceDays);

  const [dates, setDates] = useState(() => {
    const ci = params.get("checkIn") ?? "";
    const co = params.get("checkOut") ?? "";
    return isIsoDate(ci) && isIsoDate(co) && ci >= today && co > ci
      ? { checkIn: ci, checkOut: co }
      : { checkIn: "", checkOut: "" };
  });
  const [guests, setGuests] = useState(() => {
    const g = Number(params.get("guests"));
    return Number.isInteger(g) && g >= 1 ? Math.min(g, property.guests) : Math.min(2, property.guests);
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { unavailable, loading, error } = useAvailability(property.slug);
  const { checkIn, checkOut } = dates;

  const quote = useMemo(
    () => quoteStay(property, checkIn, checkOut),
    [property, checkIn, checkOut],
  );
  const { nights } = quote;

  const clash =
    nights > 0 && unavailable.some((r) => rangesOverlap(r, { start: checkIn, end: checkOut }));
  const ruleProblem = nights > 0 ? validateStay(property, checkIn, checkOut, guests, today) : null;
  const canReserve = nights > 0 && !clash && !ruleProblem && !loading;

  const reserveHref = `/book/${property.slug}?${new URLSearchParams({
    checkIn,
    checkOut,
    guests: String(guests),
  })}`;

  const message = `Hi DRP, I'd like to ask about ${property.title} (${property.area}).${
    nights
      ? ` Dates: ${checkIn} to ${checkOut} (${nights} night${nights === 1 ? "" : "s"}).`
      : " Dates: to be confirmed."
  } Guests: ${guests}.`;

  const body = (
    <div>
      <p className="text-sm text-ink-60">
        <span className="text-2xl font-semibold text-ink">
          AED {aed.format(property.pricePerNight)}
        </span>{" "}
        / night
      </p>

      <button
        type="button"
        onClick={() => setCalendarOpen((v) => !v)}
        aria-expanded={calendarOpen}
        className="mt-5 grid w-full grid-cols-2 gap-2 rounded-2xl border border-ink-20 p-1 text-left"
      >
        <span className="rounded-xl px-3 py-2 hover:bg-ink-05">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
            Check-in
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <IconCalendar className="h-3.5 w-3.5 text-brand" />
            {checkIn ? formatShortDate(checkIn) : "Add date"}
          </span>
        </span>
        <span className="rounded-xl border-l border-ink-10 px-3 py-2 hover:bg-ink-05">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
            Check-out
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <IconCalendar className="h-3.5 w-3.5 text-brand" />
            {checkOut ? formatShortDate(checkOut) : "Add date"}
          </span>
        </span>
      </button>

      {calendarOpen ? (
        <div className="mt-2 rounded-2xl border border-ink-10 p-3">
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-60">Loading availability…</p>
          ) : (
            <>
              <DateRangeCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(next) => {
                  setDates(next);
                  if (next.checkOut) setCalendarOpen(false);
                }}
                unavailable={unavailable}
                today={today}
                maxDate={maxDate}
                minNights={bookingRules.minNights}
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-ink-40">
                  <span className="line-through">12</span> = booked
                </span>
                {checkIn ? (
                  <button
                    type="button"
                    onClick={() => setDates({ checkIn: "", checkOut: "" })}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    Clear dates
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      <label className="mt-2 block rounded-2xl border border-ink-20 px-3 py-2 hover:bg-ink-05">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
          Guests
        </span>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full bg-transparent text-sm font-medium text-ink outline-none"
        >
          {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>

      {clash ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          Those dates are no longer available — please pick different dates.
        </p>
      ) : ruleProblem ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{ruleProblem}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-xs text-ink-60">
          Live availability couldn&rsquo;t be loaded — we&rsquo;ll double-check your dates when you
          book.
        </p>
      ) : null}

      {nights > 0 ? (
        <div className="mt-5 space-y-2 border-t border-ink-10 pt-4 text-sm text-ink-80">
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
              <span>{quote.discountLabel}</span>
              <span>−AED {aed.format(quote.discount)}</span>
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
          <div className="flex justify-between border-t border-ink-10 pt-2 text-base font-semibold text-ink">
            <span>Total</span>
            <span>AED {aed.format(quote.total)}</span>
          </div>
          <ApproxPrice aed={quote.total} className="block text-right text-xs text-ink-60" />
        </div>
      ) : (
        <p className="mt-5 border-t border-ink-10 pt-4 text-sm text-ink-60">
          Add your dates to see the total.
          {bookingRules.minNights > 1 ? ` Minimum stay ${bookingRules.minNights} nights.` : ""}
        </p>
      )}

      {canReserve ? (
        <Link href={reserveHref} className="btn btn-primary mt-5 w-full">
          Reserve
          <IconArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="btn btn-primary mt-5 w-full"
        >
          {nights > 0 ? "Change dates" : "Check availability"}
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setEnquireOpen((v) => !v)}
          className="btn btn-secondary btn-sm"
        >
          Ask a question
        </button>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
        >
          <IconWhatsApp className="h-4 w-4" />
          WhatsApp
        </a>
      </div>

      {enquireOpen ? (
        <div className="mt-4">
          <ContactForm
            defaultEnquiryType="stay"
            propertySlug={property.slug}
            source={`property:${property.slug}`}
            showTypeSelect={false}
            messagePlaceholder={`Ask about ${property.title}…`}
          />
        </div>
      ) : null}

      <BookDirectList />

      <p className="mt-4 text-center text-xs text-ink-40">
        You won&rsquo;t be charged yet. Or call {site.phoneDisplay}.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop sticky card */}
      <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">{body}</div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-ink-10 bg-canvas/95 px-5 py-3 backdrop-blur lg:hidden">
        <p className="text-sm text-ink-80">
          <span className="text-base font-semibold text-ink">
            AED {aed.format(property.pricePerNight)}
          </span>{" "}
          / night
        </p>
        <button type="button" onClick={() => setMobileOpen(true)} className="btn btn-primary btn-sm">
          {nights > 0 ? `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}` : "Check availability"}
        </button>
      </div>

      <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} title={property.title}>
        {body}
      </Modal>
    </>
  );
}

/** Placeholder shown while the booking card reads the URL on the client. */
export function BookingCardFallback() {
  return (
    <aside className="hidden lg:block">
      <div className="h-96 animate-pulse rounded-card border border-ink-10 bg-ink-05" />
    </aside>
  );
}
