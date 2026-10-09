"use client";

import { readConsent } from "./consent";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Sends a conversion event to Google Analytics / Meta Pixel — only when the visitor allowed it. */
export function track(event: "begin_checkout" | "generate_lead" | "purchase", params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || readConsent() !== "all") return;
  window.gtag?.("event", event, params);
  const meta = { begin_checkout: "InitiateCheckout", generate_lead: "Lead", purchase: "Purchase" }[event];
  window.fbq?.("track", meta, params.value ? { value: params.value, currency: params.currency } : undefined);
}
