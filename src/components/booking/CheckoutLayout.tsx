"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/data/properties";
import { aed, quoteStay, type PromoRule } from "@/lib/pricing";
import { CheckoutForm } from "./CheckoutForm";
import { StaySummary } from "./StaySummary";

type Props = {
  property: Property;
  checkIn: string;
  checkOut: string;
  guests: number;
  payOnline: boolean;
  /** The cancellation-policy box, rendered on the server. */
  policy: React.ReactNode;
};

/** The checkout form and price summary share one state, so a promo code updates the total live. */
export function CheckoutLayout({ property, checkIn, checkOut, guests, payOnline, policy }: Props) {
  const [promo, setPromo] = useState<PromoRule | null>(null);
  const quote = useMemo(
    () => quoteStay(property, checkIn, checkOut, promo),
    [property, checkIn, checkOut, promo],
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <CheckoutForm
        propertySlug={property.slug}
        propertyTitle={property.title}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        payOnline={payOnline}
        totalLabel={`AED ${aed.format(quote.total)}`}
        promoCode={promo?.code}
      />
      <div className="lg:sticky lg:top-28 lg:self-start">
        <StaySummary property={property} checkIn={checkIn} checkOut={checkOut} guests={guests} quote={quote}>
          <PromoBox
            slug={property.slug}
            checkIn={checkIn}
            checkOut={checkOut}
            applied={promo}
            savings={quote.promo?.amount ?? 0}
            onApply={setPromo}
          />
          {policy}
        </StaySummary>
      </div>
    </div>
  );
}

function PromoBox({
  slug,
  checkIn,
  checkOut,
  applied,
  savings,
  onApply,
}: {
  slug: string;
  checkIn: string;
  checkOut: string;
  applied: PromoRule | null;
  savings: number;
  onApply: (rule: PromoRule | null) => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, propertySlug: slug, checkIn, checkOut }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        onApply(json.rule);
        setCode("");
      } else {
        setError(json.error ?? "That promo code isn't valid.");
      }
    } catch {
      setError("We couldn't check that code — please try again.");
    }
    setBusy(false);
  };

  if (applied) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <span>
          <strong>{applied.code}</strong> applied{savings ? ` — you save AED ${aed.format(savings)}` : ""}
        </span>
        <button type="button" onClick={() => onApply(null)} className="text-xs font-semibold underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-60" htmlFor="promo">
        Promo code
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="Enter code"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-ink-20 bg-canvas px-3 py-2 text-sm uppercase text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button type="button" onClick={apply} disabled={busy || !code.trim()} className="btn btn-secondary btn-sm">
          {busy ? "Checking…" : "Apply"}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
