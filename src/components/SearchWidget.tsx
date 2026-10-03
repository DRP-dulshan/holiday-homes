"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { areas } from "@/data/areas";
import { properties } from "@/data/properties";
import { addDays } from "@/lib/dates";
import { useToday } from "@/lib/useToday";

const MAX_GUESTS = Math.max(...properties.map((p) => p.guests));
import { IconCalendar, IconPin, IconSearch, IconUsers } from "./icons";

/** Hero search widget — submitting navigates to /explore with the selection pre-applied. */
export function SearchWidget() {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const today = useToday();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (area) params.set("area", area);
        if (checkIn && checkOut && checkOut > checkIn) {
          params.set("checkIn", checkIn);
          params.set("checkOut", checkOut);
        }
        if (guests && guests !== "1") params.set("guests", guests);
        const qs = params.toString();
        router.push(qs ? `/explore?${qs}` : "/explore");
      }}
      className="w-full rounded-[1.5rem] border border-white/20 bg-white/10 p-2 backdrop-blur-xl shadow-lift"
    >
      <div className="grid gap-1.5 rounded-[1.15rem] bg-canvas/95 p-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto]">
        <Field icon={<IconPin className="h-4 w-4" />} label="Location">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          >
            <option value="">Any area</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<IconCalendar className="h-4 w-4" />} label="Check-in">
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) setCheckOut("");
            }}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </Field>

        <Field icon={<IconCalendar className="h-4 w-4" />} label="Check-out">
          <input
            type="date"
            value={checkOut}
            min={checkIn ? addDays(checkIn, 1) : today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </Field>

        <Field icon={<IconUsers className="h-4 w-4" />} label="Guests">
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          >
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-[0.9rem] bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:mt-0"
        >
          <IconSearch className="h-4 w-4" />
          Search
        </button>
      </div>
      <p className="px-3 py-2 text-center text-xs text-white/70">
        Live availability across every DRP home — book online in minutes.
      </p>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[0.9rem] px-3 py-2.5 transition-colors hover:bg-ink-05">
      <span className="text-brand">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-60">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
