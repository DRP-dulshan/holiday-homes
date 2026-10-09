"use client";

import { useEffect, useRef, useState } from "react";
import { bookingRules } from "@/config/site";
import { addDays, formatShortDate, nightsBetween } from "@/lib/dates";
import { useToday } from "@/lib/useToday";
import { DateRangeCalendar } from "@/components/booking/DateRangeCalendar";
import { IconCalendar, IconClose } from "@/components/icons";

type Dates = { checkIn: string; checkOut: string };

/** Check-in / check-out picker for the explore page: one popover with a two-month calendar. */
export function ExploreDates({ value, onApply }: { value: Dates; onApply: (d: Dates) => void }) {
  const today = useToday();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Dates>(value);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  // The URL is the source of truth; the draft only exists while the calendar is open.
  const shown = open ? draft : value;
  const nights = nightsBetween(shown.checkIn, shown.checkOut);
  const openCalendar = () => {
    setDraft(value);
    setOpen(true);
  };
  const field = (label: string, iso: string) => (
    <button
      type="button"
      onClick={openCalendar}
      aria-expanded={open}
      className="flex min-w-[8.5rem] flex-1 flex-col rounded-xl border border-ink-20 bg-canvas px-3.5 py-2 text-left transition-colors hover:border-ink-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">{label}</span>
      <span className={`mt-0.5 flex items-center gap-2 text-sm ${iso ? "font-medium text-ink" : "text-ink-40"}`}>
        <IconCalendar className="h-4 w-4 shrink-0 text-ink-60" />
        {iso ? formatShortDate(iso) : "Add date"}
      </span>
    </button>
  );

  return (
    <div ref={root} className="relative mb-6">
      <div className="flex flex-wrap items-stretch gap-3 rounded-2xl border border-ink-10 bg-ink-05 p-3">
        {field("Check-in", shown.checkIn)}
        {field("Check-out", shown.checkOut)}
        {value.checkIn && value.checkOut ? (
          <button
            type="button"
            onClick={() => onApply({ checkIn: "", checkOut: "" })}
            className="btn btn-ghost btn-sm self-center"
          >
            <IconClose className="h-3.5 w-3.5" />
            Any dates
          </button>
        ) : null}
      </div>

      {open && today ? (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-ink-10 bg-canvas p-4 shadow-lift sm:right-auto sm:w-[40rem] sm:p-6">
          <DateRangeCalendar
            checkIn={draft.checkIn}
            checkOut={draft.checkOut}
            onChange={(next) => {
              setDraft(next);
              if (next.checkOut) {
                onApply(next);
                setOpen(false);
              }
            }}
            unavailable={[]}
            today={today}
            maxDate={addDays(today, bookingRules.maxAdvanceDays)}
            minNights={bookingRules.minNights}
            months={2}
          />
          <div className="mt-3 flex items-center justify-between border-t border-ink-10 pt-3 text-sm">
            <span className="text-ink-60">
              {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} selected` : "Pick your check-in, then check-out."}
            </span>
            <button
              type="button"
              onClick={() => setDraft({ checkIn: "", checkOut: "" })}
              disabled={!draft.checkIn}
              className="font-semibold text-brand-600 hover:underline disabled:opacity-30 disabled:no-underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
