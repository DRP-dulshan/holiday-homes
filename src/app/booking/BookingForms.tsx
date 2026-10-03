"use client";

import { useActionState, useState } from "react";
import { cancelBooking, lookupBooking, type CancelState, type LookupState } from "./actions";
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
