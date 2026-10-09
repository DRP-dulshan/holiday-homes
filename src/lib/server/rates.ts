import "server-only";
import { CURRENCIES, FALLBACK_RATES, type Rates } from "@/lib/currency";

/** Exchange rates from AED, refreshed twice a day; the built-in approximations if the lookup fails. */
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AED", {
      next: { revalidate: 43_200 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as { rates?: Record<string, number> };
    const out: Rates = { AED: 1 };
    for (const { code } of CURRENCIES) {
      const v = json.rates?.[code];
      if (typeof v === "number" && v > 0) out[code] = v;
    }
    return { ...FALLBACK_RATES, ...out };
  } catch {
    return FALLBACK_RATES;
  }
}
