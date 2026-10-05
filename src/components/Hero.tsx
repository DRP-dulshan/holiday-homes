"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SearchWidget } from "./SearchWidget";
import { IconChevronDown } from "./icons";
import heroImage from "@/assets/hero-villa.webp";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative z-10 flex min-h-[100svh] items-center bg-ink">
      {/* Only the background is clipped, so search dropdowns can overflow the hero. */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? undefined : { scale: 1.08 }}
          animate={reduce ? undefined : { scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <Image
            src={heroImage}
            alt="White Mediterranean-style villa with a private pool and palm trees"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[65%_center]"
          />
        </motion.div>

        {/* Legibility gradients — keep the bright photo, darken only behind text */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/10 to-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />
      </div>

      <div className="container-drp relative z-10 w-full pt-28 pb-24 md:pt-32">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/85 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            A division of D|R|P · Dubai
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="display mt-6 text-4xl leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            Dubai&rsquo;s most trusted collection of curated short stays.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            Designed and managed entirely in-house, each home features a private car fleet and concierge. Not a marketplace — a boutique hospitality brand..
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.26 }}
          className="relative z-20 mt-10 max-w-5xl"
        >
          <SearchWidget />
        </motion.div>
      </div>

      <motion.a
        href="#why-drp"
        aria-label="Scroll to explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit flex-col items-center gap-2 text-white/70"
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em]">
          Explore
        </span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
