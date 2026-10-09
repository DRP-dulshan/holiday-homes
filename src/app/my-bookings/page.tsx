import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { bookingUrl, listBookingsForEmail } from "@/lib/server/bookings";
import { myBookingsSummary, verifyMyBookingsLink } from "@/lib/server/my-bookings";
import { todayIso } from "@/lib/dates";
import { aed } from "@/lib/pricing";

export const metadata: Metadata = { title: "My bookings", robots: { index: false, follow: false } };

export default async function MyBookingsPage({ searchParams }: PageProps<"/my-bookings">) {
  const sp = await searchParams;
  const email = typeof sp.e === "string" ? sp.e : "";
  const exp = Number(typeof sp.x === "string" ? sp.x : 0);
  const token = typeof sp.t === "string" ? sp.t : "";
  const valid = !!email && (await verifyMyBookingsLink(email, exp, token));
  const bookings = valid ? await listBookingsForEmail(email) : [];
  const today = todayIso();
  const upcoming = bookings.filter((b) => b.checkOut >= today && b.status !== "cancelled");
  const rest = bookings.filter((b) => !upcoming.includes(b));

  const row = async (b: (typeof bookings)[number]) => (
    <li key={b.ref}>
      <Link
        href={await bookingUrl(b.ref)}
        className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-10 bg-canvas p-5 shadow-soft transition-colors hover:border-brand/40"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">{b.ref}</span>
          <span className="display mt-1 block font-semibold text-ink">{myBookingsSummary(b)}</span>
          <span className="mt-1 block text-sm text-ink-60">AED {aed.format(b.quote.total)}</span>
        </span>
        <StatusBadge status={b.status} />
      </Link>
    </li>
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05">
        <div className="container-drp max-w-2xl pt-28 pb-20 md:pt-36">
          <h1 className="display text-3xl font-semibold text-ink">My bookings</h1>
          {!valid ? (
            <p className="mt-4 text-ink-80">
              That link has expired or isn&rsquo;t valid. <Link href="/booking" className="font-semibold text-brand-600 hover:underline">Request a new one</Link>.
            </p>
          ) : bookings.length === 0 ? (
            <p className="mt-4 text-ink-80">No bookings found for {email}.</p>
          ) : (
            <>
              {upcoming.length ? (
                <>
                  <h2 className="display mt-8 text-lg font-semibold text-ink">Upcoming</h2>
                  <ul className="mt-3 space-y-3">{await Promise.all(upcoming.map(row))}</ul>
                </>
              ) : null}
              {rest.length ? (
                <>
                  <h2 className="display mt-8 text-lg font-semibold text-ink">Past and cancelled</h2>
                  <ul className="mt-3 space-y-3">{await Promise.all(rest.map(row))}</ul>
                </>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
