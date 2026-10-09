import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listBookings } from "@/lib/server/bookings";
import { getAllProperties } from "@/lib/server/catalog";
import { addDays, todayIso } from "@/lib/dates";
import { aed } from "@/lib/pricing";
import { buildReport, monthsBetween } from "@/lib/reports";
import { adminInput } from "../../AdminForms";

export const metadata: Metadata = { title: "Reports" };

const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const isMonth = (v: unknown): v is string => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireAdmin();
  const sp = await searchParams;
  const today = todayIso();
  const thisMonth = today.slice(0, 7);
  const defaultFrom = addDays(`${thisMonth}-01`, -150).slice(0, 7);
  const defaultTo = addDays(`${thisMonth}-01`, 95).slice(0, 7);
  let from = isMonth(sp.from) ? sp.from : defaultFrom;
  let to = isMonth(sp.to) ? sp.to : defaultTo;
  if (to < from) [from, to] = [to, from];
  if (monthsBetween(from, to).length >= 36) to = monthsBetween(from, to)[35];

  const [bookings, homes] = await Promise.all([listBookings(), getAllProperties()]);
  const listed = homes.filter((h) => !h.hidden).map((h) => h.slug);
  const report = buildReport(bookings, listed, from, to);
  const maxRevenue = Math.max(1, ...report.months.map((m) => m.revenue));
  const t = report.totals;

  const stats = [
    { label: "Confirmed bookings", value: t.bookings },
    { label: "Nights sold", value: t.nights },
    { label: "Revenue (AED)", value: aed.format(t.revenue) },
    { label: "Average booking (AED)", value: aed.format(t.avgBooking) },
    { label: "Average nightly rate (AED)", value: aed.format(t.avgNightly) },
    { label: "Discounts given (AED)", value: aed.format(t.discounts) },
    { label: "Paid online (AED)", value: aed.format(t.paidOnline) },
    { label: "Refunded (AED)", value: aed.format(t.refunded) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-2xl font-semibold text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink-60">
            Confirmed bookings only. Each booking&rsquo;s total is spread over its nights, and every night
            counts in the month it falls in.
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-2" action="/admin/reports">
          <label className="block text-xs font-semibold text-ink-60">
            From
            <input type="month" name="from" defaultValue={from} className={`${adminInput} mt-1`} />
          </label>
          <label className="block text-xs font-semibold text-ink-60">
            To
            <input type="month" name="to" defaultValue={to} className={`${adminInput} mt-1`} />
          </label>
          <button className="btn btn-secondary btn-sm">Update</button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">{s.label}</p>
            <p className="display mt-2 text-2xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">By month</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-ink-10 text-left text-xs uppercase tracking-[0.08em] text-ink-60">
                <th className="py-2 pr-4 font-semibold">Month</th>
                <th className="py-2 pr-4 font-semibold">Bookings</th>
                <th className="py-2 pr-4 font-semibold">Nights</th>
                <th className="py-2 pr-4 font-semibold">Occupancy</th>
                <th className="py-2 font-semibold">Revenue (AED)</th>
              </tr>
            </thead>
            <tbody>
              {report.months.map((m) => (
                <tr key={m.month} className="border-b border-ink-10 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-ink">{monthLabel(m.month)}</td>
                  <td className="py-2.5 pr-4 text-ink-80">{m.bookings}</td>
                  <td className="py-2.5 pr-4 text-ink-80">{m.nights}</td>
                  <td className="py-2.5 pr-4 text-ink-80">{Math.round(m.occupancy * 100)}%</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-ink-80">{aed.format(m.revenue)}</span>
                      <span className="h-2 flex-1 rounded-full bg-ink-05">
                        <span className="block h-2 rounded-full bg-brand" style={{ width: `${(m.revenue / maxRevenue) * 100}%` }} />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">By home</h2>
        {report.homes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-60">No confirmed bookings in this period.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-10 text-sm">
            {report.homes.map((h) => (
              <li key={h.slug} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-ink">{homes.find((x) => x.slug === h.slug)?.title ?? h.slug}</span>
                <span className="text-ink-60">
                  {h.nights} nights · {Math.round(h.occupancy * 100)}% occupied
                </span>
                <span className="w-28 text-right font-semibold text-ink">AED {aed.format(h.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
