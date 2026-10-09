/** Display currencies. Prices are always charged in AED; the others are shown as approximations. */
export const CURRENCIES = [
  { code: "AED", label: "AED — UAE dirham" },
  { code: "USD", label: "USD — US dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — Pound sterling" },
  { code: "SAR", label: "SAR — Saudi riyal" },
  { code: "INR", label: "INR — Indian rupee" },
  { code: "RUB", label: "RUB — Russian rouble" },
  { code: "CNY", label: "CNY — Chinese yuan" },
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export type Rates = Partial<Record<CurrencyCode, number>>;

/** Used when the live rates can't be fetched. USD and SAR are fixed to the dirham; the rest are rough. */
export const FALLBACK_RATES: Rates = { AED: 1, USD: 0.2723, SAR: 1.0211, EUR: 0.25, GBP: 0.21, INR: 22.8, RUB: 22, CNY: 1.95 };

export const isCurrency = (v: unknown): v is CurrencyCode => CURRENCIES.some((c) => c.code === v);

export function formatMoney(amount: number, code: CurrencyCode) {
  return new Intl.NumberFormat("en", { style: "currency", currency: code, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" }).format(amount);
}
