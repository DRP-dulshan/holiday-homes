import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageHero } from "./PageHero";

export type LegalSection = { heading: string; body: ReactNode; /** Anchor for links to this section. */ id?: string };

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero eyebrow={eyebrow} title={title} intro={intro} />
        <section className="bg-canvas py-16 md:py-20">
          <div className="container-drp max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-60">
              Last updated {updated}
            </p>
            <div className="mt-8 space-y-10">
              {sections.map((s, i) => (
                <section key={s.heading} id={s.id} className="scroll-mt-28">
                  <h2 className="display text-xl font-semibold text-ink">
                    {i + 1}. {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-80 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
