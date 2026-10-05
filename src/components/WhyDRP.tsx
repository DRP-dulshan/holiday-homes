import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconBadgeCheck, IconCar, IconKey, IconSofa } from "./icons";

const pillars = [
  {
    icon: IconSofa,
    title: "In-house interior design & furnishing",
    body: "Every home is styled and furnished by DRP's own design team. We don't simply list what an owner already has — we make each space feel considered, calm and photograph-ready.",
  },
  {
    icon: IconKey,
    title: "Full property management",
    body: "For owners, we run the property end-to-end: housekeeping, maintenance, guest support, pricing and revenue optimisation, with clear monthly reporting.",
  },
  {
    icon: IconCar,
    title: "Dedicated car fleet & concierge",
    body: "Guests travel with a private DRP car for transfers and around-town journeys, and a concierge who arranges the details before you arrive.",
  },
  {
    icon: IconBadgeCheck,
    title: "Vetted, curated portfolio",
    body: "This is not an open marketplace. Every home is personally selected and quality-checked by our team, so the standard is the same wherever you stay.",
  },
];

export function WhyDRP() {
  return (
    <section id="why-drp" className="relative bg-canvas py-24 md:py-32">
      <div className="container-drp">
        <SectionHeading
          eyebrow="Why DRP Holiday Homes"
          title="A hospitality company, not a listings site."
          intro="The difference is in what we own and control — the design, the management, the car  and the standard held across every address."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal
              as="article"
              key={p.title}
              delay={i * 0.08}
              className="group relative flex flex-col rounded-card border border-ink-10 bg-canvas p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-lift"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-600 transition-colors group-hover:bg-brand group-hover:text-white">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="display mt-6 text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-80">
                {p.body}
              </p>
              <span className="mt-6 h-1 w-8 rounded-full bg-ink-10 transition-all duration-300 group-hover:w-14 group-hover:bg-brand" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
