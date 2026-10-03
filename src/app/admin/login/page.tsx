import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { adminPassword, isAdmin, usingDevPassword } from "@/lib/server/admin-auth";
import { LoginForm } from "../AdminForms";

export const metadata: Metadata = {
  title: "Team sign-in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  const configured = adminPassword() !== null;

  return (
    <main className="flex flex-1 items-center justify-center bg-ink-05 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo tone="dark" size="lg" />
        </div>
        <div className="mt-8 rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
          <h1 className="display text-xl font-semibold text-ink">Team dashboard</h1>
          <p className="mt-1 text-sm text-ink-60">Bookings, enquiries and availability.</p>
          <div className="mt-6">
            {configured ? (
              <LoginForm next={typeof next === "string" ? next : undefined} />
            ) : (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                The dashboard is locked. Set the <code>ADMIN_PASSWORD</code> environment variable
                on the server and restart to enable sign-in.
              </p>
            )}
          </div>
          {usingDevPassword() ? (
            <p className="mt-4 rounded-xl bg-ink-05 p-3 text-xs text-ink-60">
              Development mode: the password is <code className="font-semibold">drp-admin</code>.
              Set <code>ADMIN_PASSWORD</code> before going live.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
