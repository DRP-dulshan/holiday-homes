import type { Property, PropertyType } from "@/data/properties";
import { priceBounds } from "@/data/properties";
import type { AmenityId } from "@/data/amenities";
import { areas } from "@/data/areas";

const AREA_SLUG_BY_NAME = new Map(areas.map((a) => [a.name, a.slug]));

export type SortKey = "recommended" | "price-asc" | "price-desc" | "rating";

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
  { id: "view", label: "Sea / marina / skyline view", match: ["seaView", "marinaView", "skylineView", "canalView"] },
  { id: "beachAccess", label: "Beach access", match: ["beachAccess"] },
  { id: "parking", label: "Parking", match: ["parking"] },
  { id: "gym", label: "Gym", match: ["gym"] },
  { id: "garden", label: "Private garden", match: ["garden"] },
  { id: "petsAllowed", label: "Pets allowed", match: ["petsAllowed"] },
  { id: "workspace", label: "Workspace", match: ["workspace"] },
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

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function filtersFromSearchParams(params: URLSearchParams): ExploreFilters {
  return {
    areas: csv(params.get("area")),
    types: csv(params.get("type")) as PropertyType[],
    bedrooms: Number(params.get("bedrooms") ?? 0) || 0,
    guests: Number(params.get("guests") ?? 0) || 0,
    priceMin: Number(params.get("priceMin") ?? priceBounds.min) || priceBounds.min,
    priceMax: Number(params.get("priceMax") ?? priceBounds.max) || priceBounds.max,
    amenities: csv(params.get("amenities")),
    sort: (params.get("sort") as SortKey) || "recommended",
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
    case "rating":
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    default:
      list = [...list].sort((a, b) => b.reviews - a.reviews);
  }
  return list;
}
