import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { areas } from "@/data/areas";
import { properties } from "@/data/properties";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCar,
  IconKey,
  IconSofa,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "DRP Holiday Homes is the short-stay division of D|R|P, a Dubai real estate brokerage. Designed, furnished and managed in-house.",
};

const stats = [
  { value: properties.length, suffix: "", label: "Holiday homes" },
  { value: areas.length, suffix: "", label: "Dubai neighbourhoods" },
  { value: Math.min(...properties.map((p) => p.pricePerNight)), suffix: "", label: "AED per night, from" },
  { value: 24, suffix: "/7", label: "Guest support" },
];

const differentiators = [
  {
    icon: IconSofa,
    title: "In-house design & furnishing",
    body: "Every home is styled and furnished by our own studio, not simply listed as we find it.",
  },
  {
    icon: IconKey,
    title: "Full property management",
    body: "Housekeeping, maintenance, guest support and pricing are run end-to-end, by one team.",
  },
  {
    icon: IconCar,
    title: "Car fleet & concierge",
    body: "Guests travel with a private DRP car and a concierge who arranges the details ahead of arrival.",
  },
  {
    icon: IconBadgeCheck,
    title: "Vetted, curated portfolio",
    body: "Every home is personally selected and quality-checked — never an open marketplace.",
  },
];

const values = [
  {
    title: "One standard, every address",
    body: "A stay in Business Bay should feel the same as a stay on the Palm. We hold every home to the same bar.",
  },
  {
    title: "Nothing outsourced to strangers",
    body: "Design, management, transport and support all sit inside DRP — so accountability never gets lost between vendors.",
  },
  {
    title: "Owners and guests, equally",
    body: "A good guest experience protects an owner's return. We build for both sides of the booking at once.",
  },
];

const team = [
  { initials: "TT", name: "Tara Topic.", role: "Manager of Holiday Homes" },
  { initials: "AA", name: "Anne Aristan", role: "Administrator" },
  { initials: "DC", name: "Delia Cuadrante.", role: "Houskeeping Manager" },
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
          <div className="container-drp flex justify-center gap-16">
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
              <Link href="/contact" className="btn btn-primary mt-6">
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
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-white/60">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-canvas py-16 md:py-24">
          <div className="container-drp">
            <SectionHeading
              eyebrow="What sets us apart"
              title="The difference is in what we own and control."
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {differentiators.map((d, i) => (
                <Reveal
                  as="article"
                  key={d.title}
                  delay={i * 0.06}
                  className="flex flex-col rounded-card border border-ink-10 bg-canvas p-7"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
                    <d.icon className="h-6 w-6" />
                  </span>
                  <h3 className="display mt-6 text-lg font-semibold text-ink">{d.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-80">{d.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink-05 py-16 md:py-24">
          <div className="container-drp">
            <SectionHeading eyebrow="Values" title="What guides how we operate." />
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <span className="display block h-1 w-10 rounded-full bg-brand" />
                  <h3 className="display mt-5 text-lg font-semibold text-ink">{v.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-80">{v.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas py-16 md:py-24">
          <div className="container-drp">
            <SectionHeading
              eyebrow="The team"
              title="A small team you'll actually talk to."
              intro="Placeholder profiles for this demo — real photos and bios go here before launch."
            />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m, i) => (
                <Reveal key={m.name} delay={i * 0.06} className="text-center">
                  <span className="display mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft text-2xl font-semibold text-brand-600">
                    {m.initials}
                  </span>
                  <h3 className="display mt-4 text-base font-semibold text-ink">{m.name}</h3>
                  <p className="mt-1 text-sm text-ink-60">{m.role}</p>
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
