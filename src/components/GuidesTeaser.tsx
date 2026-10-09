import Link from "next/link";
import { guides } from "@/data/guides";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconArrowRight } from "./icons";

/** Three travel guides on the home page. */
export function GuidesTeaser() {
  return (
    <section className="bg-ink-05 py-20 md:py-28">
      <div className="container-drp">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Travel guides" title="Plan your Dubai stay." intro="Neighbourhoods, seasons and getting around — advice from the team who look after your home." />
          <Link href="/guides" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
            All guides
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {guides.slice(0, 3).map((g, i) => (
            <Reveal key={g.slug} delay={i * 0.08} className="h-full">
              <Link
                href={`/guides/${g.slug}`}
                className="flex h-full flex-col rounded-card border border-ink-10 bg-canvas p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{g.minutes} min read</span>
                <h3 className="display mt-3 text-lg font-semibold leading-snug text-ink">{g.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-ink-80">{g.excerpt}</p>
                <span className="mt-auto pt-5 text-sm font-semibold text-brand-600">Read the guide</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
