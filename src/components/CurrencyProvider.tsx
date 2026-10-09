"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { CURRENCIES, formatMoney, isCurrency, type CurrencyCode, type Rates } from "@/lib/currency";

const KEY = "drp-currency";
const EVENT = "drp-currency-change";

const read = (): CurrencyCode => {
  try {
    const v = window.localStorage.getItem(KEY);
    return isCurrency(v) ? v : "AED";
  } catch {
    return "AED";
  }
};
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

type Ctx = { code: CurrencyCode; setCode: (c: CurrencyCode) => void; rates: Rates };
const CurrencyContext = createContext<Ctx>({ code: "AED", setCode: () => {}, rates: { AED: 1 } });

export function CurrencyProvider({ rates, children }: { rates: Rates; children: React.ReactNode }) {
  const code = useSyncExternalStore(subscribe, read, () => "AED" as CurrencyCode);
  const value = useMemo<Ctx>(
    () => ({
      code,
      rates,
      setCode: (c) => {
        try {
          window.localStorage.setItem(KEY, c);
        } catch {
          /* private mode: lasts until the tab closes */
        }
        window.dispatchEvent(new Event(EVENT));
      },
    }),
    [code, rates],
  );
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

/** "≈ US$117" next to an AED price when the visitor picked another currency; nothing for AED. */
export function ApproxPrice({ aed, className = "" }: { aed: number; className?: string }) {
  const { code, rates } = useCurrency();
  const rate = rates[code];
  if (code === "AED" || !rate) return null;
  return (
    <span className={className} title="Approximate — you are charged in AED">
      ≈ {formatMoney(aed * rate, code)}
    </span>
  );
}

export function CurrencySelect({ className = "" }: { className?: string }) {
  const { code, setCode } = useCurrency();
  return (
    <label className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <span className="sr-only">Show prices in</span>
      <select
        value={code}
        onChange={(e) => isCurrency(e.target.value) && setCode(e.target.value)}
        className="rounded-full border border-current/30 bg-transparent px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand [&>option]:text-ink"
        aria-label="Show prices in"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
