"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
};

/**
 * Scroll-triggered fade + slide-in. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: "easeOut" },
    },
  };

  const common = {
    className,
    variants,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, margin: "-80px" },
  };

  switch (as) {
    case "section":
      return <motion.section {...common}>{children}</motion.section>;
    case "li":
      return <motion.li {...common}>{children}</motion.li>;
    case "article":
      return <motion.article {...common}>{children}</motion.article>;
    case "span":
      return <motion.span {...common}>{children}</motion.span>;
    default:
      return <motion.div {...common}>{children}</motion.div>;
  }
}
