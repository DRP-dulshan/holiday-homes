import "server-only";
import { readAll } from "./store";

export const REVIEWS = "reviews";

export type ReviewStatus = "pending" | "approved" | "hidden";

/** A guest's review of a completed stay. Only approved reviews are public. */
export type Review = {
  id: string;
  bookingRef: string;
  propertySlug: string;
  /** Shown publicly, e.g. "Sara K." */
  name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  /** The team's public reply. */
  reply?: string;
  createdAt: string;
};

export type RatingStats = { rating: number; reviews: number };

const TTL_MS = 5_000;
let cache: { at: number; stats: Map<string, RatingStats> } | null = null;

export const clearReviewStatsCache = () => {
  cache = null;
};

/** Average rating and count of approved reviews, per home (never throws). */
export async function getRatingStats(): Promise<Map<string, RatingStats>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.stats;
  const stats = new Map<string, RatingStats>();
  try {
    const sums = new Map<string, { total: number; count: number }>();
    for (const r of await readAll<Review>(REVIEWS)) {
      if (r.status !== "approved") continue;
      const s = sums.get(r.propertySlug) ?? { total: 0, count: 0 };
      s.total += r.rating;
      s.count += 1;
      sums.set(r.propertySlug, s);
    }
    for (const [slug, s] of sums) stats.set(slug, { rating: Math.round((s.total / s.count) * 10) / 10, reviews: s.count });
  } catch (err) {
    console.error("[reviews] couldn't read ratings:", err);
  }
  cache = { at: Date.now(), stats };
  return stats;
}
