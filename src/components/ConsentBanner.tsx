"use client";

import Link from "next/link";
import { hasTrackers, setConsent, useConsent } from "@/lib/consent";

/** Asks once, and only when the site actually uses optional cookies. */
export function ConsentBanner() {
  const consent = useConsent();
  if (!hasTrackers || consent !== null) return null;
  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-ink-10 bg-canvas p-5 shadow-lift sm:bottom-5"
    >
      <p className="text-sm text-ink-80">
        We use cookies to understand how the site is used and to offer live chat. You can accept all or keep to the
        essentials. See our{" "}
        <Link href="/privacy" className="font-semibold text-brand-600 hover:underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setConsent("all")} className="btn btn-primary btn-sm">
          Accept all
        </button>
        <button type="button" onClick={() => setConsent("essential")} className="btn btn-secondary btn-sm">
          Essentials only
        </button>
      </div>
    </div>
  );
}

/** Footer link to change the choice later. */
export function CookieSettingsLink() {
  if (!hasTrackers) return null;
  return (
    <button type="button" onClick={() => setConsent("reset")} className="hover:text-white/70">
      Cookie settings
    </button>
  );
}
