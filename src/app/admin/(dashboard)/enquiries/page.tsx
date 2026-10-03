import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { getProperty } from "@/data/properties";
import { enquiryTypes } from "@/lib/enquiry-schema";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listEnquiries } from "@/lib/server/enquiries";
import { updateEnquiry } from "../../actions";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const show = sp.show === "all" ? "all" : "new";
  const all = await listEnquiries();
  const rows = show === "all" ? all : all.filter((e) => e.status === "new");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-2xl font-semibold text-ink">Enquiries</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-full border border-ink-10 bg-canvas p-1">
            {(["new", "all"] as const).map((v) => (
              <Link
                key={v}
                href={v === "new" ? "/admin/enquiries" : "/admin/enquiries?show=all"}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  show === v ? "bg-ink text-white" : "text-ink-60 hover:text-ink"
                }`}
              >
                {v === "new" ? `New (${all.filter((e) => e.status === "new").length})` : `All (${all.length})`}
              </Link>
            ))}
          </div>
          <a href="/api/admin/export?type=enquiries" className="btn btn-secondary btn-sm">
            Export CSV
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-20 bg-canvas p-10 text-center text-sm text-ink-60">
          {show === "new" ? "No new enquiries." : "No enquiries yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((e) => {
            const property = e.propertySlug ? getProperty(e.propertySlug) : undefined;
            return (
              <article key={e.id} className="rounded-card border border-ink-10 bg-canvas p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-60">
                      {enquiryTypes.find((t) => t.value === e.enquiryType)?.label} ·{" "}
                      {new Date(e.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" })}
                    </p>
                    <h2 className="display mt-1 text-lg font-semibold text-ink">{e.name}</h2>
                    <p className="text-sm">
                      <a href={`mailto:${e.email}`} className="text-brand-600 hover:underline">{e.email}</a>
                      <span className="text-ink-40"> · </span>
                      <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="text-ink-80 hover:underline">{e.phone}</a>
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                {property ? (
                  <p className="mt-3 text-sm text-ink-60">
                    About:{" "}
                    <Link href={`/property/${property.slug}`} target="_blank" className="font-semibold text-ink hover:text-brand-600">
                      {property.title}
                    </Link>
                  </p>
                ) : null}
                <p className="mt-3 whitespace-pre-line rounded-xl bg-ink-05 p-3 text-sm text-ink-80">{e.message}</p>
                <form action={updateEnquiry} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={e.id} />
                  <a href={`mailto:${e.email}?subject=${encodeURIComponent("Re: your enquiry to DRP Holiday Homes")}`} className="btn btn-primary btn-sm">
                    Reply by email
                  </a>
                  {e.status === "new" ? (
                    <button type="submit" name="intent" value="handled" className="btn btn-secondary btn-sm">
                      Mark handled
                    </button>
                  ) : (
                    <button type="submit" name="intent" value="reopen" className="btn btn-secondary btn-sm">
                      Mark as new
                    </button>
                  )}
                  <button type="submit" name="intent" value="delete" className="btn btn-ghost btn-sm">
                    Delete
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
