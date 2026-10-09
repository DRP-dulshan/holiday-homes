"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
import { formatShortDate } from "@/lib/dates";
import { ExploreDates } from "@/components/explore/ExploreDates";

const ExploreMap = dynamic(() => import("@/components/explore/ExploreMap"), {
  ssr: false,
  loading: () => <div className="h-[28rem] animate-pulse rounded-card bg-ink-05 sm:h-[34rem]" />,
});

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
  const [view, setView] = useState<"list" | "map">("list");

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
          <ExploreDates
            value={{ checkIn: checkIn ?? "", checkOut: checkOut ?? "" }}
            onApply={(d) =>
              pushFilters(filters, { checkIn: d.checkIn || null, checkOut: d.checkOut || null })
            }
          >
            <label className="flex min-w-[8.5rem] flex-1 flex-col rounded-xl border border-ink-20 bg-canvas px-3.5 py-2 transition-colors focus-within:border-brand hover:border-ink-40">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">Guests</span>
              <select
                value={filters.guests}
                onChange={(e) => onChange({ guests: Number(e.target.value) })}
                className="mt-0.5 bg-transparent text-sm font-medium text-ink outline-none"
              >
                <option value={0}>Any number</option>
                {Array.from({ length: summary.maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} guest{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[8.5rem] flex-1 flex-col rounded-xl border border-ink-20 bg-canvas px-3.5 py-2 transition-colors focus-within:border-brand hover:border-ink-40">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">Bedrooms</span>
              <select
                value={filters.bedrooms}
                onChange={(e) => onChange({ bedrooms: Number(e.target.value) })}
                className="mt-0.5 bg-transparent text-sm font-medium text-ink outline-none"
              >
                <option value={0}>Any</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}+ bedroom{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
          </ExploreDates>

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
              <div className="flex rounded-full border border-ink-20 p-0.5 text-sm font-medium" role="group" aria-label="View">
                {(["list", "map"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`rounded-full px-3.5 py-1.5 capitalize ${view === v ? "bg-ink text-white" : "text-ink-60 hover:text-ink"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
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

          {view === "map" && results.length > 0 ? (
            <div className="mt-8">
              <ExploreMap homes={results} query={cardQs} />
            </div>
          ) : null}

          <AnimatePresence mode="popLayout">
            {view === "map" && results.length > 0 ? null : results.length > 0 ? (
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
