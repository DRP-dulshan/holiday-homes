"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { navLinks } from "@/config/site";
import { IconArrowRight, IconClose, IconHeart } from "./icons";
import { useSaved } from "@/lib/saved";
import { CurrencySelect } from "./CurrencyProvider";

type NavbarProps = {
  /** When true, the bar starts transparent over a dark hero and turns solid on scroll. */
  overHero?: boolean;
};

export function Navbar({ overHero = false }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const savedCount = useSaved().length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !overHero || open;
  const tone: "light" | "dark" = solid ? "dark" : "light";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          solid
            ? "bg-canvas/90 backdrop-blur-md border-b border-ink-10 shadow-[0_1px_20px_-8px_rgba(46,46,46,0.18)]"
            : "bg-transparent",
        ].join(" ")}
      >
        <nav className="container-drp flex h-16 items-center justify-between md:h-20">
          <Logo tone={tone} />

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "group relative py-2 text-sm font-medium transition-colors",
                    solid
                      ? active
                        ? "text-ink"
                        : "text-ink-80 hover:text-ink"
                      : active
                        ? "text-white"
                        : "text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}
                  <span
                    className={[
                      "absolute -bottom-0.5 left-0 h-0.5 bg-brand transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <CurrencySelect className={`hidden xl:inline-flex ${solid ? "text-ink" : "text-white"}`} />
            <Link
              href="/saved"
              aria-label={savedCount ? `Saved homes (${savedCount})` : "Saved homes"}
              className={[
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                solid ? "border-ink-20 text-ink" : "border-white/30 text-white",
              ].join(" ")}
            >
              <IconHeart className="h-[18px] w-[18px]" />
              {savedCount ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-bold text-white">
                  {savedCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/contact"
              className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-600 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:inline-flex sm:items-center sm:gap-2"
            >
              Enquire Now
              <IconArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={[
                "relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden",
                solid
                  ? "border-ink-20 text-ink"
                  : "border-white/30 text-white",
              ].join(" ")}
            >
              <span className="sr-only">Menu</span>
              {open ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <div className="space-y-1.5">
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                </div>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become
          the containing block for this fixed panel and collapse it. */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 bottom-0 z-[45] overflow-y-auto bg-canvas md:top-20 lg:hidden"
          >
            <div className="container-drp flex h-full flex-col justify-between py-8">
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.04, ease: "easeOut" }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "display block border-b border-ink-10 py-4 text-2xl font-semibold transition-colors",
                          active ? "text-brand-600" : "text-ink hover:text-brand-600",
                        ].join(" ")}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-semibold text-white"
              >
                Enquire Now
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
