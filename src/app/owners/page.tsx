import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { OwnerForm } from "@/components/owners/OwnerForm";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import {
  IconBadgeCheck,
  IconBroom,
  IconHeadset,
  IconShield,
  IconSofa,
  IconSparkle,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "List Your Property with DRP",
  description:
    "Full-service holiday-home management in Dubai: in-house design and furnishing, professional photography, dynamic pricing, housekeeping, guest communication and DTCM licensing support.",
};

const pillars = [
  {
    icon: IconSofa,
    title: "In-house design & furnishing",
    body: "Our own studio designs and furnishes your property to a consistent, photograph-ready standard — no need to hire separately.",
  },
  {
    icon: IconSparkle,
    title: "Professional photography",
    body: "Every home is shot by a professional photographer before it goes live, and reshot whenever the styling changes.",
  },
  {
    icon: IconBadgeCheck,
    title: "Listing & dynamic pricing",
    body: "Your home is listed across the right platforms with pricing that moves with demand, season and local events.",
  },
  {
    icon: IconBroom,
    title: "Housekeeping & maintenance",
    body: "Professional cleaning between every stay, plus a maintenance team on call for anything that needs fixing.",
  },
  {
    icon: IconHeadset,
    title: "Guest communication",
    body: "Our team handles every guest message, check-in and issue directly, 24/7 — you never need to answer a booking query.",
  },
  {
    icon: IconShield,
    title: "DTCM licensing support",
    body: "We handle the permits, tourism fees and compliance paperwork needed to operate legally as a holiday home in Dubai.",
  },
];

const steps = [
  {
    step: "01",
    title: "Walkthrough & proposal",
    body: "We visit the property, assess the space and send a written proposal with a realistic income projection.",
  },
  {
    step: "02",
    title: "Design & set-up",
    body: "Our studio furnishes and styles the home, we shoot photography, and list it across the right platforms.",
  },
  {
    step: "03",
    title: "Guests & management",
    body: "We handle bookings, guest communication, housekeeping and maintenance from day one.",
  },
  {
    step: "04",
    title: "Monthly reporting",
    body: "You receive a clear monthly statement of bookings, income and any maintenance carried out.",
  },
];

export default function OwnersPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="For property owners"
          title="Turn your Dubai property into a fully managed holiday home."
          intro="Tell us about your property below and leave your details — the team will arrange a walkthrough and send a written proposal."
        />

        <section id="get-started" className="bg-canvas py-12 md:py-16">
          <div className="container-drp max-w-5xl">
            <Reveal>
              <OwnerForm />
            </Reveal>
          </div>
        </section>

        <section className="bg-ink-05 py-16 md:py-24">
          <div className="container-drp">
            <SectionHeading
              eyebrow="Why DRP Holiday Homes"
              title="Everything a hands-off owner needs, in-house."
              intro="Nothing is outsourced to a stranger — the same team that designs the home also manages the guests who stay in it."
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((p, i) => (
                <Reveal
                  as="article"
                  key={p.title}
                  delay={i * 0.06}
                  className="flex flex-col rounded-card border border-ink-10 bg-canvas p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-lift"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="display mt-6 text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-80">{p.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 text-white md:py-24">
          <div className="container-drp">
            <SectionHeading
              tone="dark"
              eyebrow="How it works"
              title="From first call to first guest."
            />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.step} delay={i * 0.08}>
                  <span className="display text-4xl font-bold text-brand-400">{s.step}</span>
                  <h3 className="display mt-4 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/65">{s.body}</p>
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
