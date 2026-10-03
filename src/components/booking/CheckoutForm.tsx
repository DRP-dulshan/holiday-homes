"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestDetailsSchema, type GuestDetailsInput } from "@/lib/booking-schema";
import { IconArrowRight, IconLock } from "../icons";

type Props = {
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function CheckoutForm({ propertySlug, checkIn, checkOut, guests }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<{ message: string; unavailable: boolean } | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestDetailsInput>({
    resolver: zodResolver(guestDetailsSchema),
  });

  const onSubmit = async (data: GuestDetailsInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, propertySlug, checkIn, checkOut, guests }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setServerError({
          message: json.error ?? "Something went wrong — please try again.",
          unavailable: json.code === "unavailable",
        });
        return;
      }
      router.push(`${json.url}&new=1`);
    } catch {
      setServerError({
        message: "We couldn't reach the server — check your connection and try again.",
        unavailable: false,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft sm:p-8"
    >
      <h2 className="display text-xl font-semibold text-ink">Your details</h2>
      <p className="mt-1 text-sm text-ink-60">
        We&rsquo;ll use these to confirm your stay and send check-in instructions.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <input {...register("name")} autoComplete="name" className={inputClass(!!errors.name)} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className={inputClass(!!errors.email)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone / WhatsApp" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              placeholder="+971 …"
              className={inputClass(!!errors.phone)}
            />
          </Field>
          <Field label="Country of residence (optional)" error={errors.country?.message}>
            <input
              {...register("country")}
              autoComplete="country-name"
              className={inputClass(!!errors.country)}
            />
          </Field>
        </div>
        <Field label="Estimated arrival time (optional)" error={errors.arrivalTime?.message}>
          <select {...register("arrivalTime")} className={inputClass(false)}>
            <option value="">I don&rsquo;t know yet</option>
            {["Before 15:00 (early check-in request)", "15:00 – 18:00", "18:00 – 21:00", "21:00 – midnight", "After midnight"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="Special requests (optional)" error={errors.specialRequests?.message}>
          <textarea
            {...register("specialRequests")}
            rows={3}
            placeholder="Airport transfer, cot, celebration set-up…"
            className={inputClass(!!errors.specialRequests)}
          />
        </Field>

        {/* Honeypot: hidden from people, tempting to bots. */}
        <input
          {...register("company")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <label className="flex items-start gap-3 text-sm text-ink-80">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-brand-600 hover:underline">
              booking terms
            </Link>
            , house rules and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-brand-600 hover:underline">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p className="-mt-2 text-xs text-red-600">{errors.acceptTerms.message}</p>
        ) : null}

        {serverError ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError.message}
            {serverError.unavailable ? (
              <>
                {" "}
                <Link
                  href={`/property/${propertySlug}`}
                  className="font-semibold underline"
                >
                  Pick new dates
                </Link>
              </>
            ) : null}
          </div>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-2 w-full">
          {isSubmitting ? "Sending request…" : "Request to book"}
          {!isSubmitting ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-60">
          <IconLock className="h-3.5 w-3.5" />
          No payment now — the team confirms your stay first, then arranges payment with you.
        </p>
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
