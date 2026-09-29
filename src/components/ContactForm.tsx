"use client";

import { useState } from "react";
import { IconArrowRight } from "./icons";

type Status = "idle" | "sent";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("sent");
      }}
      className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8"
    >
      {status === "sent" ? (
        <div className="flex min-h-[18rem] flex-col items-center justify-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-600">
            <IconArrowRight className="h-6 w-6" />
          </span>
          <h3 className="display mt-5 text-xl font-semibold text-ink">
            Thank you — we&rsquo;ll be in touch.
          </h3>
          <p className="mt-2 max-w-sm text-sm text-ink-60">
            A member of the DRP team will reply within a few hours. This is a
            demo form and no message was actually sent.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" name="name" placeholder="Your full name" />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@email.com"
            />
          </div>
          <Input
            label="Phone"
            name="phone"
            type="tel"
            placeholder="+971 …"
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
              Message
            </span>
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Tell us your dates, preferred area and party size."
              className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Send enquiry
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
