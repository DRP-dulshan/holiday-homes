import "server-only";
import { todayIso } from "@/lib/dates";
import type { PromoRule } from "@/lib/pricing";
import { newId } from "./crypto";
import { mutate, readAll } from "./store";

export const PROMOS = "promos";

/** A discount code the team creates in the admin. */
export type Promo = {
  id: string;
  /** Upper-case letters, numbers and dashes. */
  code: string;
  type: "percent" | "fixed";
  /** Percent (1–90) or AED off the accommodation. */
  value: number;
  active: boolean;
  /** Last day the code can be used to book (Dubai date). */
  validUntil?: string;
  /** Only stays checking in on or after / on or before these dates. */
  stayFrom?: string;
  stayTo?: string;
  minNights?: number;
  /** Total redemptions allowed across all bookings (cancelled bookings free their use). */
  maxUses?: number;
  /** Limit to these homes (empty = every home). */
  propertySlugs?: string[];
  note?: string;
  createdAt: string;
};

export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);

type Ctx = { slug: string; checkIn: string; checkOut: string; nights: number; today?: string };

export type PromoResult = { ok: true; rule: PromoRule } | { ok: false; error: string };

/** Checks a code against the stay. `uses` is how many live bookings already used it. */
export function evaluatePromo(promos: Promo[], rawCode: string, ctx: Ctx, uses: number): PromoResult {
  const code = normalizeCode(rawCode);
  const promo = promos.find((p) => p.code === code);
  const bad = (error: string): PromoResult => ({ ok: false, error });
  if (!code || !promo || !promo.active) return bad("That promo code isn't valid.");
  const today = ctx.today ?? todayIso();
  if (promo.validUntil && today > promo.validUntil) return bad("That promo code has expired.");
  if (promo.stayFrom && ctx.checkIn < promo.stayFrom) return bad("That code doesn't apply to these dates.");
  if (promo.stayTo && ctx.checkIn > promo.stayTo) return bad("That code doesn't apply to these dates.");
  if (promo.minNights && ctx.nights < promo.minNights)
    return bad(`That code needs a stay of at least ${promo.minNights} nights.`);
  if (promo.propertySlugs?.length && !promo.propertySlugs.includes(ctx.slug))
    return bad("That code doesn't apply to this home.");
  if (promo.maxUses && uses >= promo.maxUses) return bad("That promo code has been fully redeemed.");
  return { ok: true, rule: { code: promo.code, type: promo.type, value: promo.value } };
}

export const listPromos = async () =>
  (await readAll<Promo>(PROMOS)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export async function createPromo(input: Omit<Promo, "id" | "createdAt" | "active">) {
  return mutate<Promo, Promo>(PROMOS, (promos) => {
    if (promos.some((p) => p.code === input.code)) throw new Error("A promo code with that name already exists.");
    const promo: Promo = { ...input, id: newId(), active: true, createdAt: new Date().toISOString() };
    promos.push(promo);
    return promo;
  });
}

export const setPromoActive = (id: string, active: boolean) =>
  mutate<Promo, void>(PROMOS, (promos) => {
    const p = promos.find((x) => x.id === id);
    if (p) p.active = active;
  });

export const deletePromo = (id: string) =>
  mutate<Promo, void>(PROMOS, (promos) => {
    const i = promos.findIndex((x) => x.id === id);
    if (i !== -1) promos.splice(i, 1);
  });
