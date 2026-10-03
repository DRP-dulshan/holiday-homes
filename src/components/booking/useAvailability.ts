"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/dates";

/** Booked / blocked night ranges for a property, fetched live. */
export function useAvailability(slug: string) {
  const [state, setState] = useState<{
    unavailable: DateRange[];
    loading: boolean;
    error: boolean;
  }>({ unavailable: [], loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/properties/${slug}/availability`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { unavailable: DateRange[] }) => {
        if (!cancelled) setState({ unavailable: data.unavailable, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ unavailable: [], loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
