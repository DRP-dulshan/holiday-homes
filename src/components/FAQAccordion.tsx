"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/data/faqs";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { IconChevronDown } from "./icons";

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-canvas py-24 md:py-32">
      <div className="container-drp">
        <SectionHeading
          align="center"
          eyebrow="Good to know"
          title="Questions, answered."
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-ink-10 border-y border-ink-10">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.question} delay={i * 0.04}>
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="display text-base font-semibold text-ink sm:text-lg">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={[
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                        isOpen
                          ? "border-brand bg-brand text-white"
                          : "border-ink-20 text-ink-60",
                      ].join(" ")}
                    >
                      <IconChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink-80 sm:text-base">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
