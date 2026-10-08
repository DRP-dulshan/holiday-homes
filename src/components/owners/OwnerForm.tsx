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

/** Property questions. Choices are tap-able chips; no estimates are given. */
const MAIN_FIELDS: Field[] = [
  {
    id: "area",
    label: "Where is it?",
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
    options: ["Studio", "1", "2", "3", "4", "5+"],
    required: true,
  },
];

const EXTRA_FIELDS: Field[] = [
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

const ALL_FIELDS = [...MAIN_FIELDS, ...EXTRA_FIELDS];

const control =
  "w-full rounded-2xl border bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20";
const controlClass = (error?: string) =>
  `${control} ${error ? "border-red-400" : "border-ink-20"}`;

const bedroomLabel = (v: string) => (v === "Studio" ? "Studio" : `${v} bedroom${v === "1" ? "" : "s"}`);

export function OwnerForm() {
  const [property, setProperty] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const summary = ALL_FIELDS.filter((f) => property[f.id])
    .map((f) => `${f.label === "Where is it?" ? "Area" : f.label}: ${f.id === "bedrooms" ? bedroomLabel(property[f.id]) : property[f.id]}`)
    .join("\n");

  const propertyDone = MAIN_FIELDS.every((f) => property[f.id]);

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
      // Switching away from a studio clears the locked choice.
      ...(id === "type" && value !== "Studio" && p.bedrooms === "Studio" ? { bedrooms: "" } : {}),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of MAIN_FIELDS) {
      if (f.required && !property[f.id]) next[f.id] = "Please choose one";
    }
    if (contact.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) next.email = "Enter a valid email address";
    if (contact.phone.trim().length < 6) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (Object.keys(next).length) {
      // Bring the first problem into view (the form is long on phones).
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[data-invalid='true']")?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        }),
      );
      return;
    }

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
      <div className="rounded-card border border-ink-10 bg-canvas p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-600">
          <IconBadgeCheck className="h-6 w-6" />
        </span>
        <h3 className="display mt-5 text-xl font-semibold text-ink">
          Thank you, {contact.name.trim().split(" ")[0]} — we&rsquo;ll be in touch.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-60">
          We&rsquo;ve received the details of your property.
        </p>
        <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm text-ink-80">
          {[
            "The team reviews your property details.",
            "We call or WhatsApp you, usually within a couple of business days.",
            "We arrange a free walkthrough and send a written proposal.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[0.65rem] font-bold text-white">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <a
          href={whatsappLink("Hi DRP, I just sent my property details on the website.")}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm mt-8"
        >
          <IconWhatsApp className="h-4 w-4" />
          Want to talk sooner? WhatsApp us
        </a>
      </div>
    );
  }

  const noStudioBedrooms = property.type === "Studio";

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8"
    >
      <StepHeading n={1} title="About your property" done={propertyDone} />
      <div className="mt-6 space-y-6">
        {MAIN_FIELDS.map((f) => (
          <ChipGroup
            key={f.id}
            name={f.id}
            label={f.label}
            options={f.options}
            value={property[f.id] ?? ""}
            onChange={(v) => setPropertyField(f.id, v)}
            error={errors[f.id]}
            // A studio's bedrooms are fixed; show it as chosen rather than a hidden question.
            disabled={f.id === "bedrooms" && noStudioBedrooms}
            format={f.id === "bedrooms" ? bedroomLabel : undefined}
            compact={f.id === "bedrooms"}
          />
        ))}
      </div>

      <details className="group mt-6 rounded-2xl border border-ink-10 bg-ink-05/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          <span>
            More about your property{" "}
            <span className="font-normal text-ink-60">(optional — helps us prepare)</span>
          </span>
          <span className="text-lg leading-none text-brand-600 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="space-y-6 border-t border-ink-10 px-4 py-5">
          {EXTRA_FIELDS.map((f) => (
            <ChipGroup
              key={f.id}
              name={f.id}
              label={f.label}
              options={f.options}
              value={property[f.id] ?? ""}
              onChange={(v) => setPropertyField(f.id, v)}
              allowClear
            />
          ))}
        </div>
      </details>

      <div className="mt-8 border-t border-ink-10 pt-8">
        <StepHeading n={2} title="Your details" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Labelled label="Full name" error={errors.name}>
            <input
              value={contact.name}
              onChange={(e) => updateContact("name", e.target.value)}
              autoComplete="name"
              data-invalid={!!errors.name}
              className={controlClass(errors.name)}
            />
          </Labelled>
          <Labelled label="Phone / WhatsApp" error={errors.phone}>
            <input
              type="tel"
              inputMode="tel"
              value={contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
              autoComplete="tel"
              placeholder="+971 …"
              data-invalid={!!errors.phone}
              className={controlClass(errors.phone)}
            />
          </Labelled>
          <div className="sm:col-span-2">
            <Labelled label="Email" error={errors.email}>
              <input
                type="email"
                inputMode="email"
                value={contact.email}
                onChange={(e) => updateContact("email", e.target.value)}
                autoComplete="email"
                data-invalid={!!errors.email}
                className={controlClass(errors.email)}
              />
            </Labelled>
          </div>
          <div className="sm:col-span-2">
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
        {status === "sending" ? "Sending…" : "Get my free walkthrough"}
        {status !== "sending" ? <IconArrowRight className="h-4 w-4" /> : null}
      </button>
      <p className="mt-3 text-center text-xs text-ink-60">
        Free, no obligation. We only use your details to contact you about your property. Prefer to
        talk? Call {site.phoneDisplay}.
      </p>
    </form>
  );
}

function StepHeading({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <h3 className="display flex items-center gap-3 text-lg font-semibold text-ink">
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-white transition-colors ${
          done ? "bg-emerald-600" : "bg-brand"
        }`}
      >
        {done ? "✓" : n}
      </span>
      {title}
    </h3>
  );
}

/** Single-choice question shown as tap-able chips (real radio inputs underneath). */
function ChipGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  format = (v) => v,
  compact,
  allowClear,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  format?: (v: string) => string;
  compact?: boolean;
  /** Lets an optional question be un-answered by tapping the chosen chip again. */
  allowClear?: boolean;
}) {
  return (
    <fieldset data-invalid={!!error} disabled={disabled} className="min-w-0 disabled:opacity-60">
      <legend className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o;
          return (
            <label key={o} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={o}
                checked={selected}
                onChange={() => onChange(o)}
                // Radios can't be un-picked by clicking, so optional questions clear on a second tap.
                onClick={() => (allowClear && selected ? onChange("") : undefined)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex items-center rounded-full border text-sm font-medium transition-colors select-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white ${
                  compact ? "min-w-[2.75rem] justify-center px-3.5 py-2 sm:px-4 sm:py-2.5" : "px-3.5 py-2 sm:px-4 sm:py-2.5"
                } ${
                  error ? "border-red-300 bg-red-50/40 text-ink" : "border-ink-20 bg-canvas text-ink hover:border-brand/60"
                }`}
              >
                {compact ? (o === "Studio" ? "Studio" : o) : format(o)}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </fieldset>
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
