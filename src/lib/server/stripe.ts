import "server-only";
import Stripe from "stripe";
import { site, siteUrl } from "@/config/site";
import { formatDate } from "@/lib/dates";
import { accommodationTotal, type Quote } from "@/lib/pricing";

/** Online payment is on when a Stripe secret key is configured. */
export const paymentsEnabled = () => !!process.env.STRIPE_SECRET_KEY?.trim();

/**
 * How long a Checkout Session stays open. Stripe's minimum is 30 minutes;
 * the extra minute absorbs clock differences.
 */
export const CHECKOUT_MINUTES = 31;

let client: Stripe | null = null;

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  if (!client) {
    // STRIPE_API_BASE points the SDK at stripe-mock (or another test server) locally.
    const base = process.env.STRIPE_API_BASE?.trim();
    const url = base ? new URL(base) : null;
    client = new Stripe(key, {
      appInfo: { name: site.name, url: siteUrl() },
      maxNetworkRetries: 2,
      ...(url
        ? {
            host: url.hostname,
            port: url.port || (url.protocol === "http:" ? 80 : 443),
            protocol: url.protocol === "http:" ? "http" : "https",
          }
        : {}),
    });
  }
  return client;
}

/** AED is a two-decimal currency: Stripe amounts are in fils. */
const fils = (aed: number) => Math.round(aed * 100);

export async function createCheckoutSession(input: {
  ref: string;
  propertySlug: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  email: string;
  quote: Quote;
  successUrl: string;
  cancelUrl: string;
}) {
  const { quote } = input;
  const dates = `${formatDate(input.checkIn)} – ${formatDate(input.checkOut)}`;
  const stayTotal = accommodationTotal(quote);
  const adjustments = [
    quote.discount ? quote.discountLabel?.toLowerCase() : "",
    quote.promo ? `code ${quote.promo.code}` : "",
  ].filter(Boolean);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "aed",
        unit_amount: fils(stayTotal),
        product_data: {
          name: `${input.propertyTitle} — ${quote.nights} night${quote.nights === 1 ? "" : "s"}`,
          description: `${dates} · ${input.guests} guest${input.guests === 1 ? "" : "s"}${adjustments.length ? ` · includes ${adjustments.join(" and ")}` : ""}`,
        },
      },
    },
  ];
  if (quote.cleaningFee) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "aed",
        unit_amount: fils(quote.cleaningFee),
        product_data: { name: "Cleaning fee" },
      },
    });
  }
  if (quote.tourismFee) {
    lineItems.push({
      quantity: quote.nights,
      price_data: {
        currency: "aed",
        unit_amount: fils(quote.tourismFee / quote.nights),
        product_data: {
          name: "Tourism Dirham fee",
          description: "Dubai government fee, per night",
        },
      },
    });
  }

  const metadata = { ref: input.ref, property: input.propertySlug };
  return stripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems,
      customer_email: input.email,
      client_reference_id: input.ref,
      metadata,
      payment_intent_data: {
        description: `${input.ref} · ${input.propertyTitle} · ${dates}`,
        metadata,
      },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    },
    // Retrying the same booking never opens a second session.
    { idempotencyKey: `checkout-${input.ref}` },
  );
}

/** Refunds (part of) a card payment to the guest. Amount in AED; omit for the full amount. */
export async function createRefund(paymentIntentId: string, amountAed: number, ref: string) {
  return stripe().refunds.create(
    {
      payment_intent: paymentIntentId,
      amount: fils(amountAed),
      reason: "requested_by_customer",
      metadata: { ref },
    },
  );
}

export const retrieveCheckoutSession = (id: string) => stripe().checkout.sessions.retrieve(id);

/** Closes an open session so it can't be paid any more. Returns the session as it now stands. */
export async function expireCheckoutSession(id: string) {
  try {
    return await stripe().checkout.sessions.expire(id);
  } catch {
    // Already completed or expired — report the real state instead.
    return retrieveCheckoutSession(id);
  }
}

/** Verifies a webhook delivery. Throws when the signature doesn't match. */
export function verifyWebhook(payload: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  if (!signature) throw new Error("Missing Stripe-Signature header.");
  return stripe().webhooks.constructEvent(payload, signature, secret);
}

export function dashboardPaymentUrl(paymentIntentId: string, livemode: boolean) {
  return `https://dashboard.stripe.com${livemode ? "" : "/test"}/payments/${paymentIntentId}`;
}

export type CheckoutSession = Stripe.Checkout.Session;
