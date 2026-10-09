import { bookingRules } from "@/config/site";
import type { Property } from "@/data/properties";
import { addDays, nightsBetween, todayIso } from "./dates";

export const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

/** A promo code reduced to what the quote needs. */
export type PromoRule = { code: string; type: "percent" | "fixed"; value: number };

export type Quote = {
  nights: number;
  /** Average nightly rate (the base rate when every night costs the same). */
  nightlyRate: number;
  /** Nightly rates before any discount. */
  subtotal: number;
  /** Nights grouped by rate, e.g. two weekend nights at a higher rate. Older bookings don't have it. */
  lines?: { rate: number; nights: number }[];
  /** Weekly / monthly stay discount, in AED (0 = none). */
  discount?: number;
  discountLabel?: string;
  /** A promo code the guest applied. */
  promo?: { code: string; amount: number };
  cleaningFee: number;
  tourismFee: number;
  total: number;
  currency: "AED";
};

/** Day of week (0 = Sunday) of an ISO date. */
const dayOfWeek = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();

/**
 * The rate for the night starting on `date`: a seasonal / event rate wins, then the weekend rate
 * (Friday and Saturday nights), then the standard nightly rate.
 */
export function nightRate(property: Property, date: string): number {
  const rules = property.pricing;
  const season = rules?.seasons?.find((s) => date >= s.from && date <= s.to);
  if (season) return season.rate;
  const dow = dayOfWeek(date);
  if (rules?.weekendRate && (dow === 5 || dow === 6)) return rules.weekendRate;
  return property.pricePerNight;
}

export function promoAmount(promo: PromoRule, base: number) {
  const raw = promo.type === "percent" ? (base * promo.value) / 100 : promo.value;
  return Math.max(0, Math.min(base, Math.round(raw)));
}

export function quoteStay(
  property: Property,
  checkIn: string,
  checkOut: string,
  promo?: PromoRule | null,
): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const byRate = new Map<number, number>();
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const rate = nightRate(property, addDays(checkIn, i));
    subtotal += rate;
    byRate.set(rate, (byRate.get(rate) ?? 0) + 1);
  }

  const rules = property.pricing;
  let discountPct = 0;
  let discountLabel: string | undefined;
  if (nights >= 28 && rules?.monthlyDiscountPct) {
    discountPct = rules.monthlyDiscountPct;
    discountLabel = `Monthly stay discount (${discountPct}%)`;
  } else if (nights >= 7 && rules?.weeklyDiscountPct) {
    discountPct = rules.weeklyDiscountPct;
    discountLabel = `Weekly stay discount (${discountPct}%)`;
  }
  const discount = Math.round((subtotal * discountPct) / 100);
  const promoOff = promo ? promoAmount(promo, subtotal - discount) : 0;

  const cleaningFee = nights ? property.cleaningFee : 0;
  const tourismFee = nights * bookingRules.tourismFeePerNight;
  return {
    nights,
    nightlyRate: nights ? Math.round(subtotal / nights) : property.pricePerNight,
    subtotal,
    lines: [...byRate.entries()].map(([rate, n]) => ({ rate, nights: n })),
    discount: discount || undefined,
    discountLabel: discount ? discountLabel : undefined,
    promo: promo && promoOff ? { code: promo.code, amount: promoOff } : undefined,
    cleaningFee,
    tourismFee,
    total: subtotal - discount - promoOff + cleaningFee + tourismFee,
    currency: "AED",
  };
}

/** What the guest pays for the stay itself: nightly rates less any discount and promo. */
export const accommodationTotal = (q: Quote) => q.subtotal - (q.discount ?? 0) - (q.promo?.amount ?? 0);

/** The nightly-rate lines for a summary, tolerating bookings saved before rates could vary. */
export const rateLines = (q: Quote) => q.lines ?? [{ rate: q.nightlyRate, nights: q.nights }];

/**
 * Validates a requested stay against the booking rules (not availability).
 * Returns an error message, or null when the stay is acceptable.
 */
export function validateStay(
  property: Property,
  checkIn: string,
  checkOut: string,
  guests: number,
  today = todayIso(),
): string | null {
  const nights = nightsBetween(checkIn, checkOut);
  if (!nights) return "Choose a check-out date after your check-in date.";
  if (checkIn < today) return "Check-in can't be in the past.";
  if (checkIn > addDays(today, bookingRules.maxAdvanceDays))
    return `Bookings open up to ${bookingRules.maxAdvanceDays} days ahead.`;
  if (nights < bookingRules.minNights)
    return `This home has a ${bookingRules.minNights}-night minimum stay.`;
  if (nights > bookingRules.maxNights)
    return `Stays longer than ${bookingRules.maxNights} nights are arranged directly — please enquire.`;
  if (!Number.isInteger(guests) || guests < 1) return "Add at least one guest.";
  if (guests > property.guests) return `This home sleeps up to ${property.guests} guests.`;
  return null;
}
