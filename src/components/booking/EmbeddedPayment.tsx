"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";

/**
 * Stripe's card form, shown inside our payment page. Card details go straight to Stripe;
 * when the payment goes through, Stripe sends the guest on to their booking page.
 */
export function EmbeddedPayment({ publishableKey, clientSecret }: { publishableKey: string; clientSecret: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let checkout: StripeEmbeddedCheckout | null = null;
    let cancelled = false;
    (async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe) throw new Error("Stripe.js didn't load.");
        const created = await stripe.createEmbeddedCheckoutPage({ clientSecret });
        if (cancelled) return created.destroy();
        checkout = created;
        if (box.current) checkout.mount(box.current);
        setState("ready");
      } catch (err) {
        console.error("[payment] couldn't open the card form:", err);
        if (!cancelled) setState("failed");
      }
    })();
    return () => {
      cancelled = true;
      checkout?.destroy();
    };
  }, [publishableKey, clientSecret]);

  return (
    <div>
      {state === "loading" ? (
        <p className="py-10 text-center text-sm text-ink-60">Loading the secure card form…</p>
      ) : null}
      {state === "failed" ? (
        <p className="rounded-2xl bg-ink-05 p-4 text-sm text-ink-80">
          The card form didn&rsquo;t load. Check your connection and refresh this page. Your dates
          stay held while you do.
        </p>
      ) : null}
      <div ref={box} />
    </div>
  );
}
