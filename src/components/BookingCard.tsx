"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/data/properties";
import { site, whatsappLink } from "@/config/site";
import { ContactForm } from "./ContactForm";
import { Modal } from "./Modal";
import { IconArrowRight, IconWhatsApp } from "./icons";

const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
const TOURISM_FEE_PER_NIGHT = 20; // AED, flat mock rate — shown as an estimate

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (!(b > a)) return 0;
  return Math.round((b - a) / 86_400_000);
}

export function BookingCard({ property }: { property: Property }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const { subtotal, tourismFee, total } = useMemo(() => {
    const n = nights || 0;
    const subtotal = n * property.pricePerNight;
    const tourismFee = n * TOURISM_FEE_PER_NIGHT;
    return { subtotal, tourismFee, total: subtotal + property.cleaningFee + tourismFee };
  }, [nights, property.pricePerNight, property.cleaningFee]);

  const message = `Hi DRP, I'd like to request to book ${property.title} (${property.area}).${
    nights
      ? ` Dates: ${checkIn} to ${checkOut} (${nights} night${nights === 1 ? "" : "s"}).`
      : " Dates: to be confirmed."
  } Guests: ${guests}.${nights ? ` Estimated total: AED ${aed.format(total)}.` : ""}`;

  const body = (
    <div>
      <p className="text-sm text-ink-60">
        <span className="text-2xl font-semibold text-ink">
          AED {aed.format(property.pricePerNight)}
        </span>{" "}
        / night
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-ink-20 p-1">
        <label className="rounded-xl px-3 py-2 hover:bg-ink-05">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
            Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </label>
        <label className="rounded-xl border-l border-ink-10 px-3 py-2 hover:bg-ink-05">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
            Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </label>
      </div>

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

      {nights > 0 ? (
        <div className="mt-5 space-y-2 border-t border-ink-10 pt-4 text-sm text-ink-80">
          <div className="flex justify-between">
            <span>
              AED {aed.format(property.pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}
            </span>
            <span>AED {aed.format(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>AED {aed.format(property.cleaningFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tourism Dirham fee (est.)</span>
            <span>AED {aed.format(tourismFee)}</span>
          </div>
          <div className="flex justify-between border-t border-ink-10 pt-2 text-base font-semibold text-ink">
            <span>Estimated total</span>
            <span>AED {aed.format(total)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-5 border-t border-ink-10 pt-4 text-sm text-ink-60">
          Add your dates to see an estimated total.
        </p>
      )}

      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary mt-5 w-full"
      >
        <IconWhatsApp className="h-4 w-4" />
        Request to book
      </a>
      <button
        type="button"
        onClick={() => setEnquireOpen((v) => !v)}
        className="btn btn-secondary mt-3 w-full"
      >
        Enquire instead
        <IconArrowRight className="h-4 w-4" />
      </button>

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

      <p className="mt-4 text-center text-xs text-ink-40">
        Or call {site.phoneDisplay} — you won&rsquo;t be charged yet.
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
          Check availability
        </button>
      </div>

      <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} title={property.title}>
        {body}
      </Modal>
    </>
  );
}
