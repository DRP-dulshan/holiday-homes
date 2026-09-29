import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "About — DRP Holiday Homes",
  description:
    "DRP Holiday Homes is the short-stay division of D|R|P, a Dubai real estate brokerage. Designed, furnished and managed in-house.",
};

const stats = [
  { value: "90+", label: "Homes under management" },
  { value: "6", label: "Dubai neighbourhoods" },
  { value: "4.9", label: "Average guest rating" },
  { value: "24/7", label: "Guest support" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="About"
          title="A brokerage that decided to do hospitality properly."
          intro="DRP Holiday Homes is the short-stay division of D|R|P. We started managing our clients' apartments and quickly realised the only way to do it well was to control every part of the experience."
        />

        <section className="bg-canvas py-16 md:py-24">
          <div className="container-drp grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"
                  alt="A furnished DRP interior"
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display text-3xl font-semibold text-ink">
                One team, one standard
              </h2>
              <p className="mt-4 text-ink-80">
                Our design studio furnishes each home. Our management team runs
                housekeeping, maintenance and pricing. Our concierge and car
                fleet look after guests on the ground. Nothing is outsourced to
                a stranger, which is why a stay in Business Bay feels the same as
                a stay on the Palm.
              </p>
              <p className="mt-4 text-ink-80">
                For owners, that means a single point of contact and a property
                that is genuinely cared for. For guests, it means a home you can
                book with the confidence of a hotel.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Talk to the team
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="bg-ink py-16 text-white md:py-20">
          <div className="container-drp grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <p className="display text-4xl font-bold text-brand-400">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-white/60">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
