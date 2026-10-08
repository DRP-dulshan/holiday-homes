"use client";

import { areasWithHomes } from "@/data/areas";
import { listedPropertyTypes, priceBounds, PRICE_STEP } from "@/data/properties";
import { PriceRange } from "./PriceRange";
import { FILTER_AMENITY_GROUPS, type ExploreFilters } from "@/lib/filters";

const GUEST_OPTIONS = [0, 2, 3, 4, 5, 6];
const BEDROOM_OPTIONS = [0, 1, 2, 3];

type FilterSidebarProps = {
  filters: ExploreFilters;
  onChange: (patch: Partial<ExploreFilters>) => void;
  onClear: () => void;
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="display text-lg font-semibold text-ink">Filters</h2>
        <button type="button" onClick={onClear} className="text-sm font-semibold text-brand-600 hover:underline">
          Clear all
        </button>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
          Area
        </legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {areasWithHomes.map((a) => (
            <label key={a.slug} className="flex items-center gap-2.5 text-sm text-ink-80">
              <input
                type="checkbox"
                checked={filters.areas.includes(a.slug)}
                onChange={() => onChange({ areas: toggle(filters.areas, a.slug) })}
                className="h-4 w-4 rounded border-ink-20 text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              />
              {a.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
          Property type
        </legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {listedPropertyTypes.map((t) => (
            <label key={t.value} className="flex items-center gap-2.5 text-sm text-ink-80">
              <input
                type="checkbox"
                checked={filters.types.includes(t.value)}
                onChange={() => onChange({ types: toggle(filters.types, t.value) })}
                className="h-4 w-4 rounded border-ink-20 text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4">
        <div>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
            Bedrooms
          </legend>
          <select
            value={filters.bedrooms}
            onChange={(e) => onChange({ bedrooms: Number(e.target.value) })}
            className="mt-3 w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {BEDROOM_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Any" : `${n}+`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
            Guests
          </legend>
          <select
            value={filters.guests}
            onChange={(e) => onChange({ guests: Number(e.target.value) })}
            className="mt-3 w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {GUEST_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Any" : `${n}+`}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
          <span>Price per night</span>
        </legend>
        <div className="mt-3">
          {/* Remounts when the URL filters change (e.g. "Clear all"). */}
          <PriceRange
            key={`${filters.priceMin}-${filters.priceMax}`}
            min={priceBounds.min}
            max={priceBounds.max}
            step={PRICE_STEP}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            onCommit={({ min, max }) => onChange({ priceMin: min, priceMax: max })}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
          Amenities
        </legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {FILTER_AMENITY_GROUPS.map((g) => (
            <label key={g.id} className="flex items-center gap-2.5 text-sm text-ink-80">
              <input
                type="checkbox"
                checked={filters.amenities.includes(g.id)}
                onChange={() => onChange({ amenities: toggle(filters.amenities, g.id) })}
                className="h-4 w-4 rounded border-ink-20 text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              />
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
