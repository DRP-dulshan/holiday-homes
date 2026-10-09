import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatDate } from "@/lib/dates";
import { getBooking } from "@/lib/server/bookings";
import { canReview, publicName, reviewForBooking, verifyReviewToken } from "@/lib/server/reviews";
import { ReviewForm } from "../ReviewForm";

export const metadata: Metadata = { title: "Review your stay", robots: { index: false, follow: false } };

export default async function ReviewPage({ params, searchParams }: PageProps<"/review/[ref]">) {
  const { ref } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  const valid = await verifyReviewToken(ref, token);
  const booking = valid ? await getBooking(ref) : null;
  const existing = booking ? await reviewForBooking(booking.ref) : null;

  let body: React.ReactNode;
  if (!booking) {
    body = <p className="text-ink-80">That review link isn&rsquo;t valid. Use the link in your email, or find your booking on the <Link href="/booking" className="font-semibold text-brand-600 hover:underline">Manage my booking</Link> page.</p>;
  } else if (existing) {
    body = <p className="rounded-card border border-ink-10 bg-canvas p-6 text-ink-80 shadow-soft">You&rsquo;ve already reviewed this stay — thank you!</p>;
  } else if (!canReview(booking)) {
    body = <p className="rounded-card border border-ink-10 bg-canvas p-6 text-ink-80 shadow-soft">Reviews open after check-out on {formatDate(booking.checkOut)}. We&rsquo;d love to hear from you then.</p>;
  } else {
    body = <ReviewForm bookingRef={booking.ref} token={token} defaultName={publicName(booking.guest.name)} />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05">
        <div className="container-drp max-w-xl pt-28 pb-20 md:pt-36">
          <h1 className="display text-3xl font-semibold text-ink">How was your stay?</h1>
          {booking ? (
            <p className="mt-2 text-ink-80">
              {booking.propertyTitle} · {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
            </p>
          ) : null}
          <div className="mt-8">{body}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
