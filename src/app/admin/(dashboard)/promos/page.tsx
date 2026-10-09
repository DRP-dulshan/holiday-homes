import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listBookings, promoUses } from "@/lib/server/bookings";
import { getAllProperties } from "@/lib/server/catalog";
import { listPromos } from "@/lib/server/promos";
import { removePromo, togglePromo } from "../../actions";
import { PromoForm } from "./PromoForm";

export const metadata: Metadata = { title: "Promo codes" };

export default async function AdminPromosPage() {
  await requireAdmin();
  const [promos, bookings, homes] = await Promise.all([listPromos(), listBookings(), getAllProperties()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-2xl font-semibold text-ink">Promo codes</h1>
        <p className="mt-1 text-sm text-ink-60">
          Guests enter a code at checkout; the discount applies to the accommodation, not the Tourism
          Dirham fee. Weekly and monthly stay discounts are set per home under Homes.
        </p>
      </div>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">New code</h2>
        <div className="mt-4">
          <PromoForm homes={homes.map((h) => ({ slug: h.slug, title: h.title }))} />
        </div>
      </section>

      {promos.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-20 bg-canvas p-10 text-center text-sm text-ink-60">
          No promo codes yet.
        </p>
      ) : (
        <ul className="divide-y divide-ink-10 rounded-card border border-ink-10 bg-canvas shadow-soft">
          {promos.map((p) => {
            const uses = promoUses(bookings, p.code);
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    <code>{p.code}</code>{" "}
                    <span className="font-normal text-ink-60">
                      — {p.type === "percent" ? `${p.value}% off` : `AED ${p.value} off`}
                    </span>
                  </p>
                  <p className="text-sm text-ink-60">
                    Used {uses}
                    {p.maxUses ? ` of ${p.maxUses}` : ""} times
                    {p.minNights ? ` · min ${p.minNights} nights` : ""}
                    {p.validUntil ? ` · book by ${p.validUntil}` : ""}
                    {p.stayFrom || p.stayTo ? ` · stays ${p.stayFrom ?? "…"} → ${p.stayTo ?? "…"}` : ""}
                    {p.propertySlugs?.length ? ` · ${p.propertySlugs.length} home(s)` : ""}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      p.active ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-ink-05 text-ink-60 ring-ink-20"
                    }`}
                  >
                    {p.active ? "Active" : "Paused"}
                  </span>
                  <form action={togglePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={p.active ? "0" : "1"} />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      {p.active ? "Pause" : "Resume"}
                    </button>
                  </form>
                  <form action={removePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn-ghost btn-sm text-red-600">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
