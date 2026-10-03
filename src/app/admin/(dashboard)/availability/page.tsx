import type { Metadata } from "next";
import Link from "next/link";
import { properties } from "@/data/properties";
import { addDays, formatShortDate, todayIso } from "@/lib/dates";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listBlocks, listBookings } from "@/lib/server/bookings";
import { deleteBlock } from "../../actions";
import { BlockForm } from "../../AdminForms";

export const metadata: Metadata = { title: "Availability" };

const DAYS = 35;

export default async function AdminAvailabilityPage({
  searchParams,
}: PageProps<"/admin/availability">) {
  await requireAdmin();
  const sp = await searchParams;
  const today = todayIso();
  const offset = Math.max(0, Number(sp.offset) || 0);
  const start = addDays(today, offset);
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));

  const [bookings, blocks] = await Promise.all([listBookings(), listBlocks()]);
  const live = bookings.filter((b) => b.status !== "cancelled");

  const cell = (slug: string, day: string) => {
    const booking = live.find((b) => b.propertySlug === slug && b.checkIn <= day && day < b.checkOut);
    if (booking)
      return {
        className: booking.status === "confirmed" ? "bg-ink" : "bg-amber-400",
        title: `${booking.ref} · ${booking.guest.name} (${booking.status})`,
      };
    const block = blocks.find((b) => b.propertySlug === slug && b.start <= day && day < b.end);
    if (block)
      return {
        className: "bg-ink-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.12)_3px,rgba(0,0,0,0.12)_5px)]",
        title: `Blocked${block.reason ? `: ${block.reason}` : ""}`,
      };
    return null;
  };

  const upcomingBlocks = blocks.filter((b) => b.end > today);

  return (
    <div className="space-y-8">
      <h1 className="display text-2xl font-semibold text-ink">Availability</h1>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="display text-lg font-semibold text-ink">
            {formatShortDate(days[0])} – {formatShortDate(days[DAYS - 1])}
          </h2>
          <div className="flex gap-2">
            {offset > 0 ? (
              <Link href={`/admin/availability?offset=${Math.max(0, offset - DAYS)}`} className="btn btn-secondary btn-sm">
                ← Earlier
              </Link>
            ) : null}
            <Link href={`/admin/availability?offset=${offset + DAYS}`} className="btn btn-secondary btn-sm">
              Later →
            </Link>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-60">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-ink" /> Confirmed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-400" /> Pending</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-ink-20" /> Blocked</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-canvas pr-3 text-left font-semibold text-ink-60">Home</th>
                {days.map((d) => (
                  <th key={d} className="w-6 min-w-6 pb-1 text-center font-normal text-ink-40">
                    {Number(d.slice(8)) === 1 || d === days[0] ? formatShortDate(d) : Number(d.slice(8))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.slug}>
                  <td className="sticky left-0 z-10 max-w-[14rem] truncate bg-canvas py-0.5 pr-3 text-ink-80">
                    {p.title}
                  </td>
                  {days.map((d) => {
                    const c = cell(p.slug, d);
                    return (
                      <td key={d} className="p-px">
                        <div
                          title={c?.title ?? `${d} — free`}
                          className={`h-5 rounded-sm ${c ? c.className : "bg-ink-05"}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Block dates</h2>
        <p className="mt-1 text-sm text-ink-60">
          Close a home for owner stays, maintenance or bookings taken elsewhere. Blocked nights
          can&rsquo;t be booked on the website.
        </p>
        <div className="mt-5">
          <BlockForm properties={properties.map(({ slug, title, area }) => ({ slug, title, area }))} />
        </div>

        {upcomingBlocks.length ? (
          <ul className="mt-6 divide-y divide-ink-10 border-t border-ink-10 text-sm">
            {upcomingBlocks.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold text-ink">
                    {properties.find((p) => p.slug === b.propertySlug)?.title ?? b.propertySlug}
                  </span>{" "}
                  <span className="text-ink-80">
                    {formatShortDate(b.start)} → {formatShortDate(b.end)}
                  </span>
                  {b.reason ? <span className="text-ink-60"> · {b.reason}</span> : null}
                </span>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
