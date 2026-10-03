import "server-only";
import { bookingRules, site } from "@/config/site";
import { getProperty } from "@/data/properties";
import {
  addDays,
  formatDate,
  isIsoDate,
  rangesOverlap,
  todayIso,
  type DateRange,
} from "@/lib/dates";
import { aed, quoteStay, validateStay, type Quote } from "@/lib/pricing";
import type { BookingRequestInput } from "@/lib/booking-schema";
import { newId, newReference, sign, verify } from "./crypto";
import { absoluteUrl, sendMail, teamInbox } from "./mailer";
import { mutate, readAll } from "./store";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type Actor = "guest" | "admin" | "system";

export type Booking = {
  id: string;
  ref: string;
  propertySlug: string;
  propertyTitle: string;
  area: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guest: { name: string; email: string; phone: string; country?: string };
  arrivalTime?: string;
  specialRequests?: string;
  quote: Quote;
  status: BookingStatus;
  history: { status: BookingStatus; at: string; by: Actor; note?: string }[];
  createdAt: string;
  updatedAt: string;
};

/** Dates the team has closed manually (owner stays, maintenance…). */
export type Block = {
  id: string;
  propertySlug: string;
  start: string;
  /** Exclusive — the first night that is open again. */
  end: string;
  reason?: string;
  createdAt: string;
};

const BOOKINGS = "bookings";
const BLOCKS = "blocks";

export class BookingError extends Error {
  constructor(
    message: string,
    readonly code: "invalid" | "unavailable" | "not-found" | "forbidden" = "invalid",
  ) {
    super(message);
  }
}

const holdsDates = (b: Booking) => b.status !== "cancelled";

function takenRanges(slug: string, bookings: Booking[], blocks: Block[]): DateRange[] {
  return [
    ...bookings
      .filter((b) => b.propertySlug === slug && holdsDates(b))
      .map((b) => ({ start: b.checkIn, end: b.checkOut })),
    ...blocks.filter((b) => b.propertySlug === slug).map((b) => ({ start: b.start, end: b.end })),
  ];
}

