/** Minimal iCalendar (RFC 5545) reading and writing for all-day availability events. */
import { addDays, isIsoDate } from "./dates";

export type IcalRange = {
  /** First blocked night. */
  start: string;
  /** Exclusive: the first night that is free again. */
  end: string;
  summary?: string;
  uid?: string;
};

/** Undo RFC 5545 line folding (a line starting with a space or tab continues the previous one). */
const unfold = (text: string) => text.replace(/\r?\n[ \t]/g, "");

/** "20261030" or "20261030T120000Z" → "2026-10-30" (null when not a date). */
function toIso(value: string): string | null {
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  return isIsoDate(iso) ? iso : null;
}

/**
 * Reads the busy ranges out of an .ics feed. Handles the all-day events Airbnb exports
 * (DTSTART;VALUE=DATE with an exclusive DTEND) and tolerates date-time values. Cancelled events
 * are skipped; an event with no end blocks its start night only.
 */
export function parseIcs(text: string): IcalRange[] {
  const out: IcalRange[] = [];
  const events = unfold(text).split(/BEGIN:VEVENT/i).slice(1);
  for (const raw of events) {
    const body = raw.split(/END:VEVENT/i)[0];
    const prop = (name: string) => {
      const m = body.match(new RegExp(`^${name}(?:;[^:\\r\\n]*)?:(.*)$`, "im"));
      return m ? m[1].trim() : null;
    };
    if (/^cancelled$/i.test(prop("STATUS") ?? "")) continue;
    const start = toIso(prop("DTSTART") ?? "");
    if (!start) continue;
    let end = toIso(prop("DTEND") ?? "") ?? addDays(start, 1);
    if (end <= start) end = addDays(start, 1);
    out.push({
      start,
      end,
      summary: prop("SUMMARY")?.replace(/\\,/g, ",").slice(0, 120) || undefined,
      uid: prop("UID")?.slice(0, 200) || undefined,
    });
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const compact = (iso: string) => iso.replace(/-/g, "");

/** Fold a content line to 75 octets as the spec requires. */
function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

export function buildIcs(name: string, events: { uid: string; start: string; end: string; summary: string }[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DRP Holiday Homes//Availability//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.start)}`,
      `DTEND;VALUE=DATE:${compact(e.end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** Airbnb's calendar export links live on airbnb domains; anything else isn't fetched. */
export function isAirbnbCalendarUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return /(^|\.)airbnb\.[a-z.]{2,}$/i.test(u.hostname);
  } catch {
    return false;
  }
}
