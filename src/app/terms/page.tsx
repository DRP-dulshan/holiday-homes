import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { bookingRules, site } from "@/config/site";
import { paymentsEnabled } from "@/lib/server/stripe";

export const metadata: Metadata = {
  title: "Booking Terms",
  description: `Booking, payment and cancellation terms for stays with ${site.name}.`,
};

// Standard holiday-home terms — have these reviewed against your DET licence
// conditions and by legal counsel before launch.
export default function TermsPage() {
  const payOnline = paymentsEnabled();
  return (
    <LegalPage
      eyebrow="Booking terms"
      title="Terms of stay."
      updated="7 October 2026"
      intro={`The terms that apply when you book a home with ${site.name}. Please read them before you request a booking.`}
      sections={[
        {
          heading: "Who we are",
          body: (
            <p>
              {site.name} is the holiday-home division of {site.parentFull} ({site.parent}),{" "}
              {site.address.full}. {site.license}.
            </p>
          ),
        },
        {
          heading: "How booking works",
          body: (
            <>
              <p>
                Submitting the booking form on this website is a <strong>request to book</strong>.
                The dates are held for you while our team reviews the request. Your booking is
                only confirmed once we email you a confirmation.
              </p>
              <p>
                {bookingRules.minNights > 1
                  ? `Stays have a minimum of ${bookingRules.minNights} nights and can`
                  : "Stays can"}{" "}
                be requested up to{" "}
                {bookingRules.maxAdvanceDays} days in advance. Stays longer than{" "}
                {bookingRules.maxNights} nights are arranged directly with the team.
              </p>
            </>
          ),
        },
        {
          heading: "Prices and payment",
          body: (
            <>
              <p>
                Prices are shown in UAE Dirhams (AED) and include the nightly rate, a one-time
                cleaning fee and the Dubai Tourism Dirham fee of AED{" "}
                {bookingRules.tourismFeePerNight} per night. The total shown when you request a
                booking is the total you pay.
              </p>
              {payOnline ? (
                <p>
                  The full amount is paid by card when you book, through our payment provider
                  Stripe; we never see or store your card details. Your dates are held for 30
                  minutes while you pay, and your booking is confirmed as soon as payment is
                  received. Refunds go back to the card you paid with.
                </p>
              ) : (
                <p>
                  No payment is taken on the website. Once your stay is confirmed, the team
                  arranges payment with you directly; the booking is secured once payment is
                  received.
                </p>
              )}
            </>
          ),
        },
        {
          heading: "Cancellations and changes",
          body: (
            <>
              <p>
                You can cancel online from{" "}
                <Link href="/booking" className="font-semibold text-brand-600 hover:underline">
                  Manage my booking
                </Link>{" "}
                until the day before check-in. Cancellation is free up to{" "}
                {bookingRules.freeCancellationDays} days before check-in.{" "}
                {bookingRules.lateCancellationNote}
              </p>
              <p>To change dates or the number of guests, contact the team with your reference.</p>
            </>
          ),
        },
        {
          heading: "Check-in and your stay",
          body: (
            <ul>
              <li>
                All guests must present a valid passport or Emirates ID at check-in, as required
                by Dubai tourism regulations.
              </li>
              <li>The number of guests may not exceed the number confirmed in your booking.</li>
              <li>
                Each home&rsquo;s house rules (shown on its page) form part of these terms.
                Parties, events and smoking indoors are not permitted.
              </li>
              <li>
                A refundable security deposit may be requested before arrival for some homes.
              </li>
              <li>
                You are responsible for damage beyond normal wear and tear caused during your
                stay.
              </li>
            </ul>
          ),
        },
        {
          heading: "If something goes wrong",
          body: (
            <p>
              If a home becomes unavailable for reasons outside your control, we will offer a
              comparable home or a full refund. Report any issue during your stay straight away
              on {site.phoneDisplay} or WhatsApp so we can fix it.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about these terms: <a href={`mailto:${site.email}`} className="font-semibold text-brand-600 hover:underline">{site.email}</a>.
              These terms are governed by the laws of the Emirate of Dubai and the UAE.
            </p>
          ),
        },
      ]}
    />
  );
}
