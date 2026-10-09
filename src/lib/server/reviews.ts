import "server-only";
import { z } from "zod";
import { site } from "@/config/site";
import { todayIso } from "@/lib/dates";
import { getBooking, type Booking } from "./bookings";
import { newId, sign, verify } from "./crypto";
import { absoluteUrl, sendMail, teamInbox } from "./mailer";
import { clearReviewStatsCache, REVIEWS, type Review, type ReviewStatus } from "./review-stats";
import { mutate, readAll } from "./store";

export type { Review, ReviewStatus } from "./review-stats";

export const reviewToken = (ref: string) => sign(`review:${ref}`);
export const verifyReviewToken = (ref: string, token: string | null | undefined) =>
  verify(`review:${ref}`, token);
export const reviewUrl = async (ref: string) => `/review/${ref}?t=${await reviewToken(ref)}`;

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  name: z.string().trim().min(2, "Enter the name to show").max(40),
  comment: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(1500),
});

export class ReviewError extends Error {}

/** A stay can be reviewed once it has ended and was actually confirmed. */
export const canReview = (b: Booking) => b.status === "confirmed" && b.checkOut <= todayIso();

export async function listReviews() {
  return (await readAll<Review>(REVIEWS)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function reviewForBooking(ref: string) {
  return (await readAll<Review>(REVIEWS)).find((r) => r.bookingRef === ref) ?? null;
}

export async function approvedReviews(slug?: string) {
  return (await listReviews()).filter((r) => r.status === "approved" && (!slug || r.propertySlug === slug));
}

/** The guest's first name and last initial: "Sara Khan" → "Sara K." */
export const publicName = (full: string) => {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
};

export async function createReview(ref: string, input: z.infer<typeof reviewSchema>) {
  const booking = await getBooking(ref);
  if (!booking) throw new ReviewError("We couldn't find that booking.");
  if (!canReview(booking)) throw new ReviewError("Reviews open once your stay has ended.");

  const review = await mutate<Review, Review>(REVIEWS, (reviews) => {
    if (reviews.some((r) => r.bookingRef === booking.ref)) throw new ReviewError("You've already reviewed this stay — thank you!");
    const created: Review = {
      id: newId(),
      bookingRef: booking.ref,
      propertySlug: booking.propertySlug,
      name: input.name,
      rating: input.rating,
      comment: input.comment,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    reviews.push(created);
    return created;
  });
  clearReviewStatsCache();

  await sendMail({
    to: teamInbox(),
    subject: `New ${review.rating}★ review to approve — ${booking.propertyTitle}`,
    text: `${review.name} reviewed ${booking.propertyTitle} (${booking.ref}).\n\n${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}\n${review.comment}\n\nApprove or hide it: ${absoluteUrl("/admin/reviews")}`,
  });
  return review;
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  await mutate<Review, void>(REVIEWS, (reviews) => {
    const r = reviews.find((x) => x.id === id);
    if (r) r.status = status;
  });
  clearReviewStatsCache();
}

export async function replyToReview(id: string, reply: string) {
  await mutate<Review, void>(REVIEWS, (reviews) => {
    const r = reviews.find((x) => x.id === id);
    if (r) r.reply = reply.trim().slice(0, 800) || undefined;
  });
}

export async function deleteReview(id: string) {
  await mutate<Review, void>(REVIEWS, (reviews) => {
    const i = reviews.findIndex((x) => x.id === id);
    if (i !== -1) reviews.splice(i, 1);
  });
  clearReviewStatsCache();
}

/** Email asking a guest for a review after check-out. */
export async function sendReviewRequest(b: Booking) {
  const link = absoluteUrl(await reviewUrl(b.ref));
  return sendMail({
    to: b.guest.email,
    subject: `How was your stay at ${b.propertyTitle}?`,
    replyTo: site.email,
    text: `Hi ${b.guest.name.split(" ")[0]},

Thank you for staying with ${site.name}. We hope you enjoyed ${b.propertyTitle}.

Would you share a few words about your stay? It takes a minute and helps other guests choose:

${link}

If anything wasn't right, just reply to this email or WhatsApp ${site.whatsappNumber} and we'll make it right.`,
  });
}
