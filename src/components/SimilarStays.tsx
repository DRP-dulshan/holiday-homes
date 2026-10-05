import { properties, type Property } from "@/data/properties";
import { PropertyCard } from "./PropertyCard";
import { Reveal } from "./Reveal";

export function SimilarStays({ current }: { current: Property }) {
  const sameArea = properties.filter(
    (p) => p.slug !== current.slug && p.area === current.area,
  );
  const similarPrice = properties
    .filter((p) => p.slug !== current.slug && p.area !== current.area)
    .sort(
      (a, b) =>
        Math.abs(a.pricePerNight - current.pricePerNight) -
        Math.abs(b.pricePerNight - current.pricePerNight),
    );

  const picks = [...sameArea, ...similarPrice].slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <section className="bg-ink-05 py-16 md:py-24">
      <div className="container-drp">
        <h2 className="display text-2xl font-semibold text-ink">Similar stays</h2>
        <p className="mt-2 text-sm text-ink-60">
          More homes in {current.area} and at a similar price point.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06} className="h-full">
              <PropertyCard property={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
