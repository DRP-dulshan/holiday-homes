import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { properties } from "@/data/properties";
import { areas } from "@/data/areas";

export const metadata: Metadata = {
  title: "Explore Stays — DRP Holiday Homes",
  description:
    "Browse the full DRP Holiday Homes collection across Dubai's most sought-after neighbourhoods.",
};

export default function ExplorePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Explore stays"
          title="The full collection."
          intro="Filtering, availability and instant booking are coming in the next release. For now, here is every home currently in the DRP collection."
        />

        <section className="bg-canvas py-16 md:py-24">
          <div className="container-drp">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">
                All areas
              </span>
              {areas.map((a) => (
                <span
                  key={a.slug}
                  className="rounded-full border border-ink-20 px-4 py-1.5 text-sm font-medium text-ink-80"
                >
                  {a.name}
                </span>
              ))}
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, i) => (
                <Reveal key={property.id} delay={(i % 3) * 0.08}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
