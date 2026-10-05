"use client";

import { useState } from "react";

const aed = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

type Props = {
  /** Slider bounds — must be reachable in whole steps from `min`. */
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  /** Called once the user lets go, not on every pixel of a drag. */
  onCommit: (next: { min: number; max: number }) => void;
};

// Two native range inputs stacked on one track. The inputs ignore pointer
// events; only their thumbs receive them, so either handle can be dragged.
const thumb = [
  "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent",
  "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
  "[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand",
  "[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(46,46,46,0.35)]",
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
  "[&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
  "[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand",
  "[&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(46,46,46,0.35)]",
  "focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:ring-4 [&:focus-visible::-webkit-slider-thumb]:ring-brand/30",
].join(" ");

/** Dual-handle price slider with a filled range between the handles. */
export function PriceRange({ min, max, step, valueMin, valueMax, onCommit }: Props) {
  const [lo, setLo] = useState(valueMin);
  const [hi, setHi] = useState(valueMax);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const commit = () => {
    if (lo !== valueMin || hi !== valueMax) onCommit({ min: lo, max: hi });
  };
  // Keyboard and pointer both end with these events.
  const commitProps = { onPointerUp: commit, onKeyUp: commit, onTouchEnd: commit, onBlur: commit };

  return (
    <div>
      <p className="text-sm font-medium text-ink">
        AED {aed.format(lo)} – AED {aed.format(hi)}
      </p>
      <div className="relative mt-4 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi - step))}
          {...commitProps}
          aria-label="Minimum price per night"
          // Keep the low handle reachable when both sit at the top end.
          className={`${thumb} ${lo > max - (max - min) / 4 ? "z-20" : "z-10"}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo + step))}
          {...commitProps}
          aria-label="Maximum price per night"
          className={`${thumb} z-10`}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-40">
        <span>AED {aed.format(min)}</span>
        <span>AED {aed.format(max)}</span>
      </div>
    </div>
  );
}
