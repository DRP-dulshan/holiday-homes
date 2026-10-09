import "server-only";
import {
  listedTypesFor,
  priceBoundsFor,
  seedProperties,
  type Property,
} from "@/data/properties";
import { areas } from "@/data/areas";
import { getRatingStats } from "./review-stats";
import { mutate, readAll } from "./store";

/**
 * The home collection. The imported listings in src/data/properties.ts are the starting point;
 * the team's edits and newly added homes are stored (see the admin "Homes" page) and layered on top.
 * A stored row for a built-in home only holds the fields that were changed.
 */
const COLLECTION = "properties";

type Row = Partial<Property> & { slug: string };

/** Short in-memory cache so a page doesn't hit the database once per component. */
const TTL_MS = 5_000;
let cache: { at: number; rows: Row[] } | null = null;

async function readRows(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const rows = await readAll<Row>(COLLECTION);
    cache = { at: Date.now(), rows };
    return rows;
  } catch (err) {
    // Never take the public site down because the database is unreachable.
    console.error("[catalog] couldn't read stored homes — showing the built-in list:", err);
    return [];
  }
}

export function clearCatalogCache() {
  cache = null;
}

function merge(rows: Row[]): Property[] {
  const stored = new Map(rows.map((r) => [r.slug, r]));
  const out: Property[] = seedProperties.map((p) => ({ ...p, ...(stored.get(p.slug) ?? {}) }));
  for (const r of rows) {
    if (r.custom && !seedProperties.some((p) => p.slug === r.slug)) out.push(r as Property);
  }
  return out;
}

/** Every home, including unlisted ones (admin only). */
export async function getAllProperties(): Promise<Property[]> {
  const [rows, stats] = await Promise.all([readRows(), getRatingStats()]);
  // Ratings come from approved guest reviews; homes without any show none.
  return merge(rows).map((p) => {
    const s = stats.get(p.slug);
    return { ...p, rating: s?.rating, reviews: s?.reviews };
  });
}

/** Homes guests can see and book. */
export async function getProperties(): Promise<Property[]> {
  return (await getAllProperties()).filter((p) => !p.hidden);
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  return (await getProperties()).find((p) => p.slug === slug);
}

/** Like getProperty, but also finds unlisted homes — for existing bookings and the admin. */
export async function getPropertyAnyStatus(slug: string): Promise<Property | undefined> {
  return (await getAllProperties()).find((p) => p.slug === slug);
}

/** What the search box, filters and area cards need, derived from the visible homes. */
export type CatalogSummary = {
  total: number;
  maxGuests: number;
  homesByArea: Record<string, number>;
  priceBounds: { min: number; max: number };
  listedTypes: { value: Property["type"]; label: string }[];
};

export function summarize(list: Property[]): CatalogSummary {
  const homesByArea: Record<string, number> = {};
  for (const a of areas) homesByArea[a.name] = 0;
  for (const p of list) homesByArea[p.area] = (homesByArea[p.area] ?? 0) + 1;
  return {
    total: list.length,
    maxGuests: list.length ? Math.max(...list.map((p) => p.guests)) : 2,
    homesByArea,
    priceBounds: priceBoundsFor(list),
    listedTypes: listedTypesFor(list),
  };
}

export async function getCatalogSummary() {
  return summarize(await getProperties());
}

/** Saves the changed fields of a built-in home, or the full record of a custom one. */
export async function saveProperty(slug: string, patch: Partial<Property>, create = false) {
  await mutate<Row, void>(COLLECTION, (rows) => {
    const i = rows.findIndex((r) => r.slug === slug);
    if (create) {
      if (i !== -1 || seedProperties.some((p) => p.slug === slug))
        throw new Error("A home with that address (slug) already exists.");
      rows.push({ ...patch, slug, custom: true } as Row);
    } else if (i === -1) {
      rows.push({ ...patch, slug });
    } else {
      rows[i] = { ...rows[i], ...patch, slug };
    }
  });
  clearCatalogCache();
}

/** Removes a custom home entirely; built-in homes are unlisted instead (see setHidden). */
export async function deleteCustomProperty(slug: string) {
  await mutate<Row, void>(COLLECTION, (rows) => {
    const i = rows.findIndex((r) => r.slug === slug && r.custom);
    if (i !== -1) rows.splice(i, 1);
  });
  clearCatalogCache();
}

/** Forgets the team's edits to a built-in home, restoring the imported details. */
export async function resetToImported(slug: string) {
  await mutate<Row, void>(COLLECTION, (rows) => {
    const i = rows.findIndex((r) => r.slug === slug && !r.custom);
    if (i !== -1) rows.splice(i, 1);
  });
  clearCatalogCache();
}
