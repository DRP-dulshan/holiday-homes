"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BookingError,
  bookingUrl,
  cancelBookingAsGuest,
  findBookingForGuest,
  verifyBookingToken,
} from "@/lib/server/bookings";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export type LookupState = { error?: string };

export async function lookupBooking(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`lookup:${ip}`, 10, 10 * 60_000)) {
    return { error: "Too many attempts — please wait a few minutes and try again." };
  }

  const ref = String(formData.get("ref") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim();
  if (!ref || !email) return { error: "Enter your booking reference and email." };

  const booking = await findBookingForGuest(ref, email);
  if (!booking) {
    return { error: "We couldn't find a booking with that reference and email." };
  }
  redirect(await bookingUrl(booking.ref));
}

export type CancelState = { error?: string };

export async function cancelBooking(ref: string, token: string): Promise<CancelState> {
  if (!(await verifyBookingToken(ref, token))) {
    return { error: "This link has expired — look up your booking again." };
  }
  try {
    await cancelBookingAsGuest(ref);
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  redirect(await bookingUrl(ref));
}
