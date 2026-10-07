import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { formatShortDate } from "@/lib/dates";
import { aed } from "@/lib/pricing";
import { describeCar } from "@/lib/booking-schema";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listBookings, settleExpiredHolds, type BookingStatus } from "@/lib/server/bookings";
import { dashboardPaymentUrl } from "@/lib/server/stripe";
import { adminInput, BookingStatusForm } from "../../AdminForms";

export const metadata: Metadata = { title: "Bookings" };

const FILTERS: { value: "" | BookingStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  await settleExpiredHolds();
  const all = await listBookings();
  const rows = all.filter((b) => {
    if (status && b.status !== status) return false;
    if (!q) return true;
    return [b.ref, b.guest.name, b.guest.email, b.guest.phone, b.propertyTitle, b.area]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const href = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/admin/bookings?${qs}` : "/admin/bookings";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-2xl font-semibold text-ink">Bookings</h1>
        <a href="/api/admin/export?type=bookings" className="btn btn-secondary btn-sm">
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border border-ink-10 bg-canvas p-1">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={href(f.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                status === f.value ? "bg-ink text-white" : "text-ink-60 hover:text-ink"
              }`}
            >
              {f.label}
              {f.value ? ` (${all.filter((b) => b.status === f.value).length})` : ` (${all.length})`}
            </Link>
          ))}
        </div>
        <form className="flex flex-1 gap-2" action="/admin/bookings">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search reference, guest, email, home…"
            className={`${adminInput} max-w-sm`}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-20 bg-canvas p-10 text-center text-sm text-ink-60">
          No bookings match.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((b) => (
            <article key={b.ref} className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">
                    {b.ref} · requested {new Date(b.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })}
                  </p>
                  <h2 className="display mt-1 text-lg font-semibold text-ink">
                    <Link href={`/property/${b.propertySlug}`} target="_blank" className="hover:text-brand-600">
                      {b.propertyTitle}
                    </Link>{" "}
                    <span className="text-sm font-normal text-ink-60">· {b.area}</span>
                  </h2>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs text-ink-60">Stay</dt>
                  <dd className="font-medium text-ink">
                    {formatShortDate(b.checkIn)} → {formatShortDate(b.checkOut)}
                  </dd>
                  <dd className="text-ink-60">
                    {b.quote.nights} nights · {b.guests} guests
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-60">Guest</dt>
                  <dd className="font-medium text-ink">{b.guest.name}</dd>
                  <dd className="text-ink-60">{b.guest.country}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-60">Contact</dt>
                  <dd>
                    <a href={`mailto:${b.guest.email}`} className="text-brand-600 hover:underline">
                      {b.guest.email}
                    </a>
                  </dd>
                  <dd>
                    <a href={`tel:${b.guest.phone.replace(/[^\d+]/g, "")}`} className="text-ink-80 hover:underline">
                      {b.guest.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-60">Total</dt>
                  <dd className="font-semibold text-ink">AED {aed.format(b.quote.total)}</dd>
                  <dd className="text-ink-60">AED {aed.format(b.quote.nightlyRate)}/night</dd>
                  {b.payment?.status === "paid" ? (
                    <dd className={b.payment.refundDue ? "font-semibold text-red-600" : "text-emerald-700"}>
                      {b.payment.refundDue ? "Paid — refund due" : "Paid online"}
                      {b.payment.paymentIntentId ? (
                        <>
                          {" · "}
                          <a
                            href={dashboardPaymentUrl(b.payment.paymentIntentId, !!b.payment.livemode)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Stripe
                          </a>
                        </>
                      ) : null}
                    </dd>
                  ) : b.status === "awaiting_payment" ? (
                    <dd className="text-sky-700">On Stripe checkout</dd>
                  ) : null}
                </div>
              </dl>

              {b.arrivalTime || b.specialRequests || b.car ? (
                <div className="mt-4 rounded-xl bg-ink-05 p-3 text-sm text-ink-80">
                  {b.car ? (
                    <p className="font-semibold text-brand-600">Rental car: {describeCar(b.car)}</p>
                  ) : null}
                  {b.arrivalTime ? <p><strong>Arrival:</strong> {b.arrivalTime}</p> : null}
                  {b.specialRequests ? (
                    <p className="whitespace-pre-line"><strong>Requests:</strong> {b.specialRequests}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-10 pt-4">
                <p className="text-xs text-ink-60">
                  {b.history
                    .map((h) => `${h.status} by ${h.by} ${new Date(h.at).toLocaleDateString("en-GB")}`)
                    .join(" · ")}
                </p>
                <BookingStatusForm bookingRef={b.ref} status={b.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
