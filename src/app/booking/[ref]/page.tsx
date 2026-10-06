import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StaySummary } from "@/components/booking/StaySummary";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { IconBadgeCheck, IconWhatsApp } from "@/components/icons";
import { bookingRules, site, whatsappLink } from "@/config/site";
import { getProperty } from "@/data/properties";
import { formatDate, todayIso } from "@/lib/dates";
import { describeCar } from "@/lib/booking-schema";
import {
  bookingToken,
  cancellationTerms,
  getBooking,
  verifyBookingToken,
} from "@/lib/server/bookings";
import { CancelBookingButton, LookupForm } from "../BookingForms";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookingPage({ params, searchParams }: PageProps<"/booking/[ref]">) {
  const { ref } = await params;
  const sp = await searchParams;
  const token = first(sp.t);
  const isNew = first(sp.new) === "1";

  const booking = (await verifyBookingToken(ref, token)) ? await getBooking(ref) : null;
  const property = booking ? getProperty(booking.propertySlug) : undefined;

  if (!booking || !property) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-ink-05">
          <div className="container-drp max-w-xl pt-28 pb-20 md:pt-36">
            <h1 className="display text-3xl font-semibold text-ink">Find your booking</h1>
            <p className="mt-3 text-ink-80">
              That link isn&rsquo;t valid any more. Enter your reference and email to open your
              booking.
            </p>
            <div className="mt-8 rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
              <LookupForm />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const terms = cancellationTerms(booking);
  const canCancel = booking.status !== "cancelled" && booking.checkIn > todayIso();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05 pb-20">
        <div className="container-drp pt-24 md:pt-28">
          {isNew ? (
            <div className="mb-8 flex items-start gap-4 rounded-card border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <IconBadgeCheck className="mt-0.5 h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">Request received — thank you, {booking.guest.name.split(" ")[0]}!</p>
                <p className="mt-1 text-sm">
                  Your dates are held while the team confirms your stay, usually within a few
                  hours. We&rsquo;ve emailed a copy to {booking.guest.email}. Keep your reference:{" "}
                  <strong>{booking.ref}</strong>.
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
                Booking {booking.ref}
              </p>
              <h1 className="display mt-1 text-3xl font-semibold text-ink sm:text-4xl">
                {property.title}
              </h1>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
                <h2 className="display text-lg font-semibold text-ink">What happens next</h2>
                <ol className="mt-4 space-y-4 text-sm text-ink-80">
                  {booking.status === "cancelled" ? (
                    <li>
                      This booking was cancelled. If you&rsquo;d still like to stay with us,{" "}
                      <Link href={`/property/${property.slug}`} className="font-semibold text-brand-600 hover:underline">
                        check new dates
                      </Link>
                      .
                    </li>
                  ) : (
                    <>
                      <Step done label="Request received" detail={formatDate(booking.createdAt.slice(0, 10))} />
                      <Step
                        done={booking.status === "confirmed"}
                        label="Stay confirmed by the DRP team"
                        detail={
                          booking.status === "confirmed"
                            ? "Payment arrangements are shared by email."
                            : "We'll email you as soon as it's confirmed."
                        }
                      />
                      <Step
                        done={false}
                        label="Check-in details"
                        detail={`Access codes and directions are sent before ${formatDate(booking.checkIn)}.`}
                      />
                    </>
                  )}
                </ol>
              </section>

              <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
                <h2 className="display text-lg font-semibold text-ink">Guest details</h2>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <Detail label="Name" value={booking.guest.name} />
                  <Detail label="Email" value={booking.guest.email} />
                  <Detail label="Phone" value={booking.guest.phone} />
                  {booking.guest.country ? <Detail label="Country" value={booking.guest.country} /> : null}
                  {booking.arrivalTime ? <Detail label="Arrival" value={booking.arrivalTime} /> : null}
                  {booking.car ? (
                    <div className="sm:col-span-2">
                      <Detail
                        label="Rental car"
                        value={`${describeCar(booking.car)} — the team will send options and rates.`}
                      />
                    </div>
                  ) : null}
                  {booking.specialRequests ? (
                    <div className="sm:col-span-2">
                      <Detail label="Requests" value={booking.specialRequests} />
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
                <h2 className="display text-lg font-semibold text-ink">Need to change something?</h2>
                <p className="mt-2 text-sm text-ink-80">
                  To change dates or guests, message the team and quote <strong>{booking.ref}</strong>.
                </p>
                {booking.status !== "cancelled" ? (
                  <p className="mt-3 text-sm text-ink-80">
                    {terms.isFree
                      ? `Free cancellation until ${formatDate(terms.freeUntil)}.`
                      : `The free cancellation window ended on ${formatDate(terms.freeUntil)} (${bookingRules.freeCancellationDays} days before check-in).`}{" "}
                    {bookingRules.lateCancellationNote}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(`Hi DRP, about my booking ${booking.ref} at ${property.title}: `)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    <IconWhatsApp className="h-4 w-4" />
                    Message the team
                  </a>
                  {canCancel ? (
                    <CancelBookingButton bookingRef={booking.ref} token={await bookingToken(booking.ref)} />
                  ) : null}
                </div>
                <p className="mt-4 text-xs text-ink-60">
                  Or call {site.phoneDisplay} · {site.email}
                </p>
              </section>
            </div>

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

function Step({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
          done ? "bg-brand text-white" : "border border-ink-20 text-ink-40"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span>
        <span className="block font-semibold text-ink">{label}</span>
        <span className="text-ink-60">{detail}</span>
      </span>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">{label}</dt>
      <dd className="mt-1 whitespace-pre-line break-words text-ink">{value}</dd>
    </div>
  );
}
