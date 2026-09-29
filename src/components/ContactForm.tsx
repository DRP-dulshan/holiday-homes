"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, enquiryTypes, type EnquiryInput } from "@/lib/enquiry-schema";
import { IconArrowRight, IconBadgeCheck } from "./icons";

type ContactFormProps = {
  defaultEnquiryType?: EnquiryInput["enquiryType"];
  propertySlug?: string;
  source?: string;
  showTypeSelect?: boolean;
  messagePlaceholder?: string;
};

export function ContactForm({
  defaultEnquiryType = "stay",
  propertySlug,
  source = "contact-page",
  showTypeSelect = true,
  messagePlaceholder = "Tell us your dates, preferred area and party size.",
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { enquiryType: defaultEnquiryType, propertySlug, source },
  });

  const onSubmit = async (data: EnquiryInput) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset({ enquiryType: defaultEnquiryType, propertySlug, source, name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-card border border-ink-10 bg-canvas p-6 text-center shadow-soft sm:p-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-600">
          <IconBadgeCheck className="h-6 w-6" />
        </span>
        <h3 className="display mt-5 text-xl font-semibold text-ink">
          Thank you — we&rsquo;ll be in touch.
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-60">
          A member of the DRP team will reply within a few hours. This is a
          demo form — no enquiry is routed to a live inbox yet.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-brand-600 hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-4">
        {showTypeSelect ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
              I&rsquo;d like to
            </span>
            <select
              {...register("enquiryType")}
              className="w-full rounded-2xl border border-ink-20 bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {enquiryTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" {...register("enquiryType")} />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register("name")}
              placeholder="Your full name"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="you@email.com"
              className={inputClass(!!errors.email)}
            />
          </Field>
        </div>

        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+971 …"
            className={inputClass(!!errors.phone)}
          />
        </Field>

        <Field label="Message" error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={4}
            placeholder={messagePlaceholder}
            className={inputClass(!!errors.message)}
          />
        </Field>

        {propertySlug ? <input type="hidden" {...register("propertySlug")} /> : null}
        <input type="hidden" {...register("source")} />

        {status === "error" ? (
          <p className="text-sm text-red-600">
            Something went wrong sending that — please try again, or message
            us on WhatsApp instead.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary mt-1 disabled:hover:bg-brand"
        >
          {isSubmitting ? "Sending…" : "Send enquiry"}
          {!isSubmitting ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-2xl border bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-40 focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-ink-20 focus:border-brand focus:ring-brand/20",
  ].join(" ");
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
