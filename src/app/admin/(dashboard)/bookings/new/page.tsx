import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getAllProperties } from "@/lib/server/catalog";
import { NewBookingForm } from "./NewBookingForm";

export const metadata: Metadata = { title: "Add a booking" };

export default async function NewBookingPage() {
  await requireAdmin();
  const homes = await getAllProperties();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/bookings" className="text-sm text-ink-60 hover:text-ink">
          ← All bookings
        </Link>
        <h1 className="display mt-2 text-2xl font-semibold text-ink">Add a booking</h1>
        <p className="mt-1 text-sm text-ink-60">
          For bookings that come in by phone or WhatsApp. The dates are checked like on the website, so
          the same nights can&rsquo;t be booked twice.
        </p>
      </div>
      <NewBookingForm homes={homes.filter((h) => !h.hidden).map((h) => ({ slug: h.slug, title: h.title, area: h.area, guests: h.guests }))} />
    </div>
  );
}
