import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getPropertyAnyStatus } from "@/lib/server/catalog";
import { siteUrl } from "@/config/site";
import { formatShortDate } from "@/lib/dates";
import { icalToken, listIcalDocs } from "@/lib/server/ical";
import { removeHome, syncHomeCalendar } from "../../../actions";
import { HomeForm } from "../HomeForm";

export const metadata: Metadata = { title: "Edit home" };

export default async function EditHomePage({
  params,
  searchParams,
}: PageProps<"/admin/homes/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const home = await getPropertyAnyStatus(slug);
  if (!home) notFound();
  const sync = (await listIcalDocs()).find((d) => d.slug === slug);
  const exportUrl = `${siteUrl()}/api/ical/${slug}/${await icalToken(slug)}/calendar.ics`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/homes" className="text-sm text-ink-60 hover:text-ink">
            ← All homes
          </Link>
          <h1 className="display mt-2 text-2xl font-semibold text-ink">{home.title}</h1>
          {sp.created ? (
            <p className="mt-1 text-sm text-emerald-700">Home added — it&rsquo;s live on the website.</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!home.hidden ? (
            <Link href={`/property/${home.slug}`} target="_blank" className="btn btn-secondary btn-sm">
              View on site
            </Link>
          ) : null}
          <form action={removeHome}>
            <input type="hidden" name="slug" value={home.slug} />
            <button
              type="submit"
              className="btn btn-ghost btn-sm text-red-600"
              formNoValidate
            >
              {home.custom ? "Delete home" : "Restore imported details"}
            </button>
          </form>
        </div>
      </div>
      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Airbnb calendar sync</h2>
        <p className="mt-1 text-sm text-ink-60">
          Stops double bookings between this website and Airbnb. Both directions are needed.
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-ink">1. Airbnb → this website</p>
            <p className="mt-1 text-sm text-ink-80">
              In Airbnb: <em>Calendar → Availability → Connect another website → Export calendar</em>,
              copy the link and paste it in &ldquo;Airbnb calendar&rdquo; below, then save.
            </p>
            {sync ? (
              <div className="mt-3 rounded-xl bg-ink-05 p-3 text-sm">
                {sync.ok ? (
                  <p className="text-emerald-700">
                    Synced {new Date(sync.syncedAt!).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })} ·{" "}
                    {sync.ranges.filter((r) => r.end > new Date().toISOString().slice(0, 10)).length} upcoming blocked
                    period(s)
                  </p>
                ) : (
                  <p className="text-red-700">
                    Last sync failed: {sync.error}
                    {sync.syncedAt ? ` (using dates from ${new Date(sync.syncedAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })})` : ""}
                  </p>
                )}
                {sync.ranges.length ? (
                  <ul className="mt-2 max-h-32 overflow-auto text-xs text-ink-60">
                    {sync.ranges.filter((r) => r.end > new Date().toISOString().slice(0, 10)).slice(0, 12).map((r) => (
                      <li key={`${r.start}-${r.end}`}>
                        {formatShortDate(r.start)} → {formatShortDate(r.end)}
                        {r.summary ? ` · ${r.summary}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-60">
                {home.airbnbIcalUrl ? "Not synced yet." : "No Airbnb link saved yet."}
              </p>
            )}
            {home.airbnbIcalUrl ? (
              <form action={syncHomeCalendar} className="mt-3">
                <input type="hidden" name="slug" value={home.slug} />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Sync now
                </button>
              </form>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">2. This website → Airbnb</p>
            <p className="mt-1 text-sm text-ink-80">
              In Airbnb: <em>Calendar → Availability → Connect another website → Import calendar</em>,
              paste this link and name it &ldquo;DRP website&rdquo;. It lists booked and blocked
              nights only, no guest details. Keep it private.
            </p>
            <input
              readOnly
              value={exportUrl}
              className="mt-3 w-full rounded-xl border border-ink-20 bg-ink-05 px-3 py-2 font-mono text-xs text-ink"
              aria-label="Calendar link for Airbnb"
            />
          </div>
        </div>
      </section>

      <HomeForm mode="edit" home={home} />
    </div>
  );
}
