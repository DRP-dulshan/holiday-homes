import Link from "next/link";
import { bookingRules } from "@/config/site";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconBadgeCheck, IconCalendar, IconHeadset, IconStar } from "./icons";

/** Why booking on this website beats booking the same home on Airbnb or Booking.com. */
export const bookDirectPerks = [
  {
    icon: IconStar,
    title: "Best price guarantee",
    short: "Our lowest price, guaranteed",
    body: "This website always has our lowest price. Found the same home for less elsewhere? Send us the link before you book and we'll match it.",
  },
  {
    icon: IconBadgeCheck,
    title: "No booking fees",
    short: "No service fees on top",
    body: "No platform service fee on top of the price: you pay the nightly rate, cleaning and the Dubai Tourism Dirham fee, nothing else.",
  },
  {
    icon: IconCalendar,
    title: "Free cancellation",
    short: `Free cancellation up to ${bookingRules.freeCancellationDays} days before`,
    body: `Plans change. Cancel up to ${bookingRules.freeCancellationDays} days before check-in and pay nothing.`,
  },
  {
    icon: IconHeadset,
    title: "Talk to us directly",
    short: "Speak straight to the team",
    body: "Your questions go straight to the team that runs the home, on WhatsApp or by phone, before and during your stay.",
  },
];

/** Home-page section. */
export function BookDirect() {
  return (
    <section className="bg-ink-05 py-24 md:py-28">
      <div className="container-drp">
        <SectionHeading
          eyebrow="Book direct"
          title="Book here, pay less."
          intro="The same homes you'll find on Airbnb and Booking.com, without the platform fees."
        />
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {bookDirectPerks.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas text-brand-600 shadow-soft">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="display mt-5 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-80">{p.body}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-xs text-ink-60">
          See the{" "}
          <Link href="/terms#best-price" className="font-semibold text-brand-600 hover:underline">
            best price guarantee terms
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/** Short version for the booking card on a home's page. */
export function BookDirectList() {
  return (
    <ul className="mt-5 space-y-1.5 rounded-2xl bg-ink-05 p-4 text-xs text-ink-80">
      <li className="font-semibold text-ink">Why book direct</li>
      {bookDirectPerks.slice(0, 3).map((p) => (
        <li key={p.title} className="flex items-center gap-2">
          <p.icon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          {p.short}
        </li>
      ))}
    </ul>
  );
}