/** Every night range that can't be booked for a property, from today on. */
export async function getUnavailableRanges(slug: string): Promise<DateRange[]> {
  const [bookings, blocks] = await Promise.all([
    readAll<Booking>(BOOKINGS),
    readAll<Block>(BLOCKS),
  ]);
  const today = todayIso();
  return takenRanges(slug, bookings, blocks)
    .filter((r) => r.end > today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Slugs of properties that are NOT free for the whole requested stay. */
export async function getUnavailableSlugs(checkIn: string, checkOut: string) {
  const stay = { start: checkIn, end: checkOut };
  const [bookings, blocks] = await Promise.all([
    readAll<Booking>(BOOKINGS),
    readAll<Block>(BLOCKS),
  ]);
  const taken = new Set<string>();
  for (const b of bookings)
    if (holdsDates(b) && rangesOverlap(stay, { start: b.checkIn, end: b.checkOut }))
      taken.add(b.propertySlug);
  for (const b of blocks) if (rangesOverlap(stay, b)) taken.add(b.propertySlug);
  return taken;
}

export async function isAvailable(slug: string, checkIn: string, checkOut: string) {
  const ranges = await getUnavailableRanges(slug);
  return !ranges.some((r) => rangesOverlap(r, { start: checkIn, end: checkOut }));
}

/* ------------------------------------------------------------------ */
/* Guest-facing access tokens                                          */
/* ------------------------------------------------------------------ */

export const bookingToken = (ref: string) => sign(`booking:${ref}`);
export const verifyBookingToken = (ref: string, token: string | null | undefined) =>
  verify(`booking:${ref}`, token);

export async function bookingUrl(ref: string) {
  return `/booking/${ref}?t=${await bookingToken(ref)}`;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function listBookings() {
  const rows = await readAll<Booking>(BOOKINGS);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBooking(ref: string) {
  const rows = await readAll<Booking>(BOOKINGS);
  return rows.find((b) => b.ref === ref.trim().toUpperCase()) ?? null;
}

export async function findBookingForGuest(ref: string, email: string) {
  const booking = await getBooking(ref);
  if (!booking) return null;
  return booking.guest.email.toLowerCase() === email.trim().toLowerCase() ? booking : null;
}

export async function listBlocks() {
  const rows = await readAll<Block>(BLOCKS);
  return rows.sort((a, b) => a.start.localeCompare(b.start));
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export async function createBooking(input: BookingRequestInput): Promise<Booking> {
  const property = getProperty(input.propertySlug);
  if (!property) throw new BookingError("That home no longer exists.", "not-found");

  const problem = validateStay(property, input.checkIn, input.checkOut, input.guests);
  if (problem) throw new BookingError(problem);

  const booking = await mutate<Booking, Booking>(BOOKINGS, async (bookings, read) => {
    const blocks = await read<Block>(BLOCKS);
    const clash = takenRanges(property.slug, bookings, blocks).some((r) =>
      rangesOverlap(r, { start: input.checkIn, end: input.checkOut }),
    );
    if (clash)
      throw new BookingError(
        "Sorry — those dates were just taken. Please choose different dates.",
        "unavailable",
      );

    let ref = newReference();
    while (bookings.some((b) => b.ref === ref)) ref = newReference();
    const now = new Date().toISOString();

    const created: Booking = {
      id: newId(),
      ref,
      propertySlug: property.slug,
      propertyTitle: property.title,
      area: property.area,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      guest: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        country: input.country || undefined,
      },
      arrivalTime: input.arrivalTime || undefined,
      specialRequests: input.specialRequests || undefined,
      quote: quoteStay(property, input.checkIn, input.checkOut),
      status: "pending",
      history: [{ status: "pending", at: now, by: "guest" }],
      createdAt: now,
      updatedAt: now,
    };
    bookings.push(created);
    return created;
  });

  await notifyNewBooking(booking);
  return booking;
}

export async function setBookingStatus(
  ref: string,
  status: BookingStatus,
  by: Actor,
  note?: string,
): Promise<Booking> {
  const updated = await mutate<Booking, Booking>(BOOKINGS, async (bookings, read) => {
    const booking = bookings.find((b) => b.ref === ref);
    if (!booking) throw new BookingError("Booking not found.", "not-found");
    if (booking.status === status) return booking;
    if (booking.status === "cancelled") {
      // Re-opening a cancelled booking must not double-book the dates.
      const blocks = await read<Block>(BLOCKS);
      const others = bookings.filter((b) => b.ref !== ref);
      const clash = takenRanges(booking.propertySlug, others, blocks).some((r) =>
        rangesOverlap(r, { start: booking.checkIn, end: booking.checkOut }),
      );
      if (clash)
        throw new BookingError("Those dates have since been taken by another stay.", "unavailable");
    }
    const now = new Date().toISOString();
    booking.status = status;
    booking.updatedAt = now;
    booking.history.push({ status, at: now, by, note: note || undefined });
    return booking;
  });

  await notifyStatusChange(updated, by);
  return updated;
}

export async function cancelBookingAsGuest(ref: string) {
  const booking = await getBooking(ref);
  if (!booking) throw new BookingError("Booking not found.", "not-found");
  if (booking.status === "cancelled") return booking;
  if (booking.checkIn <= todayIso())
    throw new BookingError(
      "This stay has already started — please contact the team to make changes.",
      "forbidden",
    );
  return setBookingStatus(ref, "cancelled", "guest");
}

export function cancellationTerms(booking: Pick<Booking, "checkIn">) {
  const freeUntil = addDays(booking.checkIn, -bookingRules.freeCancellationDays);
  return {
    freeUntil,
    isFree: todayIso() <= freeUntil,
  };
}

export async function addBlock(input: {
  propertySlug: string;
  start: string;
  end: string;
  reason?: string;
}) {
  if (!getProperty(input.propertySlug)) throw new BookingError("Unknown property.");
  if (!isIsoDate(input.start) || !isIsoDate(input.end) || input.end <= input.start)
    throw new BookingError("The end date must be after the start date.");
  return mutate<Block, Block>(BLOCKS, (blocks) => {
    const block: Block = {
      id: newId(),
      propertySlug: input.propertySlug,
      start: input.start,
      end: input.end,
      reason: input.reason?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    blocks.push(block);
    return block;
  });
}

export async function removeBlock(id: string) {
  return mutate<Block, boolean>(BLOCKS, (blocks) => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i === -1) return false;
    blocks.splice(i, 1);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

function summary(b: Booking) {
  const q = b.quote;
  return [
    `Reference: ${b.ref}`,
    `Home: ${b.propertyTitle}, ${b.area}`,
    `Check-in: ${formatDate(b.checkIn)}`,
    `Check-out: ${formatDate(b.checkOut)}`,
    `Nights: ${q.nights} · Guests: ${b.guests}`,
    `Total: AED ${aed.format(q.total)} (AED ${aed.format(q.nightlyRate)} × ${q.nights} nights, cleaning AED ${aed.format(q.cleaningFee)}, Tourism Dirham AED ${aed.format(q.tourismFee)})`,
  ].join("\n");
}

async function notifyNewBooking(b: Booking) {
  const manage = absoluteUrl(await bookingUrl(b.ref));
  await Promise.all([
    sendMail({
      to: b.guest.email,
      subject: `Booking request received — ${b.ref}`,
      replyTo: site.email,
      text: `Hi ${b.guest.name},

Thank you for choosing ${site.name}. We've received your booking request and the team is checking it now — you'll get a confirmation from us shortly, usually within a few hours.

${summary(b)}

No payment has been taken. Once your stay is confirmed we'll arrange payment with you directly.

View or cancel your booking: ${manage}

Questions? Reply to this email, call ${site.phoneDisplay} or WhatsApp ${site.whatsappNumber}.`,
    }),
    sendMail({
      to: teamInbox(),
      subject: `New booking request ${b.ref} — ${b.propertyTitle}`,
      replyTo: b.guest.email,
      text: `New booking request from the website.

${summary(b)}

Guest: ${b.guest.name}
Email: ${b.guest.email}
Phone: ${b.guest.phone}${b.guest.country ? `\nCountry: ${b.guest.country}` : ""}${b.arrivalTime ? `\nArrival time: ${b.arrivalTime}` : ""}${b.specialRequests ? `\nRequests: ${b.specialRequests}` : ""}

Review it in the dashboard: ${absoluteUrl("/admin/bookings")}`,
    }),
  ]);
}

async function notifyStatusChange(b: Booking, by: Actor) {
  const manage = absoluteUrl(await bookingUrl(b.ref));
  if (b.status === "confirmed") {
    await sendMail({
      to: b.guest.email,
      subject: `Your stay is confirmed — ${b.ref}`,
      replyTo: site.email,
      text: `Hi ${b.guest.name},

Great news — your stay at ${b.propertyTitle} is confirmed.

${summary(b)}

Check-in is from ${getProperty(b.propertySlug)?.checkIn ?? "15:00"}. We'll share access details and directions before you arrive.

Your booking: ${manage}`,
    });
  } else if (b.status === "cancelled") {
    await Promise.all([
      sendMail({
        to: b.guest.email,
        subject: `Booking cancelled — ${b.ref}`,
        replyTo: site.email,
        text: `Hi ${b.guest.name},

Your booking ${b.ref} for ${b.propertyTitle} (${formatDate(b.checkIn)} – ${formatDate(b.checkOut)}) has been cancelled${by === "guest" ? " as requested" : ""}.

If this wasn't expected, reply to this email or call ${site.phoneDisplay}.`,
      }),
      by === "guest"
        ? sendMail({
            to: teamInbox(),
            subject: `Guest cancelled ${b.ref} — ${b.propertyTitle}`,
            text: `${b.guest.name} cancelled their booking.\n\n${summary(b)}`,
          })
        : Promise.resolve(true),
    ]);
  }
}
