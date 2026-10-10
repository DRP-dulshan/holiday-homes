import "server-only";
import { bookingRules, site } from "@/config/site";
import { getAllProperties, getProperty, getPropertyAnyStatus } from "./catalog";
import {
  ICAL,
  importedRanges,
  listIcalDocs,
  OWN_UID_SUFFIX,
  syncStale,
  withoutOwnRange,
  type IcalDoc,
} from "./ical";
import {
  addDays,
  formatDate,
  isIsoDate,
  nightsBetween,
  rangesOverlap,
  todayIso,
  type DateRange,
} from "@/lib/dates";
import { accommodationTotal, aed, quoteStay, rateLines, validateStay, type PromoRule, type Quote } from "@/lib/pricing";
import { describeCar, describeExtras, type BookingRequestInput, type CarRequest } from "@/lib/booking-schema";
import { newId, newReference, sign, verify } from "./crypto";
import { absoluteUrl, sendMail, teamInbox } from "./mailer";
import { mutate, readAll } from "./store";
import {
  getPortalBusy,
  isPortalHome,
  pushBookingToPortal,
  pushStatusToPortal,
  PortalError,
  type PortalBookingPush,
} from "./portal";
import { evaluatePromo, normalizeCode, PROMOS, type Promo } from "./promos";
import {
  CHECKOUT_MINUTES,
  createCheckoutSession,
  createRefund,
  dashboardPaymentUrl,
  expireCheckoutSession,
  paymentsEnabled,
  retrieveCheckoutSession,
  type CheckoutSession,
} from "./stripe";

/**
 * - awaiting_payment: the guest is paying on Stripe; the dates are held until `payment.holdUntil`.
 * - pending: a request the team still has to confirm (when online payment is off).
 */
