import { NextResponse } from "next/server";
import { z } from "zod";
import { isIsoDate, nightsBetween } from "@/lib/dates";
import { quoteStay } from "@/lib/pricing";
import { getProperty } from "@/lib/server/catalog";
import { listBookings, promoUses } from "@/lib/server/bookings";
import { evaluatePromo, listPromos } from "@/lib/server/promos";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  propertySlug: z.string().min(1),
  checkIn: z.string().refine(isIsoDate),
  checkOut: z.string().refine(isIsoDate),
});

/** Checks a promo code for a stay and returns the rule, so the checkout can show the new total. */
export async function POST(request: Request) {
  if (!rateLimit(`promo:${clientIp(request.headers)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts — please try again shortly." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter a promo code." }, { status: 400 });
  const { code, propertySlug, checkIn, checkOut } = parsed.data;

  const property = await getProperty(propertySlug);
  if (!property) return NextResponse.json({ ok: false, error: "That home no longer exists." }, { status: 404 });

  try {
    const [promos, bookings] = await Promise.all([listPromos(), listBookings()]);
    const result = evaluatePromo(
      promos,
      code,
      { slug: propertySlug, checkIn, checkOut, nights: nightsBetween(checkIn, checkOut) },
      promoUses(bookings, code),
    );
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
    const quote = quoteStay(property, checkIn, checkOut, result.rule);
    return NextResponse.json({ ok: true, rule: result.rule, amount: quote.promo?.amount ?? 0 });
  } catch (err) {
    console.error("[promo] failed:", err);
    return NextResponse.json({ ok: false, error: "We couldn't check that code right now." }, { status: 503 });
  }
}
