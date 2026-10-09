import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listSubscribers } from "@/lib/server/newsletter";

export const metadata: Metadata = { title: "Subscribers" };

export default async function AdminSubscribersPage() {
  await requireAdmin();
  const rows = await listSubscribers();
  const active = rows.filter((r) => r.active);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl font-semibold text-ink">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-ink-60">
            {active.length} active · {rows.length - active.length} unsubscribed. Download the list and send
            your newsletter from Mailchimp, Brevo or similar.
          </p>
        </div>
        <a href="/api/admin/export?type=subscribers" className="btn btn-secondary btn-sm">
          Export CSV
        </a>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-20 bg-canvas p-10 text-center text-sm text-ink-60">
          No subscribers yet. The signup box is in the website footer.
        </p>
      ) : (
        <ul className="divide-y divide-ink-10 rounded-card border border-ink-10 bg-canvas text-sm shadow-soft">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className={r.active ? "text-ink" : "text-ink-40 line-through"}>{r.email}</span>
              <span className="text-xs text-ink-60">
                {new Date(r.createdAt).toLocaleDateString("en-GB")}
                {r.active ? "" : " · unsubscribed"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
