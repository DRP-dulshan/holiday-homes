import { bookingRules } from "@/config/site";
import type { Property } from "@/data/properties";
import { addDays, nightsBetween, todayIso } from "./dates";

export const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

export type Quote = {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  tourismFee: number;
  total: number;
  currency: "AED";
};

export function quoteStay(property: Property, checkIn: string, checkOut: string): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * property.pricePerNight;
  const cleaningFee = nights ? property.cleaningFee : 0;
  const tourismFee = nights * bookingRules.tourismFeePerNight;
  return {
    nights,
    nightlyRate: property.pricePerNight,
    subtotal,
    cleaningFee,
    tourismFee,
    total: subtotal + cleaningFee + tourismFee,
    currency: "AED",
  };
}

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
