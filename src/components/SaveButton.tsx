"use client";

import { toggleSaved, useSaved } from "@/lib/saved";
import { IconHeart } from "./icons";

/** Heart toggle for the wishlist. Sits over a card image or next to a title. */
export function SaveButton({ slug, title, className = "" }: { slug: string; title: string; className?: string }) {
  const saved = useSaved().includes(slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      onClick={() => toggleSaved(slug)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-canvas/95 text-ink shadow-soft transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${className}`}
    >
      <IconHeart className={`h-[18px] w-[18px] ${saved ? "fill-brand text-brand" : ""}`} />
    </button>
  );
}
