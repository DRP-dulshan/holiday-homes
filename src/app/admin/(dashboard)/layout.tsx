import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/server/admin-auth";
import { logout } from "../actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — DRP Dashboard" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink-05">
      <header className="border-b border-ink-10 bg-canvas">
        <div className="container-drp flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo tone="dark" size="sm" />
            <span className="hidden rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white sm:inline">
              Team
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-ghost btn-sm" target="_blank">
              View site
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-secondary btn-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="container-drp flex-1 py-8">{children}</main>
    </div>
  );
}
