import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IconArrowRight, IconWhatsApp } from "@/components/icons";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="flex min-h-[80svh] items-center bg-canvas pt-24">
          <div className="container-drp py-16 text-center">
            <span className="display text-brand-soft text-[7rem] leading-none font-bold sm:text-[9rem]">
              404
            </span>
            <h1 className="display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
              This address isn&rsquo;t in the collection.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-ink-80">
              The page you&rsquo;re looking for may have moved, or the link
              might be out of date. Let&rsquo;s get you back to somewhere real.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className="btn btn-primary">
                Back to home
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="btn btn-secondary">
                Explore stays
              </Link>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                <IconWhatsApp className="h-4 w-4" />
                Ask us on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
