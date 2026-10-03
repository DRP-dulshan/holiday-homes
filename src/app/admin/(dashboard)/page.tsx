import Link from "next/link";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { addDays, formatShortDate, todayIso } from "@/lib/dates";
import { aed } from "@/lib/pricing";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listBookings } from "@/lib/server/bookings";
import { listEnquiries } from "@/lib/server/enquiries";
import { BookingStatusForm } from "../AdminForms";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [bookings, enquiries] = await Promise.all([listBookings(), listEnquiries()]);
  const today = todayIso();
  const in14 = addDays(today, 14);

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const upcoming = confirmed
    .filter((b) => b.checkOut > today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const arrivals = upcoming.filter((b) => b.checkIn >= today && b.checkIn <= in14);
  const inHouse = upcoming.filter((b) => b.checkIn <= today);
  const newEnquiries = enquiries.filter((e) => e.status === "new");
  const upcomingRevenue = upcoming.reduce((sum, b) => sum + b.quote.total, 0);

  const stats = [
    { label: "Requests to review", value: pending.length, href: "/admin/bookings?status=pending" },
    { label: "Arrivals next 14 days", value: arrivals.length, href: "/admin/bookings?status=confirmed" },
    { label: "Guests in-house", value: inHouse.length, href: "/admin/bookings?status=confirmed" },
    { label: "New enquiries", value: newEnquiries.length, href: "/admin/enquiries" },
    { label: "Upcoming confirmed revenue", value: `AED ${aed.format(upcomingRevenue)}`, href: "/admin/bookings?status=confirmed" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="display text-2xl font-semibold text-ink">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft transition-colors hover:border-brand/40"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">{s.label}</p>
            <p className="display mt-2 text-2xl font-semibold text-ink">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Booking requests to review</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-ink-60">Nothing waiting — you&rsquo;re all caught up.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-10">
            {pending.map((b) => (
              <li key={b.ref} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="text-sm">
                  <Link href={`/admin/bookings?q=${b.ref}`} className="font-semibold text-ink hover:text-brand-600">
                    {b.ref} · {b.propertyTitle}
                  </Link>
                  <p className="text-ink-60">
                    {b.guest.name} · {formatShortDate(b.checkIn)} → {formatShortDate(b.checkOut)} ·{" "}
                    {b.guests} guests · AED {aed.format(b.quote.total)}
                  </p>
                </div>
                <BookingStatusForm bookingRef={b.ref} status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Upcoming arrivals</h2>
        {arrivals.length === 0 ? (
          <p className="mt-3 text-sm text-ink-60">No confirmed arrivals in the next 14 days.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-10 text-sm">
            {arrivals.map((b) => (
              <li key={b.ref} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold text-ink">{formatShortDate(b.checkIn)}</span>{" "}
                  <span className="text-ink-80">
                    {b.propertyTitle} — {b.guest.name} ({b.guests} guests)
                  </span>
                </span>
                <StatusBadge status={b.status} short />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
