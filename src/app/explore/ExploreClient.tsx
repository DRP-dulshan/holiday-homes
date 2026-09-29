"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Property } from "@/data/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterSidebar } from "@/components/explore/FilterSidebar";
import { SortSelect } from "@/components/explore/SortSelect";
import { Modal } from "@/components/Modal";
import { filtersToSearchParams, type ExploreFilters } from "@/lib/filters";
import { IconArrowRight } from "@/components/icons";

type ExploreClientProps = {
  filters: ExploreFilters;
  results: Property[];
  checkIn: string | null;
  checkOut: string | null;
};

export function ExploreClient({ filters, results, checkIn, checkOut }: ExploreClientProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const pushFilters = (next: ExploreFilters) => {
    const params = filtersToSearchParams(next);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  };

  const onChange = (patch: Partial<ExploreFilters>) => pushFilters({ ...filters, ...patch });
  const onClear = () => router.replace("/explore", { scroll: false });

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
          <FilterSidebar filters={filters} onChange={onChange} onClear={onClear} />
        </aside>

        <div>
          {(checkIn && checkOut) || filters.guests ? (
            <div className="mb-6 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand-600">
              Showing stays{checkIn && checkOut ? ` for ${checkIn} → ${checkOut}` : ""}
              {filters.guests ? ` for ${filters.guests}+ guests` : ""}. Availability for exact
              dates is confirmed by the team when you enquire.
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
                  >
                    <PropertyCard property={property} />
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
        <FilterSidebar filters={filters} onChange={onChange} onClear={onClear} />
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
