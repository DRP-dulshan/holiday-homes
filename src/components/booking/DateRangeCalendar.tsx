"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  isNightTaken,
  formatShortDate,
  nightsBetween,
  toUtc,
  fromUtc,
  type DateRange,
} from "@/lib/dates";

type Props = {
  checkIn: string;
  checkOut: string;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
  unavailable: DateRange[];
  today: string;
  maxDate: string;
  minNights: number;
  /** Months shown side by side (2 on wide layouts). */
  months?: 1 | 2;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthLabel = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

function shiftMonth(first: string, delta: number) {
  const d = new Date(toUtc(first));
  d.setUTCMonth(d.getUTCMonth() + delta);
  return fromUtc(d.getTime());
}

function monthCells(month: string) {
  const first = new Date(toUtc(month));
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(month, i));
  return cells;
}

/** First taken night on or after `from`, or null when the rest is open. */
function firstTakenFrom(from: string, ranges: DateRange[]) {
  let best: string | null = null;
  for (const r of ranges) {
    const candidate = r.start >= from ? r.start : r.end > from ? from : null;
    if (candidate && (!best || candidate < best)) best = candidate;
  }
  return best;
}

export function DateRangeCalendar({
  checkIn,
  checkOut,
  onChange,
  unavailable,
  today,
  maxDate,
  minNights,
  months = 1,
}: Props) {
  const [month, setMonth] = useState(() => monthStart(checkIn || today));
  const [hint, setHint] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const selectingCheckOut = Boolean(checkIn && !checkOut);
  // While choosing check-out, nothing past the next booked night is reachable.
  const lastCheckOut = useMemo(
    () => (selectingCheckOut ? firstTakenFrom(checkIn, unavailable) : null),
    [selectingCheckOut, checkIn, unavailable],
  );

  const visible = useMemo(
    () => Array.from({ length: months }, (_, i) => shiftMonth(month, i)),
    [month, months],
  );

  const pick = (day: string) => {
    setHint(null);
    if (selectingCheckOut && day > checkIn) {
      if (lastCheckOut && day > lastCheckOut) {
        setHint("Some nights in that range are already booked.");
        return;
      }
      const nights = nightsBetween(checkIn, day);
      if (nights < minNights) {
        setHint(`Minimum stay is ${minNights} nights.`);
        return;
      }
      onChange({ checkIn, checkOut: day });
      return;
    }
    if (isNightTaken(day, unavailable)) {
      setHint("That night is already booked.");
      return;
    }
    onChange({ checkIn: day, checkOut: "" });
  };

  const canGoBack = month > monthStart(today);
  const canGoForward = shiftMonth(visible[visible.length - 1], 1) <= maxDate;
  // Preview the range under the pointer while choosing check-out.
  const previewEnd =
    selectingCheckOut && hovered && hovered > checkIn && (!lastCheckOut || hovered <= lastCheckOut)
      ? hovered
      : "";
  const rangeEnd = checkOut || previewEnd;

  const navButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink-80 transition-colors hover:bg-ink-05 disabled:pointer-events-none disabled:opacity-25";

  return (
    <div className="select-none" onMouseLeave={() => setHovered(null)}>
      <div className={months === 2 ? "grid gap-8 md:grid-cols-2" : ""}>
        {visible.map((m, idx) => (
          <div key={m}>
            <div className="flex h-9 items-center justify-between">
              {idx === 0 ? (
                <button
                  type="button"
                  onClick={() => canGoBack && setMonth(shiftMonth(month, -1))}
                  disabled={!canGoBack}
                  aria-label="Previous month"
                  className={navButton}
                >
                  ‹
                </button>
              ) : (
                <span className="w-9" />
              )}
              <p className="text-sm font-semibold text-ink">
                {monthLabel.format(new Date(toUtc(m)))}
              </p>
              {idx === visible.length - 1 ? (
                <button
                  type="button"
                  onClick={() => canGoForward && setMonth(shiftMonth(month, 1))}
                  disabled={!canGoForward}
                  aria-label="Next month"
                  className={navButton}
                >
                  ›
                </button>
              ) : (
                <span className="w-9" />
              )}
            </div>

            <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-40">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7" role="grid">
              {monthCells(m).map((day, i) => {
                if (!day) return <span key={`blank-${i}`} />;

                const past = day < today || day > maxDate;
                const taken = isNightTaken(day, unavailable);
                const beyondReach =
                  selectingCheckOut && day > checkIn && lastCheckOut !== null && day > lastCheckOut;
                // A booked night can still be a check-out day when it ends the stay.
                const usableAsCheckOut = selectingCheckOut && day > checkIn && !beyondReach;
                const disabled = past || beyondReach || (taken && !usableAsCheckOut);

                const isStart = day === checkIn;
                const isEnd = day === rangeEnd;
                const inRange = checkIn && rangeEnd && day > checkIn && day < rangeEnd;
                const isToday = day === today;
                const hasRange = Boolean(checkIn && rangeEnd);

                return (
                  // The soft band behind the range runs edge to edge, with rounded ends at the first and last day.
                  <span
                    key={day}
                    className={[
                      "relative flex h-11 items-center justify-center",
                      hasRange && inRange ? "bg-brand-soft" : "",
                      hasRange && isStart && rangeEnd ? "rounded-l-full bg-gradient-to-r from-transparent from-50% to-brand-soft to-50%" : "",
                      hasRange && isEnd && checkIn ? "rounded-r-full bg-gradient-to-l from-transparent from-50% to-brand-soft to-50%" : "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => pick(day)}
                      onMouseEnter={() => setHovered(day)}
                      onFocus={() => setHovered(day)}
                      aria-pressed={isStart || isEnd}
                      aria-label={`${new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}${taken ? " (booked)" : ""}`}
                      className={[
                        "relative h-10 w-10 rounded-full text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
                        isStart || isEnd
                          ? `font-semibold text-white shadow-soft ${!checkOut && isEnd ? "bg-brand/70" : "bg-brand"}`
                          : inRange
                            ? "font-medium text-ink hover:bg-brand/20"
                            : disabled
                              ? taken && !past
                                ? "text-ink-40 line-through"
                                : "text-ink-20"
                              : "font-medium text-ink hover:bg-ink-05 hover:ring-1 hover:ring-ink",
                      ].join(" ")}
                    >
                      {Number(day.slice(8))}
                      {isToday && !isStart && !isEnd ? (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
                      ) : null}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p
        className={`mt-2 min-h-[1.25rem] text-xs ${hint ? "font-medium text-red-600" : "text-ink-60"}`}
        aria-live="polite"
      >
        {hint ??
          (selectingCheckOut
            ? `Check-in ${formatShortDate(checkIn)} — now choose your check-out date.`
            : !checkIn
              ? "Choose your check-in date."
              : `${nightsBetween(checkIn, checkOut)} night${nightsBetween(checkIn, checkOut) === 1 ? "" : "s"} · ${formatShortDate(checkIn)} → ${formatShortDate(checkOut)}`)}
      </p>
    </div>
  );
}
