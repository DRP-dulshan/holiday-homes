import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ContactForm } from "@/components/ContactForm";
import { ApproxPrice } from "@/components/CurrencyProvider";
import { IconBed, IconCalendar, IconSofa, IconUsers, IconBadgeCheck } from "@/components/icons";
import { bookingRules } from "@/config/site";
import { bedroomLabel } from "@/data/properties";
import { addDays, formatDate, todayIso } from "@/lib/dates";
import { aed, quoteStay, validateStay } from "@/lib/pricing";
import { getProperties } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "Monthly stays in Dubai",
  description:
    "Furnished Dubai apartments for a month or more, with monthly discounts and one clear price. Book online or ask the team.",
  alternates: { canonical: "/monthly" },
};

// Prices depend on the homes in the database and today's date.
export const dynamic = "force-dynamic";

const NIGHTS = 30;

/** The sample stay used for the prices: 30 nights from the 1st of next month (or the month after, if that's within a week). */
function sampleStay() {
  const today = todayIso();
  const [y, m] = today.split("-").map(Number);
  let start = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  if (start < addDays(today, 7)) start = new Date(Date.UTC(y, m + 1, 1)).toISOString().slice(0, 10);
  return { checkIn: start, checkOut: addDays(start, NIGHTS) };
}

export default async function MonthlyPage() {
  const { checkIn, checkOut } = sampleStay();
  const homes = (await getProperties())
    .filter((p) => !validateStay(p, checkIn, checkOut, 1))
    .map((p) => ({ property: p, quote: quoteStay(p, checkIn, checkOut) }))
    .sort((a, b) => a.quote.total - b.quote.total);
  const bestDiscount = Math.max(0, ...homes.map((h) => h.property.pricing?.monthlyDiscountPct ?? 0));
  const query = `checkIn=${checkIn}&checkOut=${checkOut}&guests=1`;

  const perks = [
    {
      icon: IconBadgeCheck,
      title: bestDiscount ? `Up to ${bestDiscount}% off` : "Monthly pricing",
      body: "Stays of 28 nights or more get each home's monthly discount, applied automatically.",
    },
    {
      icon: IconSofa,
      title: "Furnished and ready",
      body: "Move in with a suitcase: furnished homes with a kitchen, managed by our own team.",
    },
    {
      icon: IconCalendar,
      title: `Up to ${bookingRules.maxNights} nights online`,
      body: `Book up to ${bookingRules.maxNights} nights here. For longer stays, send us your dates below.`,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Monthly stays"
          title="Stay a month or more."
          intro="For work, a long holiday or while you find your next home: furnished Dubai apartments with one clear monthly price."
        />

        <section className="bg-canvas py-14 md:py-16">
          <div className="container-drp grid gap-8 sm:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-05 text-brand-600">
                  <p.icon className="h-5 w-5" />
                </span>
                <h2 className="display mt-4 text-lg font-semibold text-ink">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-80">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink-05 py-14 md:py-20">
          <div className="container-drp">
            <h2 className="display text-2xl font-semibold text-ink sm:text-3xl">Prices for 30 nights</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-80">
              Totals for {formatDate(checkIn)} to {formatDate(checkOut)}, including cleaning and the
              Tourism Dirham fee. Pick a home to see your own dates and live availability.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {homes.map(({ property: p, quote }) => (
                <Link
                  key={p.slug}
                  href={`/property/${p.slug}?${query}`}
                  className="group flex flex-col overflow-hidden rounded-card border border-ink-10 bg-canvas shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={`${p.title}, ${p.area}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {quote.discount ? (
                      <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-soft">
                        {p.pricing?.monthlyDiscountPct}% monthly discount
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{p.area}</span>
                    <h3 className="display mt-2 line-clamp-2 min-h-[3.5rem] text-lg leading-7 font-semibold text-ink">
                      {p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-5 text-sm text-ink-80">
                      <span className="inline-flex items-center gap-1.5">
                        <IconBed className="h-4 w-4 text-ink-60" />
                        {bedroomLabel(p.bedrooms)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconUsers className="h-4 w-4 text-ink-60" />
                        Up to {p.guests}
                      </span>
                    </div>
                    <div className="mt-auto border-t border-ink-10 pt-4">
                      <p className="text-ink">
                        <span className="text-xl font-semibold">AED {aed.format(quote.total)}</span>{" "}
                        <span className="text-sm text-ink-60">/ 30 nights</span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-60">
                        About AED {aed.format(Math.round(quote.total / NIGHTS))} a night
                      </p>
                      <ApproxPrice aed={quote.total} className="mt-0.5 block text-xs text-ink-60" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas py-14 md:py-20">
          <div className="container-drp grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="display text-2xl font-semibold text-ink sm:text-3xl">Staying longer, or need help choosing?</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-80">
                Tell us your dates, budget and the area you work or study in. The team replies with
                the homes that fit, usually the same day. Stays longer than {bookingRules.maxNights}{" "}
                nights are arranged directly with us.
              </p>
            </div>
            <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
              <ContactForm
                defaultEnquiryType="stay"
                source="monthly"
                showTypeSelect={false}
                messagePlaceholder="Your dates (e.g. 1 March to 31 May), number of guests, budget and preferred area."
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
