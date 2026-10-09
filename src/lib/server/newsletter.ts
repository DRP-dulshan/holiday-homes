import "server-only";
import { site } from "@/config/site";
import { newId, sign, verify } from "./crypto";
import { absoluteUrl, sendMail } from "./mailer";
import { mutate, readAll } from "./store";

const SUBSCRIBERS = "subscribers";

export type Subscriber = {
  id: string;
  email: string;
  active: boolean;
  source?: string;
  createdAt: string;
  unsubscribedAt?: string;
};

export const unsubscribeToken = (email: string) => sign(`unsub:${email.toLowerCase()}`);
export const verifyUnsubscribeToken = (email: string, token: string) => verify(`unsub:${email.toLowerCase()}`, token);

export const listSubscribers = async () =>
  (await readAll<Subscriber>(SUBSCRIBERS)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Adds (or re-activates) an address. Returns false when it was already subscribed. */
export async function subscribe(rawEmail: string, source = "website") {
  const email = rawEmail.trim().toLowerCase();
  const created = await mutate<Subscriber, boolean>(SUBSCRIBERS, (rows) => {
    const existing = rows.find((r) => r.email === email);
    if (existing) {
      if (existing.active) return false;
      existing.active = true;
      existing.unsubscribedAt = undefined;
      return true;
    }
    rows.push({ id: newId(), email, active: true, source, createdAt: new Date().toISOString() });
    return true;
  });
  if (created) {
    const link = absoluteUrl(`/unsubscribe?email=${encodeURIComponent(email)}&t=${await unsubscribeToken(email)}`);
    await sendMail({
      to: email,
      subject: `You're on the ${site.name} list`,
      replyTo: site.email,
      text: `Thanks for subscribing to ${site.name}.\n\nWe'll send the occasional note about new homes and offers — never more than a couple a month.\n\nChanged your mind? Unsubscribe any time: ${link}`,
    });
  }
  return created;
}

export const unsubscribe = (rawEmail: string) =>
  mutate<Subscriber, void>(SUBSCRIBERS, (rows) => {
    const r = rows.find((x) => x.email === rawEmail.trim().toLowerCase());
    if (r?.active) {
      r.active = false;
      r.unsubscribedAt = new Date().toISOString();
    }
  });
