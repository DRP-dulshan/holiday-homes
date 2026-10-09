"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Property } from "@/data/properties";
import type { CatalogSummary } from "@/lib/server/catalog";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterSidebar } from "@/components/explore/FilterSidebar";
import { SortSelect } from "@/components/explore/SortSelect";
import { Modal } from "@/components/Modal";
import { filtersToSearchParams, type ExploreFilters } from "@/lib/filters";
import { IconArrowRight } from "@/components/icons";
import { addDays, formatShortDate, todayIso } from "@/lib/dates";

type ExploreClientProps = {
  filters: ExploreFilters;
  results: Property[];
  summary: CatalogSummary;
  checkIn: string | null;
  checkOut: string | null;
};

export function ExploreClient({ filters, results, summary, checkIn, checkOut }: ExploreClientProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [draftIn, setDraftIn] = useState(checkIn ?? "");
  const [draftOut, setDraftOut] = useState(checkOut ?? "");
  const today = todayIso();

  const pushFilters = (
    next: ExploreFilters,
    dates: { checkIn: string | null; checkOut: string | null } = { checkIn, checkOut },
  ) => {
    const params = filtersToSearchParams(next, summary.priceBounds);
    if (dates.checkIn && dates.checkOut) {
      params.set("checkIn", dates.checkIn);
      params.set("checkOut", dates.checkOut);
    }
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  };

  const onChange = (patch: Partial<ExploreFilters>) => pushFilters({ ...filters, ...patch });
  const onClear = () => {
    setDraftIn("");
    setDraftOut("");
    router.replace("/explore", { scroll: false });
  };

  // Carry dates + party size through to the property page's booking card.
  const cardQuery = new URLSearchParams();
  if (checkIn && checkOut) {
    cardQuery.set("checkIn", checkIn);
    cardQuery.set("checkOut", checkOut);
  }
  if (filters.guests) cardQuery.set("guests", String(filters.guests));
  const cardQs = cardQuery.toString();

  const activeCount =
    filters.areas.length +
    filters.types.length +
    filters.amenities.length +
    (filters.bedrooms ? 1 : 0) +
    (filters.guests ? 1 : 0);

  return (
    <section className="bg-canvas py-16 md:py-24">
      <div className="container-drp grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            priceBounds={summary.priceBounds}
            listedTypes={summary.listedTypes}
            homesByArea={summary.homesByArea}
            onChange={onChange}
            onClear={onClear}
          />
        </aside>

        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draftIn && draftOut && draftOut > draftIn) {
                pushFilters(filters, { checkIn: draftIn, checkOut: draftOut });
              }
            }}
            className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-ink-10 bg-ink-05 p-3"
          >
            <label className="min-w-[9rem] flex-1">
              <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
                Check-in
              </span>
              <input
                type="date"
                value={draftIn}
                min={today}
                onChange={(e) => {
                  setDraftIn(e.target.value);
                  if (draftOut && e.target.value >= draftOut) setDraftOut("");
                }}
                className="w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </label>
            <label className="min-w-[9rem] flex-1">
              <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
                Check-out
              </span>
              <input
                type="date"
                value={draftOut}
                min={draftIn ? addDays(draftIn, 1) : today}
                onChange={(e) => setDraftOut(e.target.value)}
                className="w-full rounded-xl border border-ink-20 bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </label>
            <button
              type="submit"
              disabled={!draftIn || !draftOut || draftOut <= draftIn}
              className="btn btn-primary btn-sm"
            >
              Check availability
            </button>
            {checkIn && checkOut ? (
              <button
                type="button"
                onClick={() => {
                  setDraftIn("");
                  setDraftOut("");
                  pushFilters(filters, { checkIn: null, checkOut: null });
                }}
                className="btn btn-ghost btn-sm"
              >
                Any dates
              </button>
            ) : null}
          </form>

          {(checkIn && checkOut) || filters.guests ? (
            <div className="mb-6 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand-600">
              {checkIn && checkOut
                ? `Showing homes available ${formatShortDate(checkIn)} → ${formatShortDate(checkOut)}`
                : "Showing homes"}
              {filters.guests ? ` that sleep ${filters.guests}+ guests` : ""}.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-60">
              <span className="font-semibold text-ink">{results.length}</span>{" "}
              {results.length === 1 ? "stay" : "stays"} found
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn btn-secondary btn-sm lg:hidden"
              >
                Filters{activeCount ? ` (${activeCount})` : ""}
              </button>
              <SortSelect value={filters.sort} onChange={(sort) => onChange({ sort })} />
            </div>
          </div>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="mt-3 text-sm font-semibold text-brand-600 hover:underline"
            >
              Clear all filters
            </button>
          ) : null}

          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              <motion.div
                layout
                className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {results.map((property) => (
                  <motion.div
                    key={property.slug}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                  >
                    <PropertyCard property={property} query={cardQs} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-16 flex flex-col items-center rounded-card border border-dashed border-ink-20 py-20 text-center"
              >
                <p className="display text-xl font-semibold text-ink">
                  No stays match those filters.
                </p>
                <p className="mt-2 max-w-sm text-sm text-ink-60">
                  Try widening your price range or clearing an area or amenity filter.
                </p>
                <button type="button" onClick={onClear} className="btn btn-primary mt-6">
                  Clear all filters
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters">
        <FilterSidebar
            filters={filters}
            priceBounds={summary.priceBounds}
            listedTypes={summary.listedTypes}
            homesByArea={summary.homesByArea}
            onChange={onChange}
            onClear={onClear}
          />
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="btn btn-primary mt-6 w-full"
        >
          Show {results.length} {results.length === 1 ? "stay" : "stays"}
        </button>
      </Modal>
    </section>
  );
}
