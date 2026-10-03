import Link from "next/link";
import { Logo } from "./Logo";
import { areas } from "@/data/areas";
import { footerLinks, navLinks, site, socialLinks } from "@/config/site";
import { IconWhatsApp } from "./icons";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-drp py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {site.tagline} Designed, furnished and managed in-house — a
              division of {site.parent}.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-brand hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/70 transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Areas served
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/areas/${a.slug}`}
                    className="text-white/70 transition-colors hover:text-brand"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <a
                  href={site.phoneHref}
                  className="transition-colors hover:text-brand"
                >
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-brand"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-brand"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  Message us on WhatsApp
                </a>
              </li>
              <li className="pt-1 text-white/45">{site.address.full}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} — a division of{" "}
            {site.parent}. All rights reserved.
          </p>
          <p className="flex flex-wrap gap-4">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white/70">
                {l.label}
              </Link>
            ))}
            <span>{site.license}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
