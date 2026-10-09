import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { WhyDRP } from "@/components/WhyDRP";
import { FeaturedStays } from "@/components/FeaturedStays";
import { AreasWeCover } from "@/components/AreasWeCover";
import { DRPPromise } from "@/components/DRPPromise";
import { Testimonials } from "@/components/Testimonials";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FinalCTA } from "@/components/FinalCTA";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

import { getCatalogSummary } from "@/lib/server/catalog";

// Homes come from the database, so render on request rather than once at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const summary = await getCatalogSummary();
  return (
    <>
      <Navbar overHero />
      <main className="flex-1">
        <Hero summary={summary} />
        <FeaturedStays />
        <WhyDRP />
        <AreasWeCover homesByArea={summary.homesByArea} />
        <DRPPromise />
        <Testimonials />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
