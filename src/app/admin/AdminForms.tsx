"use client";

import { useActionState } from "react";
import { createBlock, login, updateBookingStatus, type FormState } from "./actions";

export const adminInput =
  "w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function Message({ state }: { state: FormState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-emerald-700">{state.ok}</p>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={adminInput}
        />
      </label>
      <Message state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const ACTIONS = {
  // The guest is on Stripe Checkout; "Confirm" is for a payment taken another way.
  awaiting_payment: [
    { status: "confirmed", label: "Confirm", className: "btn-secondary" },
    { status: "cancelled", label: "Cancel", className: "btn-secondary" },
  ],
  pending: [
    { status: "confirmed", label: "Confirm", className: "btn-primary" },
    { status: "cancelled", label: "Decline", className: "btn-secondary" },
  ],
  confirmed: [{ status: "cancelled", label: "Cancel", className: "btn-secondary" }],
  cancelled: [{ status: "pending", label: "Re-open", className: "btn-secondary" }],
} as const;

export function BookingStatusForm({
  bookingRef,
  status,
}: {
  bookingRef: string;
  status: keyof typeof ACTIONS;
}) {
  const [state, action, pending] = useActionState(updateBookingStatus, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="ref" value={bookingRef} />
      {ACTIONS[status].map((a) => (
        <button
          key={a.status}
          type="submit"
          name="status"
          value={a.status}
          disabled={pending}
          className={`btn btn-sm ${a.className}`}
          onClick={(e) => {
            if (a.status === "cancelled" && !confirm(`${a.label} booking ${bookingRef}? The guest will be emailed.`))
              e.preventDefault();
          }}
        >
          {a.label}
        </button>
      ))}
      <Message state={state} />
    </form>
  );
}

export function BlockForm({ properties }: { properties: { slug: string; title: string; area: string }[] }) {
  const [state, action, pending] = useActionState(createBlock, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr_auto] lg:items-end">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-60">Home</span>
        <select name="propertySlug" required className={adminInput}>
          {properties.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title} — {p.area}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-60">From (first night)</span>
        <input name="start" type="date" required className={adminInput} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-60">Until (re-opens)</span>
        <input name="end" type="date" required className={adminInput} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-ink-60">Reason (internal)</span>
        <input name="reason" placeholder="Owner stay, maintenance…" className={adminInput} />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
        {pending ? "Saving…" : "Block dates"}
      </button>
      <div className="sm:col-span-2 lg:col-span-5">
        <Message state={state} />
      </div>
    </form>
  );
}
