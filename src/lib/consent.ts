"use client";

import { useSyncExternalStore } from "react";

/** Cookie choice, kept in this browser only. Essential cookies (admin sign-in) don't need consent. */
export type Consent = "all" | "essential" | null;

const KEY = "drp-consent";
const EVENT = "drp-consent-change";

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null> | "reset") {
  try {
    if (value === "reset") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    /* private mode: the choice just lasts until the page is closed */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

/** The visitor's choice; `undefined` while rendering on the server, `null` when not chosen yet. */
export const useConsent = (): Consent | undefined =>
  useSyncExternalStore(subscribe, readConsent, () => undefined);

/** Which optional trackers this deployment has switched on (public IDs only). */
export const trackers = {
  ga: process.env.NEXT_PUBLIC_GA_ID?.trim() || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
  chat: process.env.NEXT_PUBLIC_TAWK_SRC?.trim() || "",
};
export const hasTrackers = !!(trackers.ga || trackers.meta || trackers.chat);
