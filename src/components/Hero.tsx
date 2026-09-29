"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SearchWidget } from "./SearchWidget";
import { IconChevronDown } from "./icons";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? undefined : { scale: 1.08 }}
        animate={reduce ? undefined : { scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Dubai Marina skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Legibility gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />

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
            Dubai's most trusted collection of curated short stays.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            Every home designed and furnished by our own studio, managed
            end-to-end, and paired with a private car fleet and concierge. Not a
            marketplace — a boutique hospitality brand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.26 }}
            className="mt-10 max-w-4xl"
          >
            <SearchWidget />
          </motion.div>
        </div>
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
