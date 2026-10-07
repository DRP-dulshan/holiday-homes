import { NextResponse } from "next/server";
import { applyCheckoutSession } from "@/lib/server/bookings";
import { verifyWebhook, type CheckoutSession } from "@/lib/server/stripe";

const CHECKOUT_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);

/** Stripe webhook: confirms bookings once paid and releases dates of expired checkouts. */
export async function POST(request: Request) {
  // The signature is computed over the exact raw body.
  const payload = await request.text();
  let event;
  try {
    event = verifyWebhook(payload, request.headers.get("stripe-signature"));
  } catch (err) {
    console.error("[stripe] webhook rejected:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (CHECKOUT_EVENTS.has(event.type)) {
    try {
      await applyCheckoutSession(event.data.object as CheckoutSession, {
        failed: event.type === "checkout.session.async_payment_failed",
      });
    } catch (err) {
      // A non-2xx response makes Stripe retry the delivery later.
      console.error(`[stripe] failed to handle ${event.type} ${event.id}:`, err);
      return NextResponse.json({ error: "Not processed" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
