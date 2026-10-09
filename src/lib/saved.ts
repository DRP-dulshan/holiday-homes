"use client";

import { useSyncExternalStore } from "react";

/** Homes the visitor saved (wishlist), kept in this browser. */
const KEY = "drp-saved";
const EVENT = "drp-saved-change";
let cached: { raw: string | null; list: string[] } = { raw: null, list: [] };

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cached.raw) return cached.list;
    const parsed = raw ? JSON.parse(raw) : [];
    cached = { raw, list: Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [] };
    return cached.list;
  } catch {
    return cached.list;
  }
}

export function toggleSaved(slug: string) {
  const list = read();
  const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug].slice(-60);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
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
const EMPTY: string[] = [];

/** The saved slugs (empty on the server and during hydration). */
export const useSaved = () => useSyncExternalStore(subscribe, read, () => EMPTY);
