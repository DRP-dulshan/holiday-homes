"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { navLinks } from "@/data/site";
import { IconArrowRight } from "./icons";

type NavbarProps = {
  /** When true, the bar starts transparent over a dark hero and turns solid on scroll. */
  overHero?: boolean;
};

export function Navbar({ overHero = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero || open;
  const tone: "light" | "dark" = solid ? "dark" : "light";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-canvas/90 backdrop-blur-md border-b border-ink-10 shadow-[0_1px_20px_-8px_rgba(46,46,46,0.18)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav className="container-drp flex h-16 items-center justify-between md:h-20">
        <Logo tone={tone} />

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "group relative text-sm font-medium transition-colors",
                solid
                  ? "text-ink-80 hover:text-ink"
                  : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-600 hover:shadow-lift sm:inline-flex sm:items-center sm:gap-2"
          >
            Enquire Now
            <IconArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden",
              solid
                ? "border-ink-20 text-ink"
                : "border-white/30 text-white",
            ].join(" ")}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span
                className={[
                  "block h-0.5 w-5 bg-current transition-transform",
                  open ? "translate-y-2 rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-5 bg-current transition-opacity",
                  open ? "opacity-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-5 bg-current transition-transform",
                  open ? "-translate-y-2 -rotate-45" : "",
                ].join(" ")}
              />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-ink-10 bg-canvas lg:hidden"
          >
            <div className="container-drp flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink-80 transition-colors hover:bg-ink-05 hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                Enquire Now
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
