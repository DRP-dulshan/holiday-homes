import { formatShortDate } from "@/lib/dates";
import type { Review } from "@/lib/server/review-stats";
import { IconStar } from "./icons";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-brand" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} className={i < n ? "h-4 w-4" : "h-4 w-4 text-ink-20"} />
      ))}
    </span>
  );
}

/** Approved guest reviews for one home. Renders nothing until there is at least one. */
export function PropertyReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const avg = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  return (
    <section id="reviews" className="mt-10">
      <h2 className="display flex flex-wrap items-center gap-3 text-2xl font-semibold text-ink">
        Guest reviews
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-05 px-3 py-1 text-sm font-semibold">
          <IconStar className="h-4 w-4 text-brand" />
          {avg}
          <span className="font-normal text-ink-60">
            ({reviews.length} review{reviews.length === 1 ? "" : "s"})
          </span>
        </span>
      </h2>
      <ul className="mt-6 space-y-6">
        {reviews.slice(0, 8).map((r) => (
          <li key={r.id} className="rounded-2xl border border-ink-10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{r.name}</p>
              <span className="text-xs text-ink-60">{formatShortDate(r.createdAt.slice(0, 10))}</span>
            </div>
            <div className="mt-1">
              <Stars n={r.rating} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-80">{r.comment}</p>
            {r.reply ? (
              <div className="mt-4 rounded-xl bg-ink-05 p-4 text-sm text-ink-80">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">Reply from DRP</p>
                <p className="mt-1 whitespace-pre-line">{r.reply}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
