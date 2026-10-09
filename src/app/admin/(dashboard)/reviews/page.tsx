import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getAllProperties } from "@/lib/server/catalog";
import { listReviews } from "@/lib/server/reviews";
import { formatShortDate } from "@/lib/dates";
import { answerReview, moderateReview, removeReview } from "../../actions";
import { adminInput } from "../../AdminForms";

export const metadata: Metadata = { title: "Reviews" };

const TABS = [
  { value: "pending", label: "To approve" },
  { value: "approved", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.value === sp.show)?.value ?? "pending";
  const [all, homes] = await Promise.all([listReviews(), getAllProperties()]);
  const rows = all.filter((r) => r.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl font-semibold text-ink">Reviews</h1>
        <p className="mt-1 text-sm text-ink-60">
          Guests are emailed a review link after check-out (daily cron) and see a button on their booking page.
          Only published reviews appear on the website.
        </p>
      </div>

      <div className="flex gap-1 rounded-full border border-ink-10 bg-canvas p-1 w-fit">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/reviews?show=${t.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${tab === t.value ? "bg-ink text-white" : "text-ink-60 hover:text-ink"}`}
          >
            {t.label} ({all.filter((r) => r.status === t.value).length})
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-20 bg-canvas p-10 text-center text-sm text-ink-60">
          Nothing here.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {r.name}{" "}
                    <span className="text-brand" aria-label={`${r.rating} stars`}>
                      {"★".repeat(r.rating)}
                      <span className="text-ink-20">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  </p>
                  <p className="text-xs text-ink-60">
                    {homes.find((h) => h.slug === r.propertySlug)?.title ?? r.propertySlug} · booking {r.bookingRef} ·{" "}
                    {formatShortDate(r.createdAt.slice(0, 10))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {tab !== "approved" ? (
                    <form action={moderateReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="btn btn-primary btn-sm">Publish</button>
                    </form>
                  ) : null}
                  {tab !== "hidden" ? (
                    <form action={moderateReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <button className="btn btn-secondary btn-sm">Hide</button>
                    </form>
                  ) : null}
                  <form action={removeReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-ghost btn-sm text-red-600">Delete</button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-ink-80">{r.comment}</p>
              <form action={answerReview} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input
                  name="reply"
                  defaultValue={r.reply}
                  placeholder="Public reply from DRP (optional)"
                  maxLength={800}
                  className={`${adminInput} min-w-[16rem] flex-1`}
                />
                <button className="btn btn-secondary btn-sm">Save reply</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
