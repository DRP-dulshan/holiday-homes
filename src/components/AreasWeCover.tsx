import Image from "next/image";
import Link from "next/link";
import { areas } from "@/data/areas";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconArrowUpRight } from "./icons";

export function AreasWeCover({ homesByArea }: { homesByArea: Record<string, number> }) {
  const homesInArea = (name: string) => homesByArea[name] ?? 0;
  return (
    <section id="areas" className="bg-canvas py-24 md:py-32">
      <div className="container-drp">
        <SectionHeading
          eyebrow="Areas we cover"
          title="Where you'll find us in Dubai."
          intro="From St. Regis on the Palm to the canal-side calm of Business Bay — choose the setting, and we'll match the home."
        />
      </div>

      <div className="mt-14 flex gap-5 overflow-x-auto px-6 pb-4 no-scrollbar lg:container-drp lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {areas.map((area, i) => (
          <Reveal
            key={area.slug}
            delay={(i % 3) * 0.08}
            className="min-w-[78%] sm:min-w-[46%] lg:min-w-0"
          >
            <Link
              href={`/areas/${area.slug}`}
              className="group relative block h-80 overflow-hidden rounded-card"
            >
              <Image
                src={area.image}
                alt={area.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                style={area.imagePosition ? { objectPosition: area.imagePosition } : undefined}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="display text-xl font-semibold text-white">
                    {area.name}
                  </h3>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-colors group-hover:border-brand group-hover:bg-brand">
                    <IconArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-white/75">{area.note}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-brand-400">
                  {homesInArea(area.name) === 0
                    ? "Coming soon"
                    : `${homesInArea(area.name)} ${homesInArea(area.name) === 1 ? "home" : "homes"}`}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
