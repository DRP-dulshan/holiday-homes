"use client";

import { useActionState } from "react";
import { addManualBooking, type NewBookingState } from "../../../actions";
import { adminInput } from "../../../AdminForms";

export function NewBookingForm({ homes }: { homes: { slug: string; title: string; area: string; guests: number }[] }) {
  const [state, action, pending] = useActionState<NewBookingState, FormData>(addManualBooking, {});
  const err = state.fieldErrors ?? {};
  const label = "mb-1 block text-xs font-semibold text-ink-60";
  const e = (k: string) => (err[k] ? <span className="mt-1 block text-xs text-red-600">{err[k]}</span> : null);
  return (
    <form action={action} className="space-y-6">
      <section className="grid gap-4 rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={label}>Home</span>
          <select name="propertySlug" required defaultValue="" className={adminInput}>
            <option value="" disabled>
              Choose…
            </option>
            {homes.map((h) => (
              <option key={h.slug} value={h.slug}>
                {h.title} — {h.area}
              </option>
            ))}
          </select>
          {e("propertySlug")}
        </label>
        <label className="block">
          <span className={label}>Check-in</span>
          <input name="checkIn" type="date" required className={adminInput} />
          {e("checkIn")}
        </label>
        <label className="block">
          <span className={label}>Check-out</span>
          <input name="checkOut" type="date" required className={adminInput} />
          {e("checkOut")}
        </label>
        <label className="block">
          <span className={label}>Guests</span>
          <input name="guests" type="number" min={1} defaultValue={2} required className={adminInput} />
          {e("guests")}
        </label>
        <label className="block">
          <span className={label}>Promo code (optional)</span>
          <input name="promoCode" className={`${adminInput} uppercase`} />
        </label>
      </section>

      <section className="grid gap-4 rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:grid-cols-2">
        <label className="block">
          <span className={label}>Guest name</span>
          <input name="name" required className={adminInput} />
          {e("name")}
        </label>
        <label className="block">
          <span className={label}>Email (the confirmation goes here)</span>
          <input name="email" type="email" required className={adminInput} />
          {e("email")}
        </label>
        <label className="block">
          <span className={label}>Phone / WhatsApp</span>
          <input name="phone" type="tel" required className={adminInput} />
          {e("phone")}
        </label>
        <label className="block">
          <span className={label}>Country (optional)</span>
          <input name="country" className={adminInput} />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>Notes (optional)</span>
          <textarea name="specialRequests" rows={3} className={adminInput} />
        </label>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <fieldset className="space-y-2 text-sm text-ink-80">
          <legend className={label}>Status</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="confirmed" defaultChecked /> Confirmed — email the guest their confirmation now
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="pending" /> Pending — hold the dates, no email
          </label>
        </fieldset>
        <p className="mt-3 text-xs text-ink-60">
          The price follows the home&rsquo;s rate rules. Payment isn&rsquo;t taken on the website for team bookings.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Add booking"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </div>
    </form>
  );
}
