"use client";

import { useState } from "react";
import { AMENITIES, type AmenityId } from "@/data/amenities";
import { Modal } from "./Modal";

export function AmenitiesList({ amenities }: { amenities: AmenityId[] }) {
  const [open, setOpen] = useState(false);
  const shown = amenities.slice(0, 8);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {shown.map((id) => {
          const a = AMENITIES[id];
          return (
            <div key={id} className="flex items-center gap-3 text-sm text-ink-80">
              <a.icon className="h-5 w-5 shrink-0 text-brand-600" />
              {a.label}
            </div>
          );
        })}
      </div>

      {amenities.length > 8 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-secondary btn-sm mt-6"
        >
          Show all {amenities.length} amenities
        </button>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="What this place offers">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {amenities.map((id) => {
            const a = AMENITIES[id];
            return (
              <div key={id} className="flex items-center gap-3 text-sm text-ink-80">
                <a.icon className="h-5 w-5 shrink-0 text-brand-600" />
                {a.label}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
