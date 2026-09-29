"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { SectionHeading } from "./SectionHeading";
import { IconArrowRight, IconStar } from "./icons";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-brand" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar
          key={i}
          className={i < n ? "h-4 w-4" : "h-4 w-4 text-ink-20"}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const active = testimonials[index];

  return (
    <section className="bg-ink-05 py-24 md:py-32">
      <div className="container-drp">
        <SectionHeading
          eyebrow="Guest stories"
          title="What staying with DRP feels like."
          intro="Sample reviews from guests across the collection — illustrative content for this preview."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[15rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-card border border-ink-10 bg-canvas p-8 shadow-soft md:p-10"
              >
                <Stars n={active.rating} />
                <p className="display mt-5 text-xl leading-relaxed text-ink md:text-2xl">
                  &ldquo;{active.quote}&rdquo;
                </p>
                <footer className="mt-6 text-sm">
                  <span className="font-semibold text-ink">{active.name}</span>
                  <span className="text-ink-60"> · {active.stay}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setIndex(i)}
                className={[
                  "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all",
                  i === index
                    ? "border-brand bg-canvas shadow-soft"
                    : "border-ink-10 bg-canvas/60 hover:border-ink-20",
                ].join(" ")}
              >
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {t.name}
                  </span>
                  <span className="block text-xs text-ink-60">{t.stay}</span>
                </span>
                <IconArrowRight
                  className={[
                    "h-4 w-4 transition-colors",
                    i === index ? "text-brand" : "text-ink-40",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
