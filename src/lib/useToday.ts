"use client";

import { useSyncExternalStore } from "react";
import { todayIso } from "./dates";

const noop = () => () => {};

/**
 * Today's date (Dubai) for client components on statically rendered pages.
 * Returns undefined during prerender/hydration so the build date never
 * leaks into the HTML, then the real date on the client.
 */
export function useToday(): string | undefined {
  return useSyncExternalStore(noop, todayIso, () => undefined);
}
