import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StaySummary } from "@/components/booking/StaySummary";
import { CheckoutForm } from "@/components/booking/CheckoutForm";
import { IconArrowRight } from "@/components/icons";
import { bookingRules } from "@/config/site";
import { getProperty } from "@/lib/server/catalog";
import { addDays, formatDate, isIsoDate } from "@/lib/dates";
import { aed, quoteStay, validateStay } from "@/lib/pricing";
import { isAvailable } from "@/lib/server/bookings";
import { paymentsEnabled } from "@/lib/server/stripe";

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BookPage({ params, searchParams }: PageProps<"/book/[slug]">) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const sp = await searchParams;
  const checkIn = first(sp.checkIn);
  const checkOut = first(sp.checkOut);
  const guests = Number(first(sp.guests)) || 1;

  const datesOk = isIsoDate(checkIn) && isIsoDate(checkOut);
  const problem = datesOk
    ? validateStay(property, checkIn, checkOut, guests)
    : "Choose your dates to continue.";
  const available = !problem && (await isAvailable(property.slug, checkIn, checkOut));
  const payOnline = paymentsEnabled();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05 pb-20">
        <div className="container-drp pt-24 md:pt-28">
          <nav className="flex items-center gap-1.5 text-xs text-ink-60">
            <Link href={`/property/${property.slug}`} className="hover:text-brand-600">
              ← Back to {property.title}
            </Link>
          </nav>
          <h1 className="display mt-4 text-3xl font-semibold text-ink sm:text-4xl">
            {available ? (payOnline ? "Confirm and pay" : "Book now") : "Let’s fix your dates"}
          </h1>

          {problem || !available ? (
            <div className="mt-8 max-w-xl rounded-card border border-ink-10 bg-canvas p-8 shadow-soft">
              <p className="text-ink-80">
                {problem ??
                  `${property.title} is no longer available from ${formatDate(checkIn)} to ${formatDate(checkOut)}.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/property/${property.slug}`} className="btn btn-primary">
                  Choose new dates
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                {datesOk && !problem ? (
                  <Link
                    href={`/explore?checkIn=${checkIn}&checkOut=${checkOut}`}
                    className="btn btn-secondary"
                  >
                    See homes free on these dates
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <CheckoutForm
                propertySlug={property.slug}
                propertyTitle={property.title}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                payOnline={payOnline}
                totalLabel={`AED ${aed.format(quoteStay(property, checkIn, checkOut).total)}`}
              />
              <div className="lg:sticky lg:top-28 lg:self-start">
                <StaySummary
                  property={property}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                  quote={quoteStay(property, checkIn, checkOut)}
                >
                  <div className="mt-5 rounded-2xl bg-ink-05 p-4 text-xs leading-relaxed text-ink-80">
                    <p className="font-semibold text-ink">Cancellation policy</p>
                    <p className="mt-1">
                      Free cancellation until{" "}
                      {formatDate(addDays(checkIn, -bookingRules.freeCancellationDays))}.{" "}
                      {bookingRules.lateCancellationNote} See the{" "}
                      <Link href="/terms" className="font-semibold text-brand-600 hover:underline">
                        booking terms
                      </Link>
                      .
                    </p>
                  </div>
                </StaySummary>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
