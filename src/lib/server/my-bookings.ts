import "server-only";
import { site } from "@/config/site";
import { listBookingsForEmail } from "./bookings";
import { sign, verify } from "./crypto";
import { absoluteUrl, sendMail } from "./mailer";
import { formatDate } from "@/lib/dates";

const TTL_MS = 3 * 86_400_000;

const payload = (email: string, exp: number) => `mybookings:${email.toLowerCase()}:${exp}`;

/** Signed, expiring link that lists every booking made with an email address. */
export async function myBookingsPath(email: string) {
  const exp = Date.now() + TTL_MS;
  return `/my-bookings?e=${encodeURIComponent(email.toLowerCase())}&x=${exp}&t=${await sign(payload(email, exp))}`;
}

export async function verifyMyBookingsLink(email: string, exp: number, token: string) {
  return Number.isFinite(exp) && exp > Date.now() && (await verify(payload(email, exp), token));
}

/** Emails the guest their link — only when bookings exist; callers answer the same either way. */
export async function sendMyBookingsLink(email: string) {
  const bookings = await listBookingsForEmail(email);
  if (!bookings.length) return false;
  const link = absoluteUrl(await myBookingsPath(email));
  await sendMail({
    to: email,
    subject: `Your ${site.name} bookings`,
    replyTo: site.email,
    text: `Hi,

Here is the link to see all your bookings with ${site.name} (${bookings.length}):

${link}

It works for 3 days. If you didn't ask for this, you can ignore this email — nobody can see your bookings without it.`,
  });
  return true;
}

export const myBookingsSummary = (b: { propertyTitle: string; checkIn: string; checkOut: string }) =>
  `${b.propertyTitle} · ${formatDate(b.checkIn)} – ${formatDate(b.checkOut)}`;
