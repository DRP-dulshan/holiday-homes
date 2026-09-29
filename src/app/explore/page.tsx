import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ExploreClient } from "./ExploreClient";
import { properties } from "@/data/properties";
import { applyFilters, filtersFromSearchParams } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Explore Stays",
  description:
    "Filter the full DRP Holiday Homes collection by area, property type, bedrooms, guests, price and amenities.",
};

export default async function ExplorePage({
  searchParams,
}: PageProps<"/explore">) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }

  const filters = filtersFromSearchParams(params);
  const results = applyFilters(properties, filters);
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Explore stays"
          title="The full collection."
          intro="Every home in the DRP collection, filterable by area, type, budget and the amenities that matter to you."
        />
        <ExploreClient
          filters={filters}
          results={results}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
