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

export default function Home() {
  return (
    <>
      <Navbar overHero />
      <main className="flex-1">
        <Hero />
        <FeaturedStays />
        <WhyDRP />
        <AreasWeCover />
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
