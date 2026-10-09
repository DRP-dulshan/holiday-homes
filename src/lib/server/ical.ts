import "server-only";
import { isAirbnbCalendarUrl, parseIcs, type IcalRange } from "@/lib/ical";
import type { DateRange } from "@/lib/dates";
import { sign, verify } from "./crypto";
import { mutate, readAll } from "./store";

export const ICAL = "ical";

/** The last synced copy of one home's Airbnb calendar. */
export type IcalDoc = {
  slug: string;
  /** Last successful sync (ISO). */
  syncedAt?: string;
  /** Last attempt, successful or not (ISO). */
  attemptedAt: string;
  ok: boolean;
  error?: string;
  ranges: IcalRange[];
};

const MAX_BYTES = 2_000_000;

/** Airbnb links only. `ICAL_ALLOW_ANY_HOST=1` exists for local testing. */
export const calendarUrlAllowed = (url: string) =>
  isAirbnbCalendarUrl(url) || process.env.ICAL_ALLOW_ANY_HOST === "1";

export const listIcalDocs = () => readAll<IcalDoc>(ICAL);

/** Events in our own exported feed carry this UID suffix (see exportEvents). */
export const OWN_UID_SUFFIX = "@drp-holiday-homes";

/**
 * Imported busy ranges for one home, ready for the availability check. Events that came from our
 * own feed (if Airbnb ever echoes them back) are ignored so a booking can't block itself.
 */
export const importedRanges = (docs: IcalDoc[], slug: string): DateRange[] =>
  (docs.find((d) => d.slug === slug)?.ranges ?? [])
    .filter((r) => !r.uid?.endsWith(OWN_UID_SUFFIX))
    .map((r) => ({ start: r.start, end: r.end }));

/** Docs without ranges identical to a booking's own dates, for re-checking that booking itself. */
export const withoutOwnRange = (docs: IcalDoc[], own: { propertySlug: string; checkIn: string; checkOut: string }) =>
  docs.map((d) =>
    d.slug === own.propertySlug
      ? { ...d, ranges: d.ranges.filter((r) => !(r.start === own.checkIn && r.end === own.checkOut)) }
      : d,
  );

const save = (doc: IcalDoc) =>
  mutate<IcalDoc, void>(ICAL, (docs) => {
    const i = docs.findIndex((d) => d.slug === doc.slug);
    if (i === -1) docs.push(doc);
    else docs[i] = doc;
  });

/**
 * Downloads a home's Airbnb calendar and stores its busy dates. A failed download keeps the
 * previous dates (so a hiccup never reopens nights that are really taken) and records the error.
 */
export async function syncCalendar(slug: string, url: string, timeoutMs = 8000): Promise<IcalDoc> {
  const previous = (await listIcalDocs()).find((d) => d.slug === slug);
  const attemptedAt = new Date().toISOString();
  try {
    if (!calendarUrlAllowed(url)) throw new Error("That isn't an Airbnb calendar link.");
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "DRP-Holiday-Homes/1.0 (calendar sync)", Accept: "text/calendar, */*" },
      cache: "no-store",
    });
    if (!calendarUrlAllowed(res.url || url)) throw new Error("The link redirected somewhere unexpected.");
    if (!res.ok) throw new Error(`Airbnb answered ${res.status}. Check the link is the current "Export calendar" link.`);
    const text = await res.text();
    if (text.length > MAX_BYTES) throw new Error("The calendar file is unexpectedly large.");
    if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error("That link didn't return a calendar.");
    const doc: IcalDoc = { slug, syncedAt: attemptedAt, attemptedAt, ok: true, ranges: parseIcs(text) };
    await save(doc);
    return doc;
  } catch (err) {
    const message = err instanceof Error ? (err.name === "TimeoutError" ? "Airbnb took too long to answer." : err.message) : "Sync failed.";
    console.error(`[ical] sync failed for ${slug}:`, message);
    const doc: IcalDoc = {
      slug,
      syncedAt: previous?.syncedAt,
      attemptedAt,
      ok: false,
      error: message,
      ranges: previous?.ranges ?? [],
    };
    await save(doc).catch(() => undefined);
    return doc;
  }
}

/** Re-syncs the given homes whose calendar is older than `maxAgeMs` (never throws). */
export async function syncStale(
  homes: { slug: string; airbnbIcalUrl?: string }[],
  maxAgeMs: number,
  timeoutMs = 4000,
) {
  const withUrl = homes.filter((h) => h.airbnbIcalUrl);
  if (!withUrl.length) return;
  const docs = await listIcalDocs().catch(() => [] as IcalDoc[]);
  const now = Date.now();
  await Promise.all(
    withUrl.map(async (h) => {
      const doc = docs.find((d) => d.slug === h.slug);
      if (doc && now - Date.parse(doc.attemptedAt) < maxAgeMs) return;
      await syncCalendar(h.slug, h.airbnbIcalUrl!, timeoutMs);
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Export link for Airbnb to import                                    */
/* ------------------------------------------------------------------ */

export const icalToken = (slug: string) => sign(`ical:${slug}`);
export const verifyIcalToken = (slug: string, token: string) => verify(`ical:${slug}`, token);
