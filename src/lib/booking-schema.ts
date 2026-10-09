import { z } from "zod";
import { isIsoDate } from "./dates";

const isoDate = z.string().refine(isIsoDate, "Enter a valid date");

export const CAR_TYPES = [
  { value: "any", label: "No preference" },
  { value: "economy", label: "Economy" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV / family" },
  { value: "luxury", label: "Luxury" },
] as const;

export const CAR_PICKUPS = [
  { value: "airport", label: "Collect at the airport on arrival" },
  { value: "home", label: "Deliver to the home" },
] as const;

/** Extras guests can ask for. They aren't charged online: the team confirms availability and the price. */
export const EXTRAS = [
  { id: "airport-transfer", label: "Airport transfer" },
  { id: "early-checkin", label: "Early check-in" },
  { id: "late-checkout", label: "Late check-out" },
  { id: "baby-cot", label: "Baby cot or high chair" },
  { id: "extra-cleaning", label: "Extra cleaning mid-stay" },
] as const;
export type ExtraId = (typeof EXTRAS)[number]["id"];
const EXTRA_IDS = EXTRAS.map((e) => e.id) as [ExtraId, ...ExtraId[]];

/** "Airport transfer, Early check-in" */
export const describeExtras = (ids: readonly string[] = []) =>
  ids.map((id) => EXTRAS.find((e) => e.id === id)?.label ?? id).join(", ");

export type CarRequest = {
  type: (typeof CAR_TYPES)[number]["value"];
  pickup: (typeof CAR_PICKUPS)[number]["value"];
};

/** "SUV / family — deliver to the home" */
export function describeCar(car: CarRequest) {
  const type = CAR_TYPES.find((t) => t.value === car.type)?.label ?? car.type;
  const pickup = CAR_PICKUPS.find((p) => p.value === car.pickup)?.label ?? car.pickup;
  return `${type} — ${pickup.charAt(0).toLowerCase()}${pickup.slice(1)}`;
}

export const bookingRequestSchema = z.object({
  propertySlug: z.string().min(1),
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1).max(30),
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  country: z.string().trim().max(80).optional(),
  arrivalTime: z.string().trim().max(40).optional(),
  specialRequests: z.string().trim().max(1500).optional(),
  /** Rental car add-on — the team sends options and rates with the confirmation. */
  needCar: z.boolean().optional(),
  carType: z.enum(["any", "economy", "sedan", "suv", "luxury"]).optional(),
  carPickup: z.enum(["airport", "home"]).optional(),
  /** Other add-ons the guest would like a quote for. */
  extras: z.array(z.enum(EXTRA_IDS)).max(EXTRAS.length).optional(),
  /** A discount code, checked again on the server. */
  promoCode: z.string().trim().max(40).optional(),
  acceptTerms: z.literal(true, { error: "Please accept the booking terms" }),
  /** Honeypot — real people never fill this in. */
  company: z.string().max(0).optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/** The guest-entered part of the form (the stay itself comes from the URL). */
export const guestDetailsSchema = bookingRequestSchema.pick({
  name: true,
  email: true,
  phone: true,
  country: true,
  arrivalTime: true,
  specialRequests: true,
  needCar: true,
  carType: true,
  carPickup: true,
  extras: true,
  acceptTerms: true,
  company: true,
});

export type GuestDetailsInput = z.infer<typeof guestDetailsSchema>;
