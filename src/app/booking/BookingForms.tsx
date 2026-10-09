"use client";

import { useActionState, useState } from "react";
import {
  cancelBooking,
  emailMyBookings,
  lookupBooking,
  submitCheckin,
  type CancelState,
  type CheckinState,
  type EmailLinkState,
  type LookupState,
} from "./actions";
import { IconArrowRight } from "@/components/icons";

const input =
  "w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function LookupForm() {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookupBooking, {});
  return (
    <form action={action} className="grid gap-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
          Booking reference
        </span>
        <input name="ref" required placeholder="DRP-XXXXXX" className={`${input} uppercase`} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
          Email used to book
        </span>
        <input name="email" type="email" required placeholder="you@email.com" className={input} />
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Looking up…" : "Find my booking"}
        {!pending ? <IconArrowRight className="h-4 w-4" /> : null}
      </button>
    </form>
  );
}

export function CancelBookingButton({ bookingRef, token }: { bookingRef: string; token: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<CancelState>(
    cancelBooking.bind(null, bookingRef, token),
    {},
  );

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="btn btn-secondary">
        Cancel booking
      </button>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        Are you sure? This releases the dates to other guests and can&rsquo;t be undone online.
      </p>
      {state.error ? <p className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
        >
          {pending ? "Cancelling…" : "Yes, cancel my booking"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
          Keep it
        </button>
      </div>
    </form>
  );
}

/** For guests without their reference: an emailed link to all their bookings. */
export function EmailLinkForm() {
  const [state, action, pending] = useActionState<EmailLinkState, FormData>(emailMyBookings, {});
  if (state.sent) {
    return (
      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        If that email has bookings with us, a link to them is on its way. It works for 3 days.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">Email used to book</span>
        <input name="email" type="email" required placeholder="you@email.com" className={input} />
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-secondary">
        {pending ? "Sending…" : "Email me my bookings"}
      </button>
    </form>
  );
}

/** Everyone staying, plus arrival details, sent before check-in. */
export function CheckinForm({
  bookingRef,
  token,
  guests,
  saved,
}: {
  bookingRef: string;
  token: string;
  guests: number;
  saved?: { guests: { name: string; nationality: string }[]; arrivalTime?: string; flight?: string; notes?: string };
}) {
  const [state, action, pending] = useActionState<CheckinState, FormData>(
    submitCheckin.bind(null, bookingRef, token),
    {},
  );
  const small = "w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="space-y-3">
        {Array.from({ length: guests }, (_, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <input
              name={`guestName${i}`}
              defaultValue={saved?.guests[i]?.name}
              placeholder={i === 0 ? "Lead guest — full name" : `Guest ${i + 1} — full name`}
              aria-label={`Guest ${i + 1} full name`}
              className={small}
            />
            <input
              name={`guestNationality${i}`}
              defaultValue={saved?.guests[i]?.nationality}
              placeholder="Nationality"
              aria-label={`Guest ${i + 1} nationality`}
              className={small}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="arrivalTime" defaultValue={saved?.arrivalTime} placeholder="Expected arrival time, e.g. 18:30" className={small} />
        <input name="flight" defaultValue={saved?.flight} placeholder="Flight number (optional)" className={small} />
      </div>
      <textarea name="notes" defaultValue={saved?.notes} rows={2} placeholder="Anything we should know? (optional)" className={small} />
      <p className="text-xs text-ink-60">
        Please send a copy of each guest&rsquo;s passport or Emirates ID to the team by WhatsApp — Dubai rules
        require every guest to be registered. Don&rsquo;t upload documents here.
      </p>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Saved — thank you!</p> : null}
      <button type="submit" disabled={pending} className="btn btn-secondary btn-sm">
        {pending ? "Saving…" : saved ? "Update details" : "Save check-in details"}
      </button>
    </form>
  );
}
