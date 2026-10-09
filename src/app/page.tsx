import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { WhyDRP } from "@/components/WhyDRP";
import { FeaturedStays } from "@/components/FeaturedStays";
import { AreasWeCover } from "@/components/AreasWeCover";
import { DRPPromise } from "@/components/DRPPromise";
import { Testimonials } from "@/components/Testimonials";
import { FAQAccordion } from "@/components/FAQAccordion";
import { GuidesTeaser } from "@/components/GuidesTeaser";
import { FinalCTA } from "@/components/FinalCTA";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

import { getCatalogSummary, getAllProperties } from "@/lib/server/catalog";
import { approvedReviews } from "@/lib/server/reviews";
import { faqs } from "@/data/faqs";
import { JsonLd } from "@/components/JsonLd";

// Homes come from the database, so render on request rather than once at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const summary = await getCatalogSummary();
  const [reviews, homes] = await Promise.all([approvedReviews().catch(() => []), getAllProperties()]);
  // The best recent 4–5 star reviews, shown on the home page.
  const stories = reviews
    .filter((r) => r.rating >= 4)
    .slice(0, 4)
    .map((r) => ({
      name: r.name,
      stay: homes.find((h) => h.slug === r.propertySlug)?.area ?? "Dubai",
      quote: r.comment,
      rating: r.rating,
    }));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <Navbar overHero />
      <main className="flex-1">
        <Hero summary={summary} />
        <FeaturedStays />
        <WhyDRP />
        <AreasWeCover homesByArea={summary.homesByArea} />
        <DRPPromise />
        <Testimonials reviews={stories} />
        <GuidesTeaser />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
