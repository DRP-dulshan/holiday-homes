import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SavedHomes } from "./SavedHomes";

export const metadata: Metadata = {
  title: "Saved homes",
  alternates: { canonical: "/saved" },
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero eyebrow="Your shortlist" title="Saved homes." intro="Homes you've saved on this device." />
        <section className="bg-canvas py-12 md:py-16">
          <div className="container-drp">
            <SavedHomes />
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
