import "server-only";
import type { Property } from "@/data/properties";
import type { DateRange } from "@/lib/dates";

/**
 * The D|R|P portal is the source of truth for homes, their calendars (including Airbnb) and
 * bookings when PORTAL_API_URL is set. Everything here degrades quietly: if the portal can't be
 * reached the site keeps showing its last good copy (or the built-in homes).
 */
const base = () => process.env.PORTAL_API_URL?.trim().replace(/\/$/, "") || "";
const key = () => process.env.PORTAL_API_KEY?.trim() || "";

export const portalEnabled = () => !!base();

const HOMES_TTL = 30_000;
const BUSY_TTL = 10_000;

let homes: { at: number; list: Property[] } | null = null;
let busy: { at: number; map: Record<string, DateRange[]> } | null = null;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base()}${path}`, { cache: "no-store", signal: AbortSignal.timeout(6_000) });
  if (!res.ok) throw new Error(`portal ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export function clearPortalCache() {
  homes = null;
  busy = null;
}

/** Published homes from the portal; null when the portal is off, unreachable or has none yet. */
export async function getPortalHomes(): Promise<Property[] | null> {
  if (!portalEnabled()) return null;
  if (homes && Date.now() - homes.at < HOMES_TTL) return homes.list.length ? homes.list : null;
  try {
    const { homes: rows } = await getJson<{ homes: (Omit<Property, "id" | "tag"> & { tag?: string })[] }>("/api/public/homes");
    const list = rows.map(
      (h) =>
        ({
          ...h,
          id: h.slug,
          tag: h.tag ?? "",
          building: h.building ?? undefined,
          sizeSqft: h.sizeSqft ?? undefined,
          lat: h.lat ?? undefined,
          lng: h.lng ?? undefined,
          mapsUrl: h.mapsUrl ?? undefined,
          pricing: {
            weekendRate: h.pricing?.weekendRate ?? undefined,
            weeklyDiscountPct: h.pricing?.weeklyDiscountPct ?? undefined,
            monthlyDiscountPct: h.pricing?.monthlyDiscountPct ?? undefined,
            seasons: h.pricing?.seasons?.length ? h.pricing.seasons : undefined,
          },
        }) as Property,
    );
    homes = { at: Date.now(), list };
  } catch (err) {
    console.error("[portal] couldn't read homes:", err);
    // Keep serving the last good copy for a while rather than flipping to the built-in list.
    if (!homes) return null;
    homes = { at: Date.now() - HOMES_TTL + 5_000, list: homes.list };
  }
  return homes.list.length ? homes.list : null;
}

/** Busy ranges per home slug (bookings + Airbnb/Booking.com blocks kept in the portal). */
export async function getPortalBusy(fresh = false): Promise<Record<string, DateRange[]>> {
  if (!portalEnabled()) return {};
  if (!fresh && busy && Date.now() - busy.at < BUSY_TTL) return busy.map;
  try {
    const { homes: map } = await getJson<{ homes: Record<string, DateRange[]> }>("/api/public/availability");
    busy = { at: Date.now(), map };
    return map;
  } catch (err) {
    console.error("[portal] couldn't read availability:", err);
    if (fresh) throw err;
    return busy?.map ?? {};
  }
}

/** True when this home's calendar lives in the portal. */
export async function isPortalHome(slug: string) {
  return !!(await getPortalHomes())?.some((h) => h.slug === slug);
}

export class PortalError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function send(path: string, method: "POST" | "PATCH", body: unknown) {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${key()}` },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new PortalError(detail?.error ?? `portal ${path} → ${res.status}`, res.status);
  }
}

export type PortalBookingPush = {
  ref: string;
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "tentative" | "confirmed";
  guest: { name: string; email: string; phone: string; nationality?: string };
  quote: { nightlyRate: number; accommodation: number; cleaningFee: number; tourismFee: number; total: number };
  message?: string;
  notes?: string;
};

export const pushBookingToPortal = (b: PortalBookingPush) => send("/api/public/bookings", "POST", b);

export const pushStatusToPortal = (ref: string, status: "confirmed" | "cancelled", reason?: string) =>
  send(`/api/public/bookings/${encodeURIComponent(ref)}`, "PATCH", { status, reason });
