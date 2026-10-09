import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getAllProperties } from "@/lib/server/catalog";
import { aed } from "@/lib/pricing";
import { setHomeListed } from "../../actions";

export const metadata: Metadata = { title: "Homes" };

export default async function AdminHomesPage() {
  await requireAdmin();
  const homes = await getAllProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl font-semibold text-ink">Homes</h1>
          <p className="mt-1 text-sm text-ink-60">
            {homes.length} homes · changes appear on the website within a few seconds.
          </p>
        </div>
        <Link href="/admin/homes/new" className="btn btn-primary btn-sm">
          Add a home
        </Link>
      </div>

      <ul className="divide-y divide-ink-10 rounded-card border border-ink-10 bg-canvas shadow-soft">
        {homes.map((h) => (
          <li key={h.slug} className="flex flex-wrap items-center gap-4 p-4">
            <Image
              src={h.image}
              alt=""
              width={96}
              height={72}
              className="h-[72px] w-24 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{h.title}</p>
              <p className="text-sm text-ink-60">
                {h.area} · {h.bedrooms === 0 ? "Studio" : `${h.bedrooms} bed`} · sleeps {h.guests} · AED{" "}
                {aed.format(h.pricePerNight)}/night
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                h.hidden ? "bg-ink-05 text-ink-60 ring-ink-20" : "bg-emerald-50 text-emerald-800 ring-emerald-200"
              }`}
            >
              {h.hidden ? "Unlisted" : "Listed"}
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/admin/homes/${h.slug}`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <form action={setHomeListed}>
                <input type="hidden" name="slug" value={h.slug} />
                <input type="hidden" name="listed" value={h.hidden ? "1" : "0"} />
                <button type="submit" className="btn btn-ghost btn-sm">
                  {h.hidden ? "List it" : "Unlist"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
