import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getPropertyAnyStatus } from "@/lib/server/catalog";
import { removeHome } from "../../../actions";
import { HomeForm } from "../HomeForm";

export const metadata: Metadata = { title: "Edit home" };

export default async function EditHomePage({
  params,
  searchParams,
}: PageProps<"/admin/homes/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const sp = await searchParams;
  const home = await getPropertyAnyStatus(slug);
  if (!home) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/homes" className="text-sm text-ink-60 hover:text-ink">
            ← All homes
          </Link>
          <h1 className="display mt-2 text-2xl font-semibold text-ink">{home.title}</h1>
          {sp.created ? (
            <p className="mt-1 text-sm text-emerald-700">Home added — it&rsquo;s live on the website.</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!home.hidden ? (
            <Link href={`/property/${home.slug}`} target="_blank" className="btn btn-secondary btn-sm">
              View on site
            </Link>
          ) : null}
          <form action={removeHome}>
            <input type="hidden" name="slug" value={home.slug} />
            <button
              type="submit"
              className="btn btn-ghost btn-sm text-red-600"
              formNoValidate
            >
              {home.custom ? "Delete home" : "Restore imported details"}
            </button>
          </form>
        </div>
      </div>
      <HomeForm mode="edit" home={home} />
    </div>
  );
}
