"use client";

import { useState } from "react";
import { areas } from "@/data/areas";
import { IconCalendar, IconPin, IconSearch, IconUsers } from "./icons";

/**
 * Visual search widget for the hero. Interaction states only — no live search
 * for this demo build.
 */
export function SearchWidget() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        window.setTimeout(() => setSubmitted(false), 2400);
      }}
      className="w-full rounded-[1.5rem] border border-white/20 bg-white/10 p-2 backdrop-blur-xl shadow-lift"
    >
      <div className="grid gap-1.5 rounded-[1.15rem] bg-canvas/95 p-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto]">
        <Field icon={<IconPin className="h-4 w-4" />} label="Location">
          <select
            defaultValue=""
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          >
            <option value="" disabled>
              Any area
            </option>
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
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </Field>

        <Field icon={<IconCalendar className="h-4 w-4" />} label="Check-out">
          <input
            type="date"
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          />
        </Field>

        <Field icon={<IconUsers className="h-4 w-4" />} label="Guests">
          <select
            defaultValue="2"
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
          {submitted ? "Searching…" : "Search"}
        </button>
      </div>
      <p className="px-3 py-2 text-center text-xs text-white/70">
        {submitted
          ? "Our team will follow up with matching homes — this is a preview widget."
          : "Real-time availability across every DRP address."}
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
