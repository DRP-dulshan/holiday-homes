"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { areas } from "@/data/areas";
import { site, whatsappLink } from "@/config/site";
import { IconArrowRight, IconBadgeCheck, IconWhatsApp } from "../icons";

type Question = { id: string; question: string; options: string[] };

/** Quick questions owners answer before leaving their details — no estimates shown. */
const QUESTIONS: Question[] = [
  {
    id: "area",
    question: "Where is your property?",
    options: [...areas.map((a) => a.name), "Another area in Dubai"],
  },
  {
    id: "type",
    question: "What type of property is it?",
    options: ["Studio", "Apartment", "Penthouse", "Townhouse", "Villa"],
  },
  {
    id: "bedrooms",
    question: "How many bedrooms?",
    options: ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 bedrooms", "5+ bedrooms"],
  },
  {
    id: "furnishing",
    question: "Is it furnished?",
    options: ["Fully furnished", "Partly furnished", "Unfurnished"],
  },
  {
    id: "status",
    question: "What's the property's status today?",
    options: [
      "Vacant and ready",
      "Currently rented to a tenant",
      "I live in it",
      "Off-plan / awaiting handover",
    ],
  },
  {
    id: "timing",
    question: "When would you like to start?",
    options: ["As soon as possible", "Within 3 months", "Later this year", "Just exploring"],
  },
];

const LABELS: Record<string, string> = {
  area: "Area",
  type: "Type",
  bedrooms: "Bedrooms",
  furnishing: "Furnishing",
  status: "Status",
  timing: "Start",
};

const input =
  "w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function OwnerQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = QUESTIONS.length + 1; // + contact details
  const onDetails = step === QUESTIONS.length;
  const current = QUESTIONS[step];

  const summary = QUESTIONS.map((q) => `${LABELS[q.id]}: ${answers[q.id] ?? "—"}`).join("\n");

  const choose = (option: string) => {
    // Studios skip the bedroom question.
    const studio = current.id === "type" && option === "Studio";
    setAnswers((a) => ({ ...a, [current.id]: option, ...(studio ? { bedrooms: "Studio" } : {}) }));
    setStep(studio ? step + 2 : step + 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (contact.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) next.email = "Enter a valid email address";
    if (contact.phone.trim().length < 6) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    const message = `Property owner quiz\n\n${summary}${contact.notes.trim() ? `\n\nNotes: ${contact.notes.trim()}` : ""}`;
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          enquiryType: "list-property",
          message,
          source: "owners-quiz",
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
    <div className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
        <span>
          Step {step + 1} of {total}
        </span>
        {step > 0 ? (
          <button
            type="button"
            onClick={() =>
              setStep((s) =>
                // Step back over the bedroom question if it was skipped for a studio.
                s - 1 === 2 && answers.type === "Studio" ? s - 2 : s - 1,
              )
            }
            className="normal-case tracking-normal text-brand-600 hover:underline"
          >
            ← Back
          </button>
        ) : null}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-10">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${((step + (onDetails ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-6"
        >
          {!onDetails ? (
            <>
              <h3 className="display text-xl font-semibold text-ink">{current.question}</h3>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {current.options.map((option) => {
                  const selected = answers[current.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(option)}
                      className={`rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                        selected
                          ? "border-brand bg-brand-soft text-ink"
                          : "border-ink-20 text-ink-80 hover:border-brand hover:bg-brand-soft/40"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="display text-xl font-semibold text-ink">
                Where should we send your proposal?
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-2xl bg-ink-05 p-4 text-sm sm:grid-cols-3">
                {QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-60">
                      {LABELS[q.id]}
                    </dt>
                    <dd className="text-ink">{answers[q.id]}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 grid gap-4">
                <Field label="Full name" error={errors.name}>
                  <input
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    autoComplete="name"
                    className={input}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      autoComplete="email"
                      className={input}
                    />
                  </Field>
                  <Field label="Phone / WhatsApp" error={errors.phone}>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      autoComplete="tel"
                      placeholder="+971 …"
                      className={input}
                    />
                  </Field>
                </div>
                <Field label="Building name or anything else (optional)">
                  <textarea
                    rows={3}
                    value={contact.notes}
                    onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                    placeholder="e.g. Marina Gate 2, sea view, available from March"
                    className={input}
                  />
                </Field>
                {/* Honeypot: hidden from people, tempting to bots. */}
                <input
                  value={contact.company}
                  onChange={(e) => setContact({ ...contact, company: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {status === "error" ? (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
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

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn btn-primary w-full"
                >
                  {status === "sending" ? "Sending…" : "Send my details"}
                  {status !== "sending" ? <IconArrowRight className="h-4 w-4" /> : null}
                </button>
                <p className="text-center text-xs text-ink-60">
                  No obligation. Prefer to talk? Call {site.phoneDisplay}.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Field({
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
