"use server";

import { createReview, reviewSchema, ReviewError, verifyReviewToken } from "@/lib/server/reviews";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { headers } from "next/headers";

export type ReviewState = { error?: string; ok?: boolean; fieldErrors?: Record<string, string> };

export async function submitReview(
  ref: string,
  token: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  if (!(await verifyReviewToken(ref, token))) return { error: "This review link isn't valid any more." };
  if (!rateLimit(`review:${clientIp(await headers())}`, 6, 10 * 60_000)) {
    return { error: "Too many attempts — please try again in a few minutes." };
  }
  // Honeypot: bots fill every field.
  if (formData.get("company")) return { ok: true };
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    name: formData.get("name"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Please check the highlighted fields.", fieldErrors };
  }
  try {
    await createReview(ref, parsed.data);
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    console.error("[review] failed:", err);
    return { error: "We couldn't save your review just now — please try again." };
  }
  return { ok: true };
}
