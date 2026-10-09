"use client";

import { useState } from "react";
import { IconShare, IconWhatsApp } from "./icons";

/** Share this home: the phone's share sheet when there is one, otherwise copy link and WhatsApp. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href.split("#")[0];

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: url() });
        return;
      } catch {
        /* cancelled — fall through to nothing */
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url());
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={share} className="btn btn-secondary btn-sm">
        <IconShare className="h-4 w-4" />
        {copied ? "Link copied" : "Share"}
      </button>
      <button
        type="button"
        onClick={() =>
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`, "_blank", "noopener,noreferrer")
        }
        aria-label="Share on WhatsApp"
        className="hidden h-9 w-9 items-center justify-center rounded-full border border-ink-20 text-ink hover:border-brand hover:text-brand sm:inline-flex"
      >
        <IconWhatsApp className="h-4 w-4" />
      </button>
    </span>
  );
}
