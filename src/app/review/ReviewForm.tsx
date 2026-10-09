"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "./actions";
import { IconBadgeCheck, IconStar } from "@/components/icons";

const input =
  "w-full rounded-2xl border bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function ReviewForm({ bookingRef, token, defaultName }: { bookingRef: string; token: string; defaultName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview.bind(null, bookingRef, token), {});
  const [rating, setRating] = useState(0);
  const err = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-card border border-ink-10 bg-canvas p-8 text-center shadow-soft">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-600">
          <IconBadgeCheck className="h-6 w-6" />
        </span>
        <h2 className="display mt-5 text-xl font-semibold text-ink">Thank you for your review!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-60">
          The team checks reviews before they appear on the website, usually within a day.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">Your rating</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <IconStar
                className={`h-9 w-9 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${
                  n <= rating ? "text-brand" : "text-ink-20 hover:text-brand/60"
                }`}
              />
              <span className="sr-only">{n} star{n === 1 ? "" : "s"}</span>
            </label>
          ))}
        </div>
        {err.rating ? <p className="mt-1.5 text-xs text-red-600">{err.rating}</p> : null}
      </fieldset>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">Your review</span>
        <textarea
          name="comment"
          rows={5}
          placeholder="What did you like? Anything we could do better?"
          className={`${input} ${err.comment ? "border-red-400" : "border-ink-20"}`}
        />
        {err.comment ? <span className="mt-1.5 block text-xs text-red-600">{err.comment}</span> : null}
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">Name to show</span>
        <input name="name" defaultValue={defaultName} className={`${input} ${err.name ? "border-red-400" : "border-ink-20"}`} />
        {err.name ? <span className="mt-1.5 block text-xs text-red-600">{err.name}</span> : null}
        <span className="mt-1 block text-xs text-ink-40">Shown with your review. A first name and initial is fine.</span>
      </label>

      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {state.error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full">
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
