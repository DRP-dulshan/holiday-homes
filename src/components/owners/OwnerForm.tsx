"use client";

import { useState } from "react";
import { areas } from "@/data/areas";
import { site, whatsappLink } from "@/config/site";
import { IconArrowRight, IconBadgeCheck, IconWhatsApp } from "../icons";

type Field = {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
};

/** Property questions, shown together at the top of the form. No estimates are given. */
const PROPERTY_FIELDS: Field[] = [
  {
    id: "area",
    label: "Area",
    options: [...areas.map((a) => a.name), "Another area in Dubai"],
    required: true,
  },
  {
    id: "type",
    label: "Property type",
    options: ["Studio", "Apartment", "Penthouse", "Townhouse", "Villa"],
    required: true,
  },
  {
    id: "bedrooms",
    label: "Bedrooms",
    options: ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms"],
    required: true,
  },
  {
    id: "furnishing",
    label: "Furnishing",
    options: ["Fully furnished", "Partly furnished", "Unfurnished"],
  },
  {
    id: "status",
    label: "Current status",
    options: ["Vacant and ready", "Rented to a tenant", "I live in it", "Off-plan / awaiting handover"],
  },
  {
    id: "timing",
    label: "When would you like to start?",
    options: ["As soon as possible", "Within 3 months", "Later this year", "Just exploring"],
  },
];

const control =
  "w-full rounded-2xl border bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20";
const controlClass = (error?: string) =>
  `${control} ${error ? "border-red-400" : "border-ink-20"}`;

export function OwnerForm() {
  const [property, setProperty] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const summary = PROPERTY_FIELDS.filter((f) => property[f.id])
    .map((f) => `${f.label}: ${property[f.id]}`)
    .join("\n");

  // Clear a field's error as soon as it's edited, so fixed fields don't stay red.
  const clearError = (...ids: string[]) =>
    setErrors((e) => {
      if (!ids.some((id) => e[id])) return e;
      const next = { ...e };
      for (const id of ids) delete next[id];
      return next;
    });

  const updateContact = (field: keyof typeof contact, value: string) => {
    setContact((c) => ({ ...c, [field]: value }));
    clearError(field);
  };

  const setPropertyField = (id: string, value: string) => {
    clearError(id, ...(id === "type" && value === "Studio" ? ["bedrooms"] : []));
    setProperty((p) => ({
      ...p,
      [id]: value,
      // A studio has no separate bedrooms.
      ...(id === "type" && value === "Studio" ? { bedrooms: "Studio" } : {}),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of PROPERTY_FIELDS) {
      if (f.required && !property[f.id]) next[f.id] = `Select the ${f.label.toLowerCase()}`;
    }
    if (contact.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) next.email = "Enter a valid email address";
    if (contact.phone.trim().length < 6) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    const notes = contact.notes.trim();
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          enquiryType: "list-property",
          message: `Property owner enquiry\n\n${summary}${notes ? `\n\nNotes: ${notes}` : ""}`,
          source: "owners-form",
          company: contact.company,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center rounded-card border border-ink-10 bg-canvas p-8 text-center shadow-soft">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-600">
          <IconBadgeCheck className="h-6 w-6" />
        </span>
        <h3 className="display mt-5 text-xl font-semibold text-ink">
          Thank you, {contact.name.trim().split(" ")[0]} — we&rsquo;ll be in touch.
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-60">
          Our team will review your property details and contact you to arrange a walkthrough,
          usually within a couple of business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8"
    >
      <StepHeading n={1} title="About your property" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROPERTY_FIELDS.map((f) => (
          <Labelled key={f.id} label={f.required ? f.label : `${f.label} (optional)`} error={errors[f.id]}>
            <select
              value={property[f.id] ?? ""}
              onChange={(e) => setPropertyField(f.id, e.target.value)}
              disabled={f.id === "bedrooms" && property.type === "Studio"}
              className={`${controlClass(errors[f.id])} ${property[f.id] ? "" : "text-ink-40"} disabled:bg-ink-05`}
            >
              <option value="" disabled>
                Select…
              </option>
              {f.options.map((o) => (
                <option key={o} value={o} className="text-ink">
                  {o}
                </option>
              ))}
            </select>
          </Labelled>
        ))}
      </div>

      <div className="mt-8 border-t border-ink-10 pt-6">
        <StepHeading n={2} title="Your details" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Labelled label="Full name" error={errors.name}>
            <input
              value={contact.name}
              onChange={(e) => updateContact("name", e.target.value)}
              autoComplete="name"
              className={controlClass(errors.name)}
            />
          </Labelled>
          <Labelled label="Email" error={errors.email}>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              autoComplete="email"
              className={controlClass(errors.email)}
            />
          </Labelled>
          <Labelled label="Phone / WhatsApp" error={errors.phone}>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
              autoComplete="tel"
              placeholder="+971 …"
              className={controlClass(errors.phone)}
            />
          </Labelled>
        </div>
        <div className="mt-4">
          <Labelled label="Building name or anything else (optional)">
            <textarea
              rows={2}
              value={contact.notes}
              onChange={(e) => updateContact("notes", e.target.value)}
              placeholder="e.g. Marina Gate 2, sea view, available from March"
              className={controlClass()}
            />
          </Labelled>
        </div>
        {/* Honeypot: hidden from people, tempting to bots. */}
        <input
          value={contact.company}
          onChange={(e) => updateContact("company", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </div>

      {status === "error" ? (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn&rsquo;t send that right now — please send it on WhatsApp instead.
          <a
            href={whatsappLink(
              `Hi DRP, I'd like to list my property.\n${summary}\nName: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}${contact.notes ? `\nNotes: ${contact.notes}` : ""}`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm mt-3 w-full"
          >
            <IconWhatsApp className="h-4 w-4" />
            Send on WhatsApp
          </a>
        </div>
      ) : null}

      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-6 w-full">
        {status === "sending" ? "Sending…" : "Send my property details"}
        {status !== "sending" ? <IconArrowRight className="h-4 w-4" /> : null}
      </button>
      <p className="mt-3 text-center text-xs text-ink-60">
        No obligation — we&rsquo;ll call you to arrange a walkthrough. Prefer to talk? Call{" "}
        {site.phoneDisplay}.
      </p>
    </form>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <h3 className="display flex items-center gap-3 text-lg font-semibold text-ink">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm text-white">
        {n}
      </span>
      {title}
    </h3>
  );
}

function Labelled({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
