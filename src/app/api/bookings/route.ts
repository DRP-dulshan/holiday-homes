import { NextResponse } from "next/server";
import { bookingRequestSchema } from "@/lib/booking-schema";
import { BookingError, bookingUrl, createBooking } from "@/lib/server/bookings";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`booking:${clientIp(request.headers)}`, 10, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many booking attempts — please try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.company) {
    return NextResponse.json({ ok: false, error: "Request rejected." }, { status: 400 });
  }

  try {
    const booking = await createBooking(parsed.data);
    return NextResponse.json(
      { ok: true, ref: booking.ref, url: await bookingUrl(booking.ref) },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof BookingError) {
      const status = err.code === "unavailable" ? 409 : err.code === "not-found" ? 404 : 400;
      return NextResponse.json({ ok: false, error: err.message, code: err.code }, { status });
    }
    console.error("[booking] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong — please try again or contact us." },
      { status: 500 },
    );
  }
}
