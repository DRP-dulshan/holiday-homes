import type { Property, PropertyType } from "@/data/properties";
import { priceBounds } from "@/data/properties";
import type { AmenityId } from "@/data/amenities";
import { areas } from "@/data/areas";

const AREA_SLUG_BY_NAME = new Map(areas.map((a) => [a.name, a.slug]));

export type SortKey = "recommended" | "price-asc" | "price-desc";
const SORT_KEYS: SortKey[] = ["recommended", "price-asc", "price-desc"];

export type ExploreFilters = {
  areas: string[];
  types: PropertyType[];
  bedrooms: number; // 0 = any
  guests: number; // 0 = any
  priceMin: number;
  priceMax: number;
  /** Filter-group ids from FILTER_AMENITY_GROUPS. */
  amenities: string[];
  sort: SortKey;
};

/** Filter-facing amenity groups — a property matches if it has ANY id in the group. */
export const FILTER_AMENITY_GROUPS: { id: string; label: string; match: AmenityId[] }[] = [
  { id: "pool", label: "Pool", match: ["pool", "sharedPool"] },
  { id: "beachAccess", label: "Beach access", match: ["beachAccess"] },
  { id: "sauna", label: "Sauna / steam room", match: ["sauna", "steamRoom"] },
  { id: "gym", label: "Gym", match: ["gym"] },
  { id: "smartLock", label: "Self check-in", match: ["smartLock"] },
  { id: "parking", label: "Free parking", match: ["parking"] },
  { id: "bbq", label: "BBQ area", match: ["bbq"] },
  { id: "mallAccess", label: "Direct mall access", match: ["mallAccess"] },
];

export const defaultFilters: ExploreFilters = {
  areas: [],
  types: [],
  bedrooms: 0,
  guests: 0,
  priceMin: priceBounds.min,
  priceMax: priceBounds.max,
  amenities: [],
  sort: "recommended",
};

const clampPrice = (v: string | null, fallback: number) => {
  const n = Number(v);
  return v && Number.isFinite(n)
    ? Math.min(priceBounds.max, Math.max(priceBounds.min, n))
    : fallback;
};

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function filtersFromSearchParams(params: URLSearchParams): ExploreFilters {
  return {
    areas: csv(params.get("area")),
    types: csv(params.get("type")) as PropertyType[],
    bedrooms: Number(params.get("bedrooms") ?? 0) || 0,
    guests: Number(params.get("guests") ?? 0) || 0,
    priceMin: clampPrice(params.get("priceMin"), priceBounds.min),
    priceMax: clampPrice(params.get("priceMax"), priceBounds.max),
    amenities: csv(params.get("amenities")),
    sort: SORT_KEYS.find((k) => k === params.get("sort")) ?? "recommended",
  };
}

export function filtersToSearchParams(f: ExploreFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.areas.length) params.set("area", f.areas.join(","));
  if (f.types.length) params.set("type", f.types.join(","));
  if (f.bedrooms) params.set("bedrooms", String(f.bedrooms));
  if (f.guests) params.set("guests", String(f.guests));
  if (f.priceMin !== priceBounds.min) params.set("priceMin", String(f.priceMin));
  if (f.priceMax !== priceBounds.max) params.set("priceMax", String(f.priceMax));
  if (f.amenities.length) params.set("amenities", f.amenities.join(","));
  if (f.sort !== "recommended") params.set("sort", f.sort);
  return params;
}

export function applyFilters(properties: Property[], f: ExploreFilters): Property[] {
  let list = properties.filter((p) => {
    if (f.areas.length && !f.areas.includes(AREA_SLUG_BY_NAME.get(p.area) ?? "")) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.bedrooms && p.bedrooms < f.bedrooms) return false;
    if (f.guests && p.guests < f.guests) return false;
    if (p.pricePerNight < f.priceMin || p.pricePerNight > f.priceMax) return false;
    if (f.amenities.length) {
      const groups = FILTER_AMENITY_GROUPS.filter((g) => f.amenities.includes(g.id));
      const matchesAll = groups.every((g) => g.match.some((a) => p.amenities.includes(a)));
      if (!matchesAll) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    default:
      // "Recommended" keeps the curated catalog order.
      break;
  }
  return list;
}