export type BookingStatus = "awaiting_payment" | "pending" | "confirmed" | "cancelled";
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
  /** Present when the guest asked for a rental car. */
  car?: CarRequest;
  /** Extras the guest asked for (ids from EXTRAS); the team quotes them separately. */
  extras?: string[];
  quote: Quote;
  /** Present when the guest was sent to Stripe Checkout. */
  payment?: Payment;
  /** When the post-stay review request email went out. */
  reviewRequestedAt?: string;
  /** Guest names and arrival details, filled in on the booking page before arrival. */
  checkin?: CheckinDetails;
  /** When the "arriving soon" email went out. */
  preArrivalSentAt?: string;
  /** Booked by the team (phone, WhatsApp…) rather than through the website. */
  source?: "website" | "admin";
  status: BookingStatus;
  history: { status: BookingStatus; at: string; by: Actor; note?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  provider: "stripe";
  status: "open" | "paid" | "expired";
  /** While unpaid, the dates are held until this time (ISO). */
  holdUntil: string;
  sessionId?: string;
  /** The Stripe Checkout page, while it's open. */
  url?: string;
  livemode?: boolean;
  /** Amount paid in AED. */
  amount?: number;
  paidAt?: string;
  paymentIntentId?: string;
  /** A paid booking was cancelled: the team refunds it from the admin (or the Stripe dashboard). */
  refundDue?: boolean;
  /** Total refunded to the guest so far, in AED. */
  refunded?: number;
  refundedAt?: string;
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

export type CheckinDetails = {
  guests: { name: string; nationality: string }[];
  arrivalTime?: string;
  flight?: string;
  notes?: string;
  submittedAt: string;
};

export class BookingError extends Error {
  constructor(
    message: string,
    readonly code: "invalid" | "unavailable" | "not-found" | "forbidden" = "invalid",
  ) {
    super(message);
  }
}

/** Unpaid holds outlive the Checkout Session by a few minutes, so a late payment still finds its dates. */
const HOLD_MINUTES = CHECKOUT_MINUTES + 5;

const holdExpired = (b: Booking, now = Date.now()) =>
  b.status === "awaiting_payment" && !!b.payment && Date.parse(b.payment.holdUntil) < now;

export const holdsDates = (b: Booking) => b.status !== "cancelled" && !holdExpired(b);

/** Live bookings that used a promo code (cancelled and lapsed bookings free the use). */
export const promoUses = (bookings: Booking[], code: string) => {
  const wanted = normalizeCode(code);
  return bookings.filter((b) => holdsDates(b) && b.quote.promo?.code === wanted).length;
};

function takenRanges(
  slug: string,
  bookings: Booking[],
  blocks: Block[],
  imported: IcalDoc[] = [],
): DateRange[] {
  return [
    ...importedRanges(imported, slug),
    ...bookings
      .filter((b) => b.propertySlug === slug && holdsDates(b))
      .map((b) => ({ start: b.checkIn, end: b.checkOut })),
    ...blocks.filter((b) => b.propertySlug === slug).map((b) => ({ start: b.start, end: b.end })),
  ];
}

/** How old an Airbnb calendar copy may be before a visitor's request refreshes it. */
const CALENDAR_MAX_AGE = 10 * 60_000;
/** Bookings are stricter: the copy must be this fresh when a booking is saved. */
const CALENDAR_BOOKING_MAX_AGE = 2 * 60_000;

/** Refreshes stale Airbnb calendar copies for these homes (all homes when none are given). */
async function refreshCalendars(slugs: string[] | null, maxAge: number) {
  try {
    const homes = (await getAllProperties()).filter((p) => !slugs || slugs.includes(p.slug));
    await syncStale(homes, maxAge);
  } catch (err) {
    console.error("[ical] refresh skipped:", err);
  }
}

/** Every night range that can't be booked for a property, from today on. */
export async function getUnavailableRanges(slug: string): Promise<DateRange[]> {
  await refreshCalendars([slug], CALENDAR_MAX_AGE);
  const [bookings, blocks, imported] = await Promise.all([
    readAll<Booking>(BOOKINGS),
    readAll<Block>(BLOCKS),
    listIcalDocs(),
  ]);
  const today = todayIso();
  const portal = (await getPortalBusy())[slug] ?? [];
  return [...takenRanges(slug, bookings, blocks, imported), ...portal]
    .filter((r) => r.end > today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * The nights this site holds for a home, for the iCal feed Airbnb imports: live bookings and the
 * team's own blocks. Dates imported *from* Airbnb are left out so they don't echo back.
 */
export async function exportEvents(slug: string) {
  const [bookings, blocks] = await Promise.all([readAll<Booking>(BOOKINGS), readAll<Block>(BLOCKS)]);
  const today = todayIso();
  return [
    ...bookings
      .filter((b) => b.propertySlug === slug && holdsDates(b) && b.checkOut > today)
      .map((b) => ({ uid: `booking-${b.id}${OWN_UID_SUFFIX}`, start: b.checkIn, end: b.checkOut, summary: "DRP booking" })),
    ...blocks
      .filter((b) => b.propertySlug === slug && b.end > today)
      .map((b) => ({ uid: `block-${b.id}${OWN_UID_SUFFIX}`, start: b.start, end: b.end, summary: "DRP — not available" })),
  ];
}

/** Slugs of properties that are NOT free for the whole requested stay. */
export async function getUnavailableSlugs(checkIn: string, checkOut: string) {
  const stay = { start: checkIn, end: checkOut };
  await refreshCalendars(null, CALENDAR_MAX_AGE);
  const [bookings, blocks, imported] = await Promise.all([
    readAll<Booking>(BOOKINGS),
    readAll<Block>(BLOCKS),
    listIcalDocs(),
  ]);
  const taken = new Set<string>();
  for (const doc of imported)
    if (importedRanges(imported, doc.slug).some((r) => rangesOverlap(stay, r))) taken.add(doc.slug);
  for (const b of bookings)
    if (holdsDates(b) && rangesOverlap(stay, { start: b.checkIn, end: b.checkOut }))
      taken.add(b.propertySlug);
  for (const b of blocks) if (rangesOverlap(stay, b)) taken.add(b.propertySlug);
  for (const [slug, ranges] of Object.entries(await getPortalBusy()))
    if (ranges.some((r) => rangesOverlap(stay, r))) taken.add(slug);
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

/** A guest's bookings, newest first (by the email they booked with). */
export async function listBookingsForEmail(email: string) {
  const wanted = email.trim().toLowerCase();
  return (await listBookings()).filter((b) => b.guest.email.toLowerCase() === wanted);
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

/**
 * Saves a booking under the store lock, so the same nights can't be taken twice.
 * With `payOnline` the dates are held while the guest pays on Stripe (see
 * `startCheckout`); otherwise it's a request for the team to confirm.
 */
export async function createBooking(
  input: BookingRequestInput,
  { payOnline = false, notify = true, source = "website" }: { payOnline?: boolean; notify?: boolean; source?: "website" | "admin" } = {},
): Promise<Booking> {
  const property = await getProperty(input.propertySlug);
  if (!property) throw new BookingError("That home no longer exists.", "not-found");

  const problem = validateStay(property, input.checkIn, input.checkOut, input.guests);
  if (problem) throw new BookingError(problem);

  // Make sure the Airbnb calendar copy is fresh before the dates are checked.
  await refreshCalendars([property.slug], CALENDAR_BOOKING_MAX_AGE);

  const booking = await mutate<Booking, Booking>(BOOKINGS, async (bookings, read) => {
    const blocks = await read<Block>(BLOCKS);
    const imported = await read<IcalDoc>(ICAL);
    const clash = takenRanges(property.slug, bookings, blocks, imported).some((r) =>
      rangesOverlap(r, { start: input.checkIn, end: input.checkOut }),
    );
    if (clash)
      throw new BookingError(
        "Sorry — those dates were just taken. Please choose different dates.",
        "unavailable",
      );

    // Re-check the promo code under the lock so a limited code can't be over-redeemed.
    let promoRule: PromoRule | undefined;
    if (input.promoCode?.trim()) {
      const result = evaluatePromo(
        await read<Promo>(PROMOS),
        input.promoCode,
        {
          slug: property.slug,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights: nightsBetween(input.checkIn, input.checkOut),
        },
        promoUses(bookings, input.promoCode),
      );
      if (!result.ok) throw new BookingError(result.error);
      promoRule = result.rule;
    }

    let ref = newReference();
    while (bookings.some((b) => b.ref === ref)) ref = newReference();
    const now = new Date();
    const at = now.toISOString();
    const status: BookingStatus = payOnline ? "awaiting_payment" : "pending";

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
      car: input.needCar
        ? { type: input.carType ?? "any", pickup: input.carPickup ?? "airport" }
        : undefined,
      extras: input.extras?.length ? input.extras : undefined,
      quote: quoteStay(property, input.checkIn, input.checkOut, promoRule),
      payment: payOnline
        ? {
            provider: "stripe",
            status: "open",
            holdUntil: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
          }
        : undefined,
      source: source === "admin" ? "admin" : undefined,
      status,
      history: [{ status, at, by: source === "admin" ? "admin" : "guest" }],
      createdAt: at,
      updatedAt: at,
    };
    bookings.push(created);
    return created;
  });

  // With the portal connected, it owns the calendar: it must accept the dates too (it also holds
  // Airbnb's), or this booking is dropped and the guest is asked to pick other dates.
  if (await isPortalHome(property.slug)) {
    try {
      await pushBookingToPortal(portalPayload(booking));
    } catch (err) {
      await mutate<Booking, void>(BOOKINGS, (rows) => {
        const i = rows.findIndex((b) => b.ref === booking.ref);
        if (i !== -1) rows.splice(i, 1);
      });
      if (err instanceof PortalError && err.status === 409)
        throw new BookingError("Sorry — those dates were just taken. Please choose different dates.", "unavailable");
      console.error(`[portal] booking ${booking.ref} was not accepted:`, err);
      throw new BookingError("We couldn't reserve those dates right now. Please try again in a moment.");
    }
  }

  // A paid booking is announced once Stripe confirms the payment.
  if (!payOnline && notify) await notifyNewBooking(booking);
  return booking;
}

const portalPayload = (b: Booking): PortalBookingPush => ({
  ref: b.ref,
  slug: b.propertySlug,
  checkIn: b.checkIn,
  checkOut: b.checkOut,
  guests: b.guests,
  status: b.status === "confirmed" ? "confirmed" : "tentative",
  guest: { name: b.guest.name, email: b.guest.email, phone: b.guest.phone, nationality: b.guest.country },
  quote: {
    nightlyRate: b.quote.nightlyRate,
    accommodation: accommodationTotal(b.quote),
    cleaningFee: b.quote.cleaningFee,
    tourismFee: b.quote.tourismFee,
    total: b.quote.total,
  },
  message: b.specialRequests,
  notes: [b.arrivalTime ? `Arrival ${b.arrivalTime}` : "", b.car ? "Car requested" : "", b.extras?.length ? `Extras: ${b.extras.join(", ")}` : ""]
    .filter(Boolean)
    .join(" · ") || undefined,
});

/** Tells the portal a booking was confirmed or cancelled here. Best effort: the portal keeps its own hold otherwise. */
async function syncPortalStatus(b: Booking | null) {
  if (!b || (b.status !== "confirmed" && b.status !== "cancelled")) return;
  try {
    if (!(await isPortalHome(b.propertySlug))) return;
    await pushStatusToPortal(b.ref, b.status, b.history.at(-1)?.note);
  } catch (err) {
    if (err instanceof PortalError && err.status === 404) return; // never reached the portal
    console.error(`[portal] couldn't update ${b.ref}:`, err);
  }
}

/**
 * Opens a Stripe Checkout Session for a booking that is awaiting payment and
 * returns its URL. If Stripe can't be reached the hold is released.
 */
export async function startCheckout(booking: Booking, origin: string) {
  const page = `${origin}/booking/${booking.ref}?t=${await bookingToken(booking.ref)}`;
  try {
    const session = await createCheckoutSession({
      ref: booking.ref,
      propertySlug: booking.propertySlug,
      propertyTitle: booking.propertyTitle,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      email: booking.guest.email,
      quote: booking.quote,
      // Stripe fills in {CHECKOUT_SESSION_ID} on the way back.
      successUrl: `${page}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${page}&payment=cancelled`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL.");
    await mutate<Booking, void>(BOOKINGS, (bookings) => {
      const b = bookings.find((x) => x.ref === booking.ref);
      if (!b?.payment) return;
      b.payment.sessionId = session.id;
      b.payment.url = session.url ?? undefined;
      b.payment.livemode = session.livemode;
      b.payment.holdUntil = new Date(
        session.expires_at * 1000 + (HOLD_MINUTES - CHECKOUT_MINUTES) * 60_000,
      ).toISOString();
    });
    return session.url;
  } catch (err) {
    await mutate<Booking, void>(BOOKINGS, (bookings) => {
      const b = bookings.find((x) => x.ref === booking.ref);
      if (!b || b.status !== "awaiting_payment") return;
      const at = new Date().toISOString();
      b.status = "cancelled";
      if (b.payment) b.payment.status = "expired";
      b.updatedAt = at;
      b.history.push({ status: "cancelled", at, by: "system", note: "Payment could not be started" });
    });
    throw err;
  }
}

/** When the guest's Stripe checkout closes, and whether they can still pay. */
export function paymentWindow(b: Booking) {
  if (b.status !== "awaiting_payment" || !b.payment?.url) return null;
  const deadline = new Date(Date.parse(b.payment.holdUntil) - (HOLD_MINUTES - CHECKOUT_MINUTES) * 60_000);
  return deadline.getTime() > Date.now() ? { url: b.payment.url, deadline } : null;
}

type PaymentOutcome = "paid" | "paid-unavailable" | "paid-recorded" | "expired" | null;

/**
 * Brings a booking in line with its Stripe Checkout Session: confirms it once
 * paid, or releases the dates when the session expired unpaid. Safe to call
 * any number of times (webhook retries, the guest's return page).
 */
export async function applyCheckoutSession(
  session: CheckoutSession,
  { failed = false }: { failed?: boolean } = {},
) {
  const ref = session.metadata?.ref ?? session.client_reference_id;
  if (!ref) return null;
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  // A completed but unpaid session is still processing (bank debits) unless Stripe says it failed.
  if (!paid && session.status !== "expired" && !failed) return getBooking(ref);

  let outcome = null as PaymentOutcome;
  const booking = await mutate<Booking, Booking | null>(BOOKINGS, async (bookings, read) => {
    const b = bookings.find((x) => x.ref === ref);
    // Ignore sessions this booking no longer tracks, and anything already settled.
    if (!b?.payment || b.payment.sessionId !== session.id || b.payment.status === "paid") return b ?? null;
    const at = new Date().toISOString();
    b.updatedAt = at;

    if (!paid) {
      b.payment.status = "expired";
      b.payment.url = undefined;
      if (b.status === "awaiting_payment") {
        b.status = "cancelled";
        b.history.push({
          status: "cancelled",
          at,
          by: "system",
          note: failed ? "Payment failed" : "Payment not completed in time",
        });
        outcome = "expired";
      }
      return b;
    }

    b.payment.status = "paid";
    b.payment.url = undefined;
    b.payment.paidAt = at;
    b.payment.amount = (session.amount_total ?? 0) / 100;
    b.payment.livemode = session.livemode;
    b.payment.paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (b.status === "pending" || b.status === "confirmed") {
      outcome = "paid-recorded";
      return b;
    }
    // Normally the hold kept the dates. If it lapsed (or the guest cancelled
    // while paying) and someone else booked them, the payment must be refunded.
    const blocks = await read<Block>(BLOCKS);
    const imported = withoutOwnRange(await read<IcalDoc>(ICAL), b);
    const others = bookings.filter((x) => x.ref !== ref);
    const clash = takenRanges(b.propertySlug, others, blocks, imported).some((r) =>
      rangesOverlap(r, { start: b.checkIn, end: b.checkOut }),
    );
    if (clash) {
      b.status = "cancelled";
      b.payment.refundDue = true;
      b.history.push({ status: "cancelled", at, by: "system", note: "Paid after the dates were taken — refund due" });
      outcome = "paid-unavailable";
    } else {
      b.status = "confirmed";
      b.history.push({ status: "confirmed", at, by: "system", note: "Paid online (Stripe)" });
      outcome = "paid";
    }
    return b;
  });

  if (booking && outcome) {
    await syncPortalStatus(booking);
    await notifyPayment(booking, outcome);
  }
  return booking;
}

/**
 * Checks Stripe for a booking that's still awaiting payment — used when the
 * guest returns from Checkout and on the dashboard, so the site stays correct
 * even if a webhook is late or not configured.
 */
export async function refreshPayment(booking: Booking): Promise<Booking> {
  const id = booking.payment?.sessionId;
  if (booking.status !== "awaiting_payment" || !id || !paymentsEnabled()) return booking;
  try {
    let session = await retrieveCheckoutSession(id);
    if (session.status === "open" && holdExpired(booking)) session = await expireCheckoutSession(id);
    return (await applyCheckoutSession(session)) ?? booking;
  } catch (err) {
    console.error(`[payment] couldn't refresh ${booking.ref}:`, err);
    return booking;
  }
}

/** Settles every unpaid hold that has run out (one Stripe call each). */
export async function settleExpiredHolds() {
  const rows = await readAll<Booking>(BOOKINGS);
  const now = Date.now();
  await Promise.all(
    rows
      .filter((b) => holdExpired(b, now))
      .map(async (b) => {
        if (b.payment?.sessionId) return refreshPayment(b);
        // Checkout never opened: just release the dates.
        await mutate<Booking, void>(BOOKINGS, (bookings) => {
          const x = bookings.find((y) => y.ref === b.ref);
          if (!x || !holdExpired(x)) return;
          const at = new Date().toISOString();
          x.status = "cancelled";
          if (x.payment) x.payment.status = "expired";
          x.updatedAt = at;
          x.history.push({ status: "cancelled", at, by: "system", note: "Payment not completed in time" });
        });
        await syncPortalStatus(await getBooking(b.ref));
      }),
  );
}

export async function setBookingStatus(
  ref: string,
  status: BookingStatus,
  by: Actor,
  note?: string,
): Promise<Booking> {
  // Close an open checkout first, so the guest can't pay after the team (or they)
  // moved the booking on. If they already paid, record that before going further.
  const current = await getBooking(ref);
  if (current?.payment?.status === "open" && current.payment.sessionId && paymentsEnabled()) {
    const session = await expireCheckoutSession(current.payment.sessionId);
    if (session.payment_status !== "unpaid") await applyCheckoutSession(session);
  }

  let changed = false as boolean;
  const updated = await mutate<Booking, Booking>(BOOKINGS, async (bookings, read) => {
    const booking = bookings.find((b) => b.ref === ref);
    if (!booking) throw new BookingError("Booking not found.", "not-found");
    if (booking.status === status) return booking;
    changed = true;
    if (booking.status === "cancelled") {
      // Re-opening a cancelled booking must not double-book the dates.
      const blocks = await read<Block>(BLOCKS);
      const imported = withoutOwnRange(await read<IcalDoc>(ICAL), booking);
      const others = bookings.filter((b) => b.ref !== ref);
      const clash = takenRanges(booking.propertySlug, others, blocks, imported).some((r) =>
        rangesOverlap(r, { start: booking.checkIn, end: booking.checkOut }),
      );
      if (clash)
        throw new BookingError("Those dates have since been taken by another stay.", "unavailable");
    }
    const now = new Date().toISOString();
    booking.status = status;
    booking.updatedAt = now;
    booking.history.push({ status, at: now, by, note: note || undefined });
    if (booking.payment?.status === "paid") booking.payment.refundDue = status === "cancelled";
    else if (booking.payment?.status === "open") {
      booking.payment.status = "expired";
      booking.payment.url = undefined;
    }
    return booking;
  });

  if (changed) {
    await syncPortalStatus(updated);
    await notifyStatusChange(updated, by);
  }
  return updated;
}

/**
 * A booking the team enters themselves (phone call, WhatsApp). It follows the same availability and
 * stay rules as the website. Confirming it emails the guest their confirmation.
 */
export async function createAdminBooking(input: BookingRequestInput, status: "pending" | "confirmed") {
  const booking = await createBooking(input, { payOnline: false, notify: false, source: "admin" });
  return status === "confirmed" ? setBookingStatus(booking.ref, "confirmed", "admin", "Added by the team") : booking;
}

/** Refunds part or all of what a guest paid online. Throws BookingError with a message the team can read. */
export async function refundBooking(ref: string, amountAed: number): Promise<Booking> {
  const booking = await getBooking(ref);
  if (!booking) throw new BookingError("Booking not found.", "not-found");
  const p = booking.payment;
  if (p?.status !== "paid" || !p.paymentIntentId) throw new BookingError("This booking wasn't paid online, so there's nothing to refund here.");
  const paid = p.amount ?? booking.quote.total;
  const left = Math.round((paid - (p.refunded ?? 0)) * 100) / 100;
  if (!Number.isFinite(amountAed) || amountAed <= 0) throw new BookingError("Enter the amount to refund.");
  if (amountAed > left) throw new BookingError(`At most AED ${aed.format(left)} can still be refunded.`);

  try {
    await createRefund(p.paymentIntentId, amountAed, ref);
  } catch (err) {
    console.error(`[refund] ${ref} failed:`, err);
    throw new BookingError("Stripe couldn't issue the refund. Check the payment in the Stripe dashboard.");
  }

  const updated = await mutate<Booking, Booking>(BOOKINGS, (bookings) => {
    const b = bookings.find((x) => x.ref === ref);
    if (!b?.payment) throw new BookingError("Booking not found.", "not-found");
    b.payment.refunded = Math.round(((b.payment.refunded ?? 0) + amountAed) * 100) / 100;
    b.payment.refundedAt = new Date().toISOString();
    b.payment.refundDue = false;
    b.updatedAt = b.payment.refundedAt;
    return b;
  });

  await sendMail({
    to: updated.guest.email,
    subject: `Refund issued — ${updated.ref}`,
    replyTo: site.email,
    text: `Hi ${updated.guest.name.split(" ")[0]},

We've refunded AED ${aed.format(amountAed)} for booking ${updated.ref} (${updated.propertyTitle}) to the card you paid with. Banks usually show it within 5–10 working days.

Questions? Reply to this email or WhatsApp ${site.whatsappNumber}.`,
  });
  return updated;
}

export async function saveCheckinDetails(ref: string, details: Omit<CheckinDetails, "submittedAt">) {
  return mutate<Booking, Booking>(BOOKINGS, (bookings) => {
    const b = bookings.find((x) => x.ref === ref);
    if (!b) throw new BookingError("Booking not found.", "not-found");
    if (b.status !== "confirmed" && b.status !== "pending") throw new BookingError("This booking can't be updated.");
    b.checkin = { ...details, submittedAt: new Date().toISOString() };
    b.updatedAt = b.checkin.submittedAt;
    return b;
  });
}

export async function markPreArrivalSent(ref: string) {
  await mutate<Booking, void>(BOOKINGS, (bookings) => {
    const b = bookings.find((x) => x.ref === ref);
    if (b) b.preArrivalSentAt = new Date().toISOString();
  });
}

/** Email a few days before check-in: what to expect, the check-in form and how to reach the team. */
export async function sendPreArrival(b: Booking) {
  const home = await getPropertyAnyStatus(b.propertySlug);
  const manage = absoluteUrl(await bookingUrl(b.ref));
  const rules = (home?.houseRules ?? []).slice(0, 5).map((r) => `• ${r}`).join("\n");
  return sendMail({
    to: b.guest.email,
    subject: `Arriving soon — ${b.propertyTitle}`,
    replyTo: site.email,
    text: `Hi ${b.guest.name.split(" ")[0]},

Your stay at ${b.propertyTitle} starts on ${formatDate(b.checkIn)}. Check-in is from ${home?.checkIn ?? "15:00"} and check-out is by ${home?.checkOut ?? "11:00"} on ${formatDate(b.checkOut)}.

${b.checkin ? "Thank you for sending your check-in details." : `To make arrival smooth, please add the names of everyone staying and your arrival time here:\n${manage}`}

Dubai regulations require the team to register every guest, so we'll also ask for a copy of each guest's passport or Emirates ID by WhatsApp (${site.whatsappNumber}) or reply to this email.

A few things to know:
${rules}

We'll send access details and directions before you arrive. Anything you need — reply to this email, call ${site.phoneDisplay} or WhatsApp ${site.whatsappNumber}.`,
  });
}

export async function markReviewRequested(ref: string) {
  await mutate<Booking, void>(BOOKINGS, (bookings) => {
    const b = bookings.find((x) => x.ref === ref);
    if (b) b.reviewRequestedAt = new Date().toISOString();
  });
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
  if (!(await getPropertyAnyStatus(input.propertySlug))) throw new BookingError("Unknown property.");
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
    `Total: AED ${aed.format(q.total)} (${[
      rateLines(q).map((l) => `AED ${aed.format(l.rate)} × ${l.nights} night${l.nights === 1 ? "" : "s"}`).join(" + "),
      q.discount ? `${q.discountLabel ?? "Discount"} −AED ${aed.format(q.discount)}` : "",
      q.promo ? `code ${q.promo.code} −AED ${aed.format(q.promo.amount)}` : "",
      q.cleaningFee ? `cleaning AED ${aed.format(q.cleaningFee)}` : "",
      `Tourism Dirham AED ${aed.format(q.tourismFee)}`,
    ]
      .filter(Boolean)
      .join(", ")})`,
  ].join("\n");
}

function guestDetails(b: Booking) {
  return `Guest: ${b.guest.name}
Email: ${b.guest.email}
Phone: ${b.guest.phone}${b.guest.country ? `\nCountry: ${b.guest.country}` : ""}${b.arrivalTime ? `\nArrival time: ${b.arrivalTime}` : ""}${b.specialRequests ? `\nRequests: ${b.specialRequests}` : ""}${b.car ? `\nRental car: ${describeCar(b.car)}` : ""}${b.extras?.length ? `\nExtras requested: ${describeExtras(b.extras)}` : ""}`;
}

function paymentLine(b: Booking) {
  const p = b.payment;
  if (p?.status !== "paid") return "";
  const link = p.paymentIntentId ? `\nStripe: ${dashboardPaymentUrl(p.paymentIntentId, !!p.livemode)}` : "";
  return `Paid online: AED ${aed.format(p.amount ?? b.quote.total)}${p.paidAt ? ` on ${formatDate(p.paidAt.slice(0, 10))}` : ""}${link}`;
}

const carNote = (b: Booking) =>
  `${b.car ? `\n\nRental car requested: ${describeCar(b.car)}. We'll send car options and rates separately.` : ""}${b.extras?.length ? `\n\nExtras requested: ${describeExtras(b.extras)}. We'll confirm availability and prices with you.` : ""}`;

async function notifyNewBooking(b: Booking) {
  const manage = absoluteUrl(await bookingUrl(b.ref));
  await Promise.all([
    sendMail({
      to: b.guest.email,
      subject: `Booking request received — ${b.ref}`,
      replyTo: site.email,
      text: `Hi ${b.guest.name},

Thank you for choosing ${site.name}. We've received your booking request and the team is checking it now — you'll get a confirmation from us shortly, usually within a few hours.

${summary(b)}${carNote(b)}

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

${guestDetails(b)}

Review it in the dashboard: ${absoluteUrl("/admin/bookings")}`,
    }),
  ]);
}

async function notifyPayment(b: Booking, outcome: NonNullable<PaymentOutcome>) {
  const checkInTime = (await getPropertyAnyStatus(b.propertySlug))?.checkIn ?? "15:00";
  if (outcome === "expired") return; // the guest left checkout; nothing was booked
  const manage = absoluteUrl(await bookingUrl(b.ref));
  const dashboard = absoluteUrl(`/admin/bookings?q=${b.ref}`);

  if (outcome === "paid-recorded") {
    await sendMail({
      to: teamInbox(),
      subject: `Payment received for ${b.ref} — ${b.propertyTitle}`,
      text: `The guest paid online for a booking that was already ${b.status}.\n\n${summary(b)}\n${paymentLine(b)}\n\n${dashboard}`,
    });
    return;
  }

  if (outcome === "paid-unavailable") {
    await Promise.all([
      sendMail({
        to: b.guest.email,
        subject: `About your payment — ${b.ref}`,
        replyTo: site.email,
        text: `Hi ${b.guest.name},

Thank you for your payment. Unfortunately your checkout took longer than the time we could hold ${b.propertyTitle} for, and the dates were booked by another guest in the meantime.

Our team will contact you shortly to offer a similar home or refund your payment in full.

${summary(b)}

Questions? Reply to this email, call ${site.phoneDisplay} or WhatsApp ${site.whatsappNumber}.`,
      }),
      sendMail({
        to: teamInbox(),
        subject: `ACTION: refund or rebook ${b.ref} — paid after dates were taken`,
        replyTo: b.guest.email,
        text: `A guest paid after their hold had lapsed and the dates were booked by someone else. Contact them to rebook, or refund the payment in Stripe.

${summary(b)}
${paymentLine(b)}

${guestDetails(b)}

${dashboard}`,
      }),
    ]);
    return;
  }

  await Promise.all([
    sendMail({
      to: b.guest.email,
      subject: `Your stay is confirmed — ${b.ref}`,
      replyTo: site.email,
      text: `Hi ${b.guest.name},

Thank you for booking with ${site.name} — your payment was received and your stay at ${b.propertyTitle} is confirmed.

${summary(b)}
${paymentLine(b).replace(/\nStripe:.*$/, "")}${carNote(b)}

Check-in is from ${checkInTime}. We'll share access details and directions before you arrive.

View or cancel your booking: ${manage}

Questions? Reply to this email, call ${site.phoneDisplay} or WhatsApp ${site.whatsappNumber}.`,
    }),
    sendMail({
      to: teamInbox(),
      subject: `New paid booking ${b.ref} — ${b.propertyTitle}`,
      replyTo: b.guest.email,
      text: `New booking paid online — it's confirmed automatically.

${summary(b)}
${paymentLine(b)}

${guestDetails(b)}

${dashboard}`,
    }),
  ]);
}

async function notifyStatusChange(b: Booking, by: Actor) {
  const checkInTime = (await getPropertyAnyStatus(b.propertySlug))?.checkIn ?? "15:00";
  const manage = absoluteUrl(await bookingUrl(b.ref));
  if (b.status === "confirmed") {
    await sendMail({
      to: b.guest.email,
      subject: `Your stay is confirmed — ${b.ref}`,
      replyTo: site.email,
      text: `Hi ${b.guest.name},

Great news — your stay at ${b.propertyTitle} is confirmed.

${summary(b)}

Check-in is from ${checkInTime}. We'll share access details and directions before you arrive.

Your booking: ${manage}`,
    });
  } else if (b.status === "cancelled") {
    const paid = b.payment?.status === "paid";
    // An unpaid checkout was never a booking for the guest or the team — no emails.
    if (!paid && b.history.at(-2)?.status === "awaiting_payment") return;
    await Promise.all([
      sendMail({
        to: b.guest.email,
        subject: `Booking cancelled — ${b.ref}`,
        replyTo: site.email,
        text: `Hi ${b.guest.name},

Your booking ${b.ref} for ${b.propertyTitle} (${formatDate(b.checkIn)} – ${formatDate(b.checkOut)}) has been cancelled${by === "guest" ? " as requested" : ""}.${paid ? `\n\nAny refund due under our cancellation policy will be returned to the card you paid with. The team will confirm the amount by email.` : ""}

If this wasn't expected, reply to this email or call ${site.phoneDisplay}.`,
      }),
      by === "guest" || paid
        ? sendMail({
            to: teamInbox(),
            subject: `${paid ? "REFUND DUE: " : ""}${by === "guest" ? "Guest cancelled" : "Cancelled"} ${b.ref} — ${b.propertyTitle}`,
            text: `${by === "guest" ? `${b.guest.name} cancelled their booking.` : "The booking was cancelled."}${paid ? `\n\nThis booking was paid online. Refund what's due under the cancellation policy (free until ${formatDate(cancellationTerms(b).freeUntil)}) from the Stripe dashboard.` : ""}

${summary(b)}${paid ? `\n${paymentLine(b)}` : ""}`,
          })
        : Promise.resolve(true),
    ]);
  }
}
