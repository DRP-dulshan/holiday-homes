import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal data.`,
};

// Standard privacy notice — have it reviewed against the UAE PDPL and your
// actual processors (email provider, hosting, CRM) before launch.
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Your privacy."
      updated="7 October 2026"
      intro="What we collect when you use this website, why, and the choices you have."
      sections={[
        {
          heading: "What we collect",
          body: (
            <ul>
              <li>
                <strong>Booking requests:</strong> your name, email, phone number, country,
                travel dates, number of guests, arrival time and any requests you add.
              </li>
              <li>
                <strong>Enquiries:</strong> your name, email, phone number and message.
              </li>
              <li>
                <strong>Technical data:</strong> standard server logs such as IP address and
                browser type, used for security and to prevent abuse.
              </li>
            </ul>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul>
              <li>To process and confirm your booking and arrange your stay.</li>
              <li>To reply to your enquiry.</li>
              <li>To meet legal obligations, including guest registration with Dubai authorities.</li>
              <li>To keep the website secure and prevent spam.</li>
            </ul>
          ),
        },
        {
          heading: "Who we share it with",
          body: (
            <p>
              We don&rsquo;t sell your data. We share it only with service providers that help
              us run the business (such as our payment, email and hosting providers — card payments
              are handled by Stripe, and we never see your full card details), with authorities
              where the law requires it, and with the property owner where needed to host your
              stay.
            </p>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              The public website does not use advertising or tracking cookies. A strictly
              necessary cookie is used only to keep team members signed in to the internal
              dashboard.
            </p>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              Booking records are kept for as long as required for accounting and regulatory
              purposes. Enquiries that don&rsquo;t lead to a booking are deleted when no longer
              needed.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You can ask to see, correct or delete the personal data we hold about you by
              emailing{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-brand-600 hover:underline">
                {site.email}
              </a>
              . We&rsquo;ll respond within 30 days.
            </p>
          ),
        },
      ]}
    />
  );
}
