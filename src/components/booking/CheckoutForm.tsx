"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  describeCar,
  describeExtras,
  EXTRAS,
  guestDetailsSchema,
  type GuestDetailsInput,
} from "@/lib/booking-schema";
import { site, whatsappLink } from "@/config/site";
import { track } from "@/lib/track";
import { IconArrowRight, IconCar, IconLock, IconWhatsApp } from "../icons";

type Props = {
  propertySlug: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Pay on Stripe Checkout now, instead of sending a request for the team to confirm. */
  payOnline: boolean;
  /** Amount due, for the button label. */
  totalLabel: string;
  /** A promo code the guest applied; the server checks it again. */
  promoCode?: string;
};

export function CheckoutForm({
  propertySlug,
  propertyTitle,
  checkIn,
  checkOut,
  guests,
  payOnline,
  totalLabel,
  promoCode,
}: Props) {
  const router = useRouter();
  // Stays true while the browser leaves for Stripe, so the button can't be pressed twice.
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState<{
    message: string;
    unavailable: boolean;
    /** WhatsApp link carrying the whole request, when saving online failed. */
    fallback?: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestDetailsInput>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: { needCar: false, extras: [] },
  });

  // Everything the team needs, so a request can still reach them if the site can't save it.
  const whatsappFallback = (d: GuestDetailsInput) =>
    whatsappLink(
      [
        `Hi DRP, I'd like to book ${propertyTitle}.`,
        `Dates: ${checkIn} to ${checkOut} · Guests: ${guests}`,
        `Name: ${d.name} · Email: ${d.email} · Phone: ${d.phone}`,
        d.arrivalTime ? `Arrival: ${d.arrivalTime}` : "",
        d.extras?.length ? `Extras: ${describeExtras(d.extras)}` : "",
        d.needCar ? `Rental car: ${describeCar({ pickup: "office" })}` : "",
        d.specialRequests ? `Requests: ${d.specialRequests}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

  const onSubmit = async (data: GuestDetailsInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, propertySlug, checkIn, checkOut, guests, promoCode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const serverSide = res.status >= 500;
        setServerError({
          message:
            json.code === "payment"
              ? `${json.error} You can also book on WhatsApp.`
              : serverSide
                ? "We couldn't save your request online right now — send it to us on WhatsApp instead and the team will confirm it there."
                : (json.error ?? "Something went wrong — please try again."),
          unavailable: json.code === "unavailable",
          fallback: serverSide ? whatsappFallback(data) : undefined,
        });
        return;
      }
      track("begin_checkout", { currency: "AED", value: Number(totalLabel.replace(/[^\d.]/g, "")) || undefined });
      if (json.checkoutUrl) {
        setRedirecting(true);
        window.location.assign(json.checkoutUrl);
        return;
      }
      router.push(`${json.url}&new=1`);
    } catch {
      setServerError({
        message: "We couldn't reach the server — check your connection, or send your request on WhatsApp.",
        unavailable: false,
        fallback: whatsappFallback(data),
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

        <fieldset className="rounded-2xl border border-ink-10 bg-ink-05 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register("needCar")}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <IconCar className="h-4 w-4 text-brand-600" />
                I&rsquo;d like to rent the DRP car
              </span>
              <span className="mt-0.5 block text-xs text-ink-60">
                Our own SUV, available to DRP guests during their stay. We&rsquo;ll confirm
                availability and the rate with you{payOnline ? "; the car is paid separately." : " — nothing is charged now."}{" "}
                <a
                  href={site.carFleetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-600 hover:underline"
                >
                  See the car
                </a>
              </span>
            </span>
          </label>
        </fieldset>

        <fieldset className="rounded-2xl border border-ink-10 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-60">
            Anything else? (optional)
          </legend>
          <p className="text-xs text-ink-60">
            Tick what you&rsquo;d like and the team will confirm availability and the price with you. Nothing is charged for these now.
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {EXTRAS.map((x) => (
              <label key={x.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-80">
                <input
                  type="checkbox"
                  value={x.id}
                  {...register("extras")}
                  className="h-4 w-4 shrink-0 accent-[var(--color-brand)]"
                />
                {x.label}
              </label>
            ))}
          </div>
        </fieldset>

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
            {serverError.fallback ? (
              <a
                href={serverError.fallback}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm mt-3 w-full"
              >
                <IconWhatsApp className="h-4 w-4" />
                Send my request on WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || redirecting}
          className="btn btn-primary mt-2 w-full"
        >
          {payOnline
            ? isSubmitting || redirecting
              ? "Opening secure payment…"
              : `Book now · ${totalLabel}`
            : isSubmitting
              ? "Booking…"
              : "Book now"}
          {!isSubmitting && !redirecting ? <IconArrowRight className="h-4 w-4" /> : null}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-60">
          <IconLock className="h-3.5 w-3.5 shrink-0" />
          {payOnline
            ? "Secure card payment by Stripe. Your dates are held for 30 minutes while you pay, and your stay is confirmed as soon as payment goes through."
            : "No payment now — the team confirms your stay first, then arranges payment with you."}
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
