import { NextResponse } from "next/server";
import { addDays, todayIso } from "@/lib/dates";
import { listBookings, markPreArrivalSent, markReviewRequested, sendPreArrival } from "@/lib/server/bookings";
import { getAllProperties } from "@/lib/server/catalog";
import { safeEqual } from "@/lib/server/crypto";
import { syncStale } from "@/lib/server/ical";
import { sendReviewRequest } from "@/lib/server/reviews";

/**
 * Daily housekeeping, called by Vercel Cron (vercel.json) with `Authorization: Bearer $CRON_SECRET`
 * (or `?key=` from an external pinger): refreshes the Airbnb calendars and asks guests whose stay has
 * ended for a review, and emails guests arriving within three days. Safe to run more often — each guest is only emailed once.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  const given =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("key") ??
    "";
  if (!safeEqual(given, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homes = (await getAllProperties()).filter((h) => h.airbnbIcalUrl);
  await syncStale(homes, 0, 8000);

  // Guests who checked out in the last two weeks and haven't been asked yet.
  const today = todayIso();
  const since = addDays(today, -14);
  const due = (await listBookings()).filter(
    (b) => b.status === "confirmed" && b.checkOut <= today && b.checkOut >= since && !b.reviewRequestedAt,
  );
  let requested = 0;
  for (const b of due) {
    await sendReviewRequest(b);
    await markReviewRequested(b.ref);
    requested++;
  }

  // Confirmed guests arriving within three days who haven't had the "arriving soon" email yet.
  const soon = addDays(today, 3);
  const arriving = (await listBookings()).filter(
    (b) => b.status === "confirmed" && b.checkIn > today && b.checkIn <= soon && !b.preArrivalSentAt,
  );
  for (const b of arriving) {
    await sendPreArrival(b);
    await markPreArrivalSent(b.ref);
  }
  return NextResponse.json({ ok: true, calendars: homes.length, reviewRequests: requested, arrivalEmails: arriving.length });
}
