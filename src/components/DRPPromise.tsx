import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconHeadset, IconLock, IconShield, IconSparkle } from "./icons";

const promises = [
  {
    icon: IconShield,
    title: "Verified & licensed",
    body: "Every home is registered for holiday-home use and operated in line with Dubai DET regulations.",
  },
  {
    icon: IconLock,
    title: "Secure payments",
    body: "Bookings are confirmed and paid through protected channels, with clear terms in writing before you commit.",
  },
  {
    icon: IconHeadset,
    title: "24/7 guest support",
    body: "A real person on WhatsApp or the phone at any hour of your stay — not a ticket queue.",
  },
  {
    icon: IconSparkle,
    title: "Quality guarantee",
    body: "If a home isn't as described on arrival, we'll move you or make it right. That's the standard.",
  },
];

export function DRPPromise() {
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="container-drp">
        <SectionHeading
          tone="dark"
          eyebrow="The DRP promise"
          title="Booked with confidence, every time."
          intro="The reassurances you'd expect from a hotel, delivered in a private home."
        />

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 text-brand-400">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="display mt-5 text-lg font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-white/65">
                {p.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
