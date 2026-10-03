import { z } from "zod";
import { isIsoDate } from "./dates";

const isoDate = z.string().refine(isIsoDate, "Enter a valid date");

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
  acceptTerms: true,
  company: true,
});

export type GuestDetailsInput = z.infer<typeof guestDetailsSchema>;
