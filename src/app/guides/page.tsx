import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { areas } from "@/data/areas";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Dubai travel guides",
  description: "Where to stay, when to go, how to get around and what to know before you arrive — practical Dubai guides from DRP Holiday Homes.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero eyebrow="Travel guides" title="Plan your Dubai stay." intro="Practical advice from the team who look after your home — neighbourhoods, seasons, getting around and what to know before you arrive." />
        <section className="bg-canvas py-14 md:py-20">
          <div className="container-drp grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => {
              const cover = areas.find((a) => a.slug === g.coverArea);
              return (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group flex flex-col overflow-hidden rounded-card border border-ink-10 bg-canvas shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {cover ? (
                      <Image src={cover.image} alt={cover.alt} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" style={cover.imagePosition ? { objectPosition: cover.imagePosition } : undefined} />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{g.minutes} min read</span>
                    <h2 className="display mt-2 text-lg font-semibold leading-snug text-ink">{g.title}</h2>
                    <p className="mt-3 text-sm text-ink-80">{g.excerpt}</p>
                    <span className="mt-auto pt-5 text-sm font-semibold text-brand-600">Read the guide</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
