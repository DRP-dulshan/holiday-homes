import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin-auth";
import { HomeForm } from "../HomeForm";

export const metadata: Metadata = { title: "Add a home" };

export default async function NewHomePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/homes" className="text-sm text-ink-60 hover:text-ink">
          ← All homes
        </Link>
        <h1 className="display mt-2 text-2xl font-semibold text-ink">Add a home</h1>
        <p className="mt-1 text-sm text-ink-60">
          The home appears on the website as soon as you save. Its web address is made from the title.
        </p>
      </div>
      <HomeForm mode="create" />
    </div>
  );
}
