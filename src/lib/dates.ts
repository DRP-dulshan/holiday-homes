/**
 * Calendar-date helpers. Stays are stored as ISO dates ("YYYY-MM-DD") with
 * no time component, so all arithmetic is done in UTC to avoid DST and
 * local-timezone drift. A stay occupies the nights [checkIn, checkOut).
 */
import { site } from "@/config/site";

export type DateRange = { start: string; end: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function toUtc(iso: string) {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function fromUtc(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  return fromUtc(toUtc(iso) + days * DAY_MS);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return 0;
  const n = Math.round((toUtc(checkOut) - toUtc(checkIn)) / DAY_MS);
  return n > 0 ? n : 0;
}

/** Today's date in Dubai, which is what "today" means for check-in purposes. */
export function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: site.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True when two half-open night ranges share at least one night. */
export function rangesOverlap(a: DateRange, b: DateRange) {
  return a.start < b.end && b.start < a.end;
}

/** True when the night starting on `iso` falls inside any of the ranges. */
export function isNightTaken(iso: string, ranges: DateRange[]) {
  return ranges.some((r) => r.start <= iso && iso < r.end);
}

const longDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return isIsoDate(iso) ? longDate.format(new Date(toUtc(iso))) : iso;
}

const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatShortDate(iso: string) {
  return isIsoDate(iso) ? shortDate.format(new Date(toUtc(iso))) : iso;
}
