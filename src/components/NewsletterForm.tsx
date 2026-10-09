"use client";

import { useState } from "react";

/** Footer email signup. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setState("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  if (state === "done") return <p className="text-sm text-white/80">Thanks — you&rsquo;re on the list.</p>;

  return (
    <form onSubmit={submit} noValidate className="max-w-xs">
      <label htmlFor="newsletter-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
        New homes and offers
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-brand"
        />
        <button type="submit" disabled={state === "sending"} className="btn btn-primary btn-sm">
          {state === "sending" ? "…" : "Join"}
        </button>
      </div>
      <input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {state === "error" ? <p className="mt-2 text-xs text-red-300">{message}</p> : null}
    </form>
  );
}
