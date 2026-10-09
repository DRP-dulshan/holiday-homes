"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BookingError,
  bookingUrl,
  cancelBookingAsGuest,
  findBookingForGuest,
  saveCheckinDetails,
  verifyBookingToken,
} from "@/lib/server/bookings";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { sendMyBookingsLink } from "@/lib/server/my-bookings";

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

export type EmailLinkState = { error?: string; sent?: boolean };

/** "Email me all my bookings": the answer never reveals whether the address has any. */
export async function emailMyBookings(_prev: EmailLinkState, formData: FormData): Promise<EmailLinkState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`mybookings:${ip}`, 4, 15 * 60_000)) {
    return { error: "Too many requests — please wait a few minutes and try again." };
  }
  const email = String(formData.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter the email you booked with." };
  try {
    await sendMyBookingsLink(email);
  } catch (err) {
    console.error("[my-bookings] failed:", err);
    return { error: "We couldn't send that just now — please try again." };
  }
  return { sent: true };
}

export type CheckinState = { error?: string; ok?: boolean };

/** Guest names and arrival details, sent from the booking page. */
export async function submitCheckin(ref: string, token: string, _prev: CheckinState, formData: FormData): Promise<CheckinState> {
  if (!(await verifyBookingToken(ref, token))) return { error: "This link has expired — look up your booking again." };
  const guests: { name: string; nationality: string }[] = [];
  for (let i = 0; i < 30; i++) {
    const name = String(formData.get(`guestName${i}`) ?? "").trim().slice(0, 100);
    const nationality = String(formData.get(`guestNationality${i}`) ?? "").trim().slice(0, 60);
    if (name) guests.push({ name, nationality });
  }
  if (!guests.length) return { error: "Add the name of at least one guest." };
  try {
    await saveCheckinDetails(ref, {
      guests,
      arrivalTime: String(formData.get("arrivalTime") ?? "").trim().slice(0, 40) || undefined,
      flight: String(formData.get("flight") ?? "").trim().slice(0, 40) || undefined,
      notes: String(formData.get("notes") ?? "").trim().slice(0, 600) || undefined,
    });
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  return { ok: true };
}
