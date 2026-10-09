import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { unsubscribe, verifyUnsubscribeToken } from "@/lib/server/newsletter";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const valid = !!email && (await verifyUnsubscribeToken(email, token));

  async function confirm() {
    "use server";
    if (valid) await unsubscribe(email);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-ink-05">
        <div className="container-drp max-w-xl pt-28 pb-20 md:pt-36">
          <h1 className="display text-3xl font-semibold text-ink">Unsubscribe</h1>
          {valid ? (
            <form action={confirm} className="mt-6 rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
              <p className="text-ink-80">Stop sending emails to {email}?</p>
              <button className="btn btn-primary mt-4">Yes, unsubscribe me</button>
            </form>
          ) : (
            <p className="mt-6 text-ink-80">That link isn&rsquo;t valid. Reply to any of our emails and we&rsquo;ll remove you.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
