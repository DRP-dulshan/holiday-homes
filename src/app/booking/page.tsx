import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { site } from "@/config/site";
import { LookupForm } from "./BookingForms";

export const metadata: Metadata = {
  title: "Manage my booking",
  description: "Look up, review or cancel your DRP Holiday Homes booking.",
};

export default function ManageBookingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          eyebrow="Manage my booking"
          title="Find your stay."
          intro="Enter the reference from your confirmation email to see your booking, its status, and cancel if your plans change."
        />
        <section className="bg-canvas py-16 md:py-20">
          <div className="container-drp grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
              <LookupForm />
            </div>
            <div className="text-sm leading-relaxed text-ink-80">
              <h2 className="display text-xl font-semibold text-ink">Can&rsquo;t find it?</h2>
              <p className="mt-3">
                Your reference starts with <strong>DRP-</strong> and is in the email we sent when
                you requested your stay. To change dates or guests, contact the team — we&rsquo;re
                happy to help.
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  Call{" "}
                  <a href={site.phoneHref} className="font-semibold text-brand-600 hover:underline">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  WhatsApp{" "}
                  <a
                    href={site.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    {site.whatsappNumber}
                  </a>
                </li>
                <li>
                  Email{" "}
                  <a href={`mailto:${site.email}`} className="font-semibold text-brand-600 hover:underline">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
