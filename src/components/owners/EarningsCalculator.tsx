"use client";

import { useMemo, useState } from "react";
import { areas } from "@/data/areas";
import { propertyTypes, type PropertyType } from "@/data/properties";

const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

// Illustrative base nightly rates (AED) per area, calibrated loosely against
// the DRP collection — clearly presented as an estimate, not a quote.
const AREA_BASE: Record<string, number> = {
  "palm-jumeirah": 1300,
  "dubai-marina": 820,
  jbr: 780,
  "downtown-dubai": 950,
  "business-bay": 650,
  jvc: 420,
};

const TYPE_FACTOR: Record<PropertyType, number> = {
  apartment: 1,
  townhouse: 1.15,
  villa: 1.55,
  penthouse: 1.9,
};

const OCCUPANCY_LOW = 0.6;
const OCCUPANCY_HIGH = 0.82;

export function EarningsCalculator() {
  const [areaSlug, setAreaSlug] = useState(areas[0].slug);
  const [type, setType] = useState<PropertyType>("apartment");
  const [bedrooms, setBedrooms] = useState(2);

  const { low, high, nightly } = useMemo(() => {
    const base = AREA_BASE[areaSlug] ?? 700;
    const nightly = Math.round(base * TYPE_FACTOR[type] * (1 + bedrooms * 0.12));
    const low = Math.round((nightly * 30 * OCCUPANCY_LOW) / 100) * 100;
    const high = Math.round((nightly * 30 * OCCUPANCY_HIGH) / 100) * 100;
    return { low, high, nightly };
  }, [areaSlug, type, bedrooms]);

  return (
    <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
            Area
          </span>
          <select
            value={areaSlug}
            onChange={(e) => setAreaSlug(e.target.value)}
            className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-brand"
          >
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
            Property type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType)}
            className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-brand"
          >
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
            Bedrooms
          </span>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
            className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-brand"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} bedroom{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 rounded-2xl bg-ink-05 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
          Estimated gross monthly income
        </p>
        <p className="display mt-2 text-3xl font-bold text-ink sm:text-4xl">
          AED {aed.format(low)} – {aed.format(high)}
        </p>
        <p className="mt-2 text-xs text-ink-60">
          Based on an illustrative AED {aed.format(nightly)}/night rate at{" "}
          {Math.round(OCCUPANCY_LOW * 100)}–{Math.round(OCCUPANCY_HIGH * 100)}% occupancy,
          before the DRP management fee. Your actual return depends on the specific
          property and season — we&rsquo;ll confirm a real projection after a walkthrough.
        </p>
      </div>
    </div>
  );
}
