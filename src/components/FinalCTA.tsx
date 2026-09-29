import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";
import { site } from "@/config/site";
import { IconArrowRight, IconWhatsApp } from "./icons";

export function FinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="absolute inset-0 opacity-25">
        <Image
          src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/70" />

      <div className="container-drp relative z-10 grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            <span className="h-px w-6 bg-brand" />
            Start here
          </span>
          <h2 className="display mt-4 text-3xl leading-tight sm:text-4xl md:text-[2.75rem]">
            Book a stay, or bring your home into the collection.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Tell us what you&rsquo;re looking for and the team will reply
            personally — usually within a few hours.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn btn-primary">
              Book a stay
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/owners" className="btn btn-secondary-dark">
              List your property with DRP
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-brand-400"
            >
              <IconWhatsApp className="h-5 w-5" />
              WhatsApp us
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 transition-colors hover:text-brand-400"
            >
              {site.phoneDisplay}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="scroll-mt-28" >
          <div id="contact-form" className="text-ink">
            <ContactForm source="home-final-cta" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
