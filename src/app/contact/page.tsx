import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { MapEmbed } from "@/components/MapEmbed";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { site } from "@/config/site";
import { IconWhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Enquire about a stay, or ask about bringing your Dubai property into the DRP collection. Call, WhatsApp or send a note.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Contact"
          title="Let's find your stay — or manage your home."
          intro="Send us a note and a real person will reply, usually within a few hours."
        />

        <section className="bg-canvas py-16 md:py-24">
          <div className="container-drp grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <h2 className="display text-2xl font-semibold text-ink">
                Ways to reach us
              </h2>
              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="font-semibold uppercase tracking-[0.12em] text-ink-60">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={site.phoneHref}
                      className="text-ink transition-colors hover:text-brand-600"
                    >
                      {site.phoneDisplay}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.12em] text-ink-60">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${site.email}`}
                      className="text-ink transition-colors hover:text-brand-600"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.12em] text-ink-60">
                    WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={site.whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-ink transition-colors hover:text-brand-600"
                    >
                      <IconWhatsApp className="h-4 w-4" />
                      Message the team
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.12em] text-ink-60">
                    Office
                  </dt>
                  <dd className="mt-1 text-ink-80">{site.address.full}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.12em] text-ink-60">
                    Office hours
                  </dt>
                  <dd className="mt-1.5 space-y-1 text-ink-80">
                    {site.officeHours.map((h) => (
                      <div key={h.days} className="flex justify-between gap-4 sm:w-72">
                        <span className="text-ink-60">{h.days}</span>
                        <span>{h.hours}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>

              <MapEmbed
                src={site.mapEmbedSrc}
                label="the DRP office"
                className="mt-6 h-56"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <ContactForm source="contact-page" />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
