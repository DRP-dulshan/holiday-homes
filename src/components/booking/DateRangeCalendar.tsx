"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  isNightTaken,
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
}: Props) {
  const [month, setMonth] = useState(() => monthStart(checkIn || today));
  const [hint, setHint] = useState<string | null>(null);

  const selectingCheckOut = Boolean(checkIn && !checkOut);
  // While choosing check-out, nothing past the next booked night is reachable.
  const lastCheckOut = useMemo(
    () => (selectingCheckOut ? firstTakenFrom(checkIn, unavailable) : null),
    [selectingCheckOut, checkIn, unavailable],
  );

  const days = useMemo(() => {
    const first = new Date(toUtc(month));
    const offset = (first.getUTCDay() + 6) % 7; // Monday-first grid
    const daysInMonth = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let i = 0; i < daysInMonth; i++) cells.push(addDays(month, i));
    return cells;
  }, [month]);

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
  const canGoForward = shiftMonth(month, 1) <= maxDate;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoBack && setMonth(shiftMonth(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-80 hover:bg-ink-05 disabled:opacity-30"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-ink">
          {monthLabel.format(new Date(toUtc(month)))}
        </p>
        <button
          type="button"
          onClick={() => canGoForward && setMonth(shiftMonth(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-80 hover:bg-ink-05 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-40">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5" role="grid">
        {days.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;

          const past = day < today || day > maxDate;
          const taken = isNightTaken(day, unavailable);
          const beyondReach = selectingCheckOut && day > checkIn && lastCheckOut !== null && day > lastCheckOut;
          // A booked night can still be a check-out day when it ends the stay.
          const usableAsCheckOut = selectingCheckOut && day > checkIn && !beyondReach;
          const disabled = past || beyondReach || (taken && !usableAsCheckOut);

          const isStart = day === checkIn;
          const isEnd = day === checkOut;
          const inRange = checkIn && checkOut && day > checkIn && day < checkOut;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              aria-pressed={isStart || isEnd}
              aria-label={`${day}${taken ? " (booked)" : ""}`}
              className={[
                "relative h-9 text-sm transition-colors",
                isStart || isEnd
                  ? "rounded-full bg-brand font-semibold text-white"
                  : inRange
                    ? "bg-brand-soft text-ink"
                    : disabled
                      ? taken && !past
                        ? "text-ink-40 line-through"
                        : "text-ink-20"
                      : "rounded-full text-ink hover:bg-ink-05",
              ].join(" ")}
            >
              {Number(day.slice(8))}
            </button>
          );
        })}
      </div>

      <p className="mt-2 min-h-[1.25rem] text-xs text-ink-60" aria-live="polite">
        {hint ??
          (selectingCheckOut
            ? "Now choose your check-out date."
            : !checkIn
              ? "Choose your check-in date."
              : "")}
      </p>
    </div>
  );
}
