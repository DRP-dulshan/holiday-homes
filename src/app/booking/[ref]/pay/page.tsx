import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmbeddedPayment } from "@/components/booking/EmbeddedPayment";
import { StaySummary } from "@/components/booking/StaySummary";
import { IconLock } from "@/components/icons";
import { getPropertyAnyStatus } from "@/lib/server/catalog";
import { getBooking, paymentWindow, refreshPayment, verifyBookingToken } from "@/lib/server/bookings";
import { publishableKey } from "@/lib/server/stripe";

export const metadata: Metadata = {
  title: "Pay for your stay",
  robots: { index: false, follow: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** The card form for a booking awaiting payment. Anything else goes back to the booking page. */
export default async function PayPage({ params, searchParams }: PageProps<"/booking/[ref]/pay">) {
  const { ref } = await params;
  const token = first((await searchParams).t);
  const bookingPage = `/booking/${ref}?t=${token ?? ""}`;

  const found = (await verifyBookingToken(ref, token)) ? await getBooking(ref) : null;
  const booking = found ? await refreshPayment(found) : null;
  const property = booking ? await getPropertyAnyStatus(booking.propertySlug) : undefined;
  const key = publishableKey();
  const clientSecret = booking?.payment?.clientSecret;
  if (!booking || !property || !key || !clientSecret || !paymentWindow(booking)) redirect(bookingPage);

  const holdUntil = new Date(booking.payment!.holdUntil).toLocaleTimeString("en-GB", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05 pb-20">
        <div className="container-drp pt-24 md:pt-28">
          <nav className="flex items-center gap-1.5 text-xs text-ink-60">
            <Link href={bookingPage} className="hover:text-brand-600">
              ← Back to booking {booking.ref}
            </Link>
          </nav>
          <h1 className="display mt-4 text-3xl font-semibold text-ink sm:text-4xl">Pay for your stay</h1>
          <p className="mt-2 text-sm text-ink-80">
            Your dates are held until {holdUntil} (Dubai time). Your stay is confirmed as soon as the
            payment goes through.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-card border border-ink-10 bg-canvas p-4 shadow-soft sm:p-6">
              <p className="mb-4 flex items-center gap-2 text-xs text-ink-60">
                <IconLock className="h-3.5 w-3.5" />
                Card details are handled by Stripe and never stored by us.
              </p>
              <EmbeddedPayment publishableKey={key} clientSecret={clientSecret} />
            </section>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <StaySummary
                property={property}
                checkIn={booking.checkIn}
                checkOut={booking.checkOut}
                guests={booking.guests}
                quote={booking.quote}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
