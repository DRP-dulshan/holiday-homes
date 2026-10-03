"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { bookingRules } from "@/config/site";
import { areas } from "@/data/areas";
import { properties } from "@/data/properties";
import { addDays, formatShortDate, nightsBetween } from "@/lib/dates";
import { useToday } from "@/lib/useToday";
import { DateRangeCalendar } from "./booking/DateRangeCalendar";
import { IconCalendar, IconClose, IconPin, IconSearch, IconUsers } from "./icons";

const MAX_GUESTS = Math.max(...properties.map((p) => p.guests));
const homesIn = (areaName: string) => properties.filter((p) => p.area === areaName).length;

type Panel = "where" | "checkIn" | "checkOut" | "who" | null;

function subscribeWide(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useIsWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );

/** Hero search — location, dates and party size, then on to /explore. */
export function SearchWidget() {
  const router = useRouter();
  const today = useToday();
  const isWide = useIsWide();
  const rootRef = useRef<HTMLFormElement>(null);

  const [panel, setPanel] = useState<Panel>(null);
  const [area, setArea] = useState("");
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState(2);

  const { checkIn, checkOut } = dates;
  const nights = nightsBetween(checkIn, checkOut);
  const areaName = areas.find((a) => a.slug === area)?.name;
  const datesPanel = panel === "checkIn" || panel === "checkOut";

  // Close on outside click or Escape.
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const toggle = (next: Exclude<Panel, null>) => setPanel((p) => (p === next ? null : next));

  const submit = () => {
    setPanel(null);
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (nights > 0) {
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
    }
    if (guests > 1) params.set("guests", String(guests));
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  };

  return (
    <form
      ref={rootRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative w-full"
    >
      <div
        className={[
          "grid grid-cols-2 gap-1 rounded-[1.75rem] p-2 shadow-lift ring-1 ring-black/5 transition-colors duration-300",
          "lg:flex lg:items-center lg:gap-0 lg:rounded-full",
          panel ? "bg-ink-05" : "bg-canvas",
        ].join(" ")}
      >
        <Segment
          className="col-span-2 lg:flex-[1.35]"
          icon={<IconPin className="h-4 w-4" />}
          label="Where"
          value={areaName}
          placeholder="Anywhere in Dubai"
          active={panel === "where"}
          dimmed={!!panel}
          onClick={() => toggle("where")}
          onClear={() => setArea("")}
        />
        <Divider hidden={!!panel} />
        <Segment
          className="lg:flex-1"
          icon={<IconCalendar className="h-4 w-4" />}
          label="Check-in"
          value={checkIn ? formatShortDate(checkIn) : undefined}
          placeholder="Add date"
          active={panel === "checkIn"}
          dimmed={!!panel}
          onClick={() => toggle("checkIn")}
          onClear={() => setDates({ checkIn: "", checkOut: "" })}
        />
        <Divider hidden={!!panel} />
        <Segment
          className="lg:flex-1"
          icon={<IconCalendar className="h-4 w-4" />}
          label="Check-out"
          value={checkOut ? formatShortDate(checkOut) : undefined}
          placeholder="Add date"
          active={panel === "checkOut"}
          dimmed={!!panel}
          onClick={() => {
            if (!checkIn) return toggle("checkIn");
            if (panel === "checkOut") return setPanel(null);
            // Re-pick the check-out against the existing check-in.
            setDates({ checkIn, checkOut: "" });
            setPanel("checkOut");
          }}
          onClear={() => setDates({ checkIn, checkOut: "" })}
        />
        <Divider hidden={!!panel} />
        <Segment
          className="col-span-2 lg:flex-1"
          icon={<IconUsers className="h-4 w-4" />}
          label="Guests"
          value={`${guests} ${guests === 1 ? "guest" : "guests"}`}
          active={panel === "who"}
          dimmed={!!panel}
          onClick={() => toggle("who")}
        />

        <button
          type="submit"
          className="col-span-2 mt-1 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-7 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-600 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:mt-0 lg:ml-1 lg:rounded-full"
        >
          <IconSearch className="h-4 w-4" />
          Search
        </button>
      </div>

      <AnimatePresence>
        {panel ? (
          <motion.div
            key={datesPanel ? "dates" : panel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={[
              "z-50 mt-2 rounded-[1.75rem] bg-canvas p-4 shadow-lift ring-1 ring-black/5 sm:p-6",
              "lg:absolute lg:top-full lg:mt-3",
              panel === "where" ? "lg:left-0 lg:w-[40rem]" : "",
              datesPanel ? "lg:left-1/2 lg:w-[44rem] lg:-translate-x-1/2" : "",
              panel === "who" ? "lg:right-0 lg:w-80" : "",
            ].join(" ")}
          >
            {panel === "where" ? (
              <div>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
                  Choose an area
                </p>
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                  <li>
                    <AreaOption
                      selected={!area}
                      title="Anywhere in Dubai"
                      note={`All ${properties.length} homes`}
                      onSelect={() => {
                        setArea("");
                        setPanel("checkIn");
                      }}
                    />
                  </li>
                  {areas.map((a) => (
                    <li key={a.slug}>
                      <AreaOption
                        selected={area === a.slug}
                        title={a.name}
                        note={`${homesIn(a.name)} homes`}
                        image={a.image}
                        onSelect={() => {
                          setArea(a.slug);
                          setPanel("checkIn");
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {datesPanel && today ? (
              <div>
                <DateRangeCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(next) => {
                    setDates(next);
                    setPanel(next.checkOut ? "who" : "checkOut");
                  }}
                  unavailable={[]}
                  today={today}
                  maxDate={addDays(today, bookingRules.maxAdvanceDays)}
                  minNights={bookingRules.minNights}
                  months={isWide ? 2 : 1}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-ink-10 pt-4">
                  <p className="text-sm text-ink-80">
                    {nights > 0 ? (
                      <>
                        <span className="font-semibold text-ink">
                          {nights} night{nights === 1 ? "" : "s"}
                        </span>{" "}
                        · {formatShortDate(checkIn)} – {formatShortDate(checkOut)}
                      </>
                    ) : (
                      `Minimum stay ${bookingRules.minNights} nights`
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    {checkIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDates({ checkIn: "", checkOut: "" });
                          setPanel("checkIn");
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Clear
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setPanel("who")} className="btn btn-secondary btn-sm">
                      {nights > 0 ? "Next" : "Skip"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {panel === "who" ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">Guests</p>
                    <p className="text-xs text-ink-60">Homes sleep up to {MAX_GUESTS}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StepButton
                      label="Fewer guests"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    >
                      −
                    </StepButton>
                    <span className="w-6 text-center text-base font-semibold text-ink" aria-live="polite">
                      {guests}
                    </span>
                    <StepButton
                      label="More guests"
                      disabled={guests >= MAX_GUESTS}
                      onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
                    >
                      +
                    </StepButton>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-5 w-full">
                  <IconSearch className="h-4 w-4" />
                  Show homes
                </button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="mt-3 text-center text-xs text-white/75 lg:pl-6 lg:text-left">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
        Live availability across every DRP home — book online in minutes.
      </p>
    </form>
  );
}

function Segment({
  icon,
  label,
  value,
  placeholder,
  active,
  dimmed,
  onClick,
  onClear,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  placeholder?: string;
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div
      className={[
        "group relative flex min-w-0 items-center rounded-2xl transition-all duration-200 lg:rounded-full",
        active
          ? "bg-canvas shadow-soft ring-1 ring-black/5"
          : dimmed
            ? "hover:bg-ink-10/70"
            : "hover:bg-ink-05",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[inherit] px-4 py-3 text-left lg:px-5"
      >
        <span className={`shrink-0 transition-colors ${active ? "text-brand" : "text-ink-40 group-hover:text-brand"}`}>
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-60">
            {label}
          </span>
          <span className={`block truncate text-sm font-semibold ${value ? "text-ink" : "font-medium text-ink-40"}`}>
            {value ?? placeholder}
          </span>
        </span>
      </button>
      {onClear && value && active ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear ${label.toLowerCase()}`}
          className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-10 text-ink-80 hover:bg-ink-20"
        >
          <IconClose className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

function Divider({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden
      className={`hidden h-8 w-px shrink-0 bg-ink-10 transition-opacity lg:block ${hidden ? "opacity-0" : ""}`}
    />
  );
}

function AreaOption({
  title,
  note,
  image,
  selected,
  onSelect,
}: {
  title: string;
  note: string;
  image?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors ${
        selected ? "bg-brand-soft" : "hover:bg-ink-05"
      }`}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-ink-05">
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-brand">
            <IconPin className="h-5 w-5" />
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block truncate text-xs text-ink-60">{note}</span>
      </span>
    </button>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-20 text-lg leading-none text-ink-80 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
