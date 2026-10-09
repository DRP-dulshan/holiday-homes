"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import {
  checkPassword,
  endAdminSession,
  requireAdmin,
  startAdminSession,
} from "@/lib/server/admin-auth";
import {
  addBlock,
  BookingError,
  removeBlock,
  createAdminBooking,
  refundBooking,
  setBookingStatus,
  type BookingStatus,
} from "@/lib/server/bookings";
import { deleteEnquiry, setEnquiryStatus } from "@/lib/server/enquiries";
import { syncCalendar } from "@/lib/server/ical";
import {
  deleteCustomProperty,
  getAllProperties,
  getPropertyAnyStatus,
  resetToImported,
  saveProperty,
} from "@/lib/server/catalog";
import { homeFormSchema, slugify } from "@/lib/home-schema";
import { createPromo, deletePromo, normalizeCode, setPromoActive } from "@/lib/server/promos";
import { isIsoDate } from "@/lib/dates";
import { bookingRequestSchema } from "@/lib/booking-schema";
import { deleteReview, replyToReview, setReviewStatus, type ReviewStatus } from "@/lib/server/reviews";
import type { Property } from "@/data/properties";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export type FormState = { error?: string; ok?: string };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, 8, 15 * 60_000)) {
    return { error: "Too many attempts — try again in 15 minutes." };
  }
  if (!(await checkPassword(String(formData.get("password") ?? "")))) {
    return { error: "Incorrect password." };
  }
  await startAdminSession();
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

export async function updateBookingStatus(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const ref = String(formData.get("ref") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!STATUSES.includes(status)) return { error: "Unknown status." };
  try {
    await setBookingStatus(ref, status, "admin", note);
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin", "layout");
  return { ok: `Booking ${ref} marked ${status}.` };
}

export async function createBlock(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    await addBlock({
      propertySlug: String(formData.get("propertySlug") ?? ""),
      start: String(formData.get("start") ?? ""),
      end: String(formData.get("end") ?? ""),
      reason: String(formData.get("reason") ?? "").slice(0, 200),
    });
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin", "layout");
  return { ok: "Dates blocked." };
}

export async function deleteBlock(formData: FormData) {
  await requireAdmin();
  await removeBlock(String(formData.get("id") ?? ""));
  revalidatePath("/admin", "layout");
}

export async function updateEnquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  if (intent === "delete") await deleteEnquiry(id);
  else await setEnquiryStatus(id, intent === "reopen" ? "new" : "handled");
  revalidatePath("/admin", "layout");
}

/* ------------------------------------------------------------------ */
/* Homes                                                               */
/* ------------------------------------------------------------------ */

export type HomeFormState = FormState & { fieldErrors?: Record<string, string>; slug?: string };

const refreshSite = () => {
  revalidatePath("/", "layout");
};

/** Creates (mode=create) or updates (mode=edit) a home from the admin form. */
export async function saveHome(_prev: HomeFormState, formData: FormData): Promise<HomeFormState> {
  await requireAdmin();
  const mode = String(formData.get("mode") ?? "edit");
  const existingSlug = String(formData.get("slug") ?? "");

  const parsed = homeFormSchema.safeParse({
    title: formData.get("title") ?? "",
    area: formData.get("area") ?? "",
    building: String(formData.get("building") ?? "") || undefined,
    type: formData.get("type") ?? "",
    bedrooms: formData.get("bedrooms") ?? "",
    bathrooms: formData.get("bathrooms") ?? "",
    guests: formData.get("guests") ?? "",
    sizeSqft: formData.get("sizeSqft") ?? "",
    pricePerNight: formData.get("pricePerNight") ?? "",
    cleaningFee: formData.get("cleaningFee") ?? "0",
    weekendRate: formData.get("weekendRate") ?? "",
    weeklyDiscountPct: formData.get("weeklyDiscountPct") ?? "",
    monthlyDiscountPct: formData.get("monthlyDiscountPct") ?? "",
    seasons: String(formData.get("seasons") ?? ""),
    airbnbIcalUrl: String(formData.get("airbnbIcalUrl") ?? ""),
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
    mapsUrl: String(formData.get("mapsUrl") ?? ""),
    tag: formData.get("tag") ?? "",
    image: formData.get("image") ?? "",
    gallery: String(formData.get("gallery") ?? ""),
    amenities: formData.getAll("amenities").map(String),
    highlights: String(formData.get("highlights") ?? ""),
    description: formData.get("description") ?? "",
    houseRules: String(formData.get("houseRules") ?? ""),
    checkIn: formData.get("checkIn") ?? "",
    checkOut: formData.get("checkOut") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;
  const values: Partial<Property> = {
    title: d.title,
    area: d.area,
    building: d.building,
    type: d.type as Property["type"],
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    guests: d.guests,
    sizeSqft: d.sizeSqft,
    pricePerNight: d.pricePerNight,
    cleaningFee: d.cleaningFee,
    pricing: {
      weekendRate: d.weekendRate,
      weeklyDiscountPct: d.weeklyDiscountPct || undefined,
      monthlyDiscountPct: d.monthlyDiscountPct || undefined,
      seasons: d.seasons.length ? d.seasons : undefined,
    },
    airbnbIcalUrl: d.airbnbIcalUrl || undefined,
    lat: d.lat,
    lng: d.lng,
    mapsUrl: d.mapsUrl || undefined,
    tag: d.tag,
    image: d.image,
    // The cover photo always leads the gallery.
    gallery: [d.image, ...d.gallery.filter((u) => u !== d.image)],
    amenities: d.amenities,
    highlights: d.highlights,
    description: d.description,
    houseRules: d.houseRules,
    checkIn: d.checkIn,
    checkOut: d.checkOut,
  };

  try {
    if (mode === "create") {
      const slug = slugify(d.title);
      if (!slug) return { error: "That title can't be turned into a web address.", fieldErrors: { title: "Use letters or numbers" } };
      await saveProperty(slug, { ...values, id: slug } as Partial<Property>, true);
      refreshSite();
      redirect(`/admin/homes/${slug}?created=1`);
    }
    await saveProperty(existingSlug, values);
    // Pull the Airbnb calendar straight away when its link was added or changed.
    const before = (await getPropertyAnyStatus(existingSlug))?.airbnbIcalUrl;
    if (d.airbnbIcalUrl && d.airbnbIcalUrl !== before) await syncCalendar(existingSlug, d.airbnbIcalUrl);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: err instanceof Error ? err.message : "Couldn't save that home." };
  }
  refreshSite();
  return { ok: "Saved. The website updates within a few seconds.", slug: existingSlug };
}

/** Lists or unlists a home. Unlisted homes disappear from the site but keep their bookings. */
export async function setHomeListed(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const listed = formData.get("listed") === "1";
  if (!(await getAllProperties()).some((p) => p.slug === slug)) return;
  await saveProperty(slug, { hidden: listed ? undefined : true });
  refreshSite();
}

/** Deletes a home added in the admin, or restores a built-in home's imported details. */
export async function removeHome(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const home = (await getAllProperties()).find((p) => p.slug === slug);
  if (!home) return;
  if (home.custom) await deleteCustomProperty(slug);
  else await resetToImported(slug);
  refreshSite();
  redirect("/admin/homes");
}

/* ------------------------------------------------------------------ */
/* Promo codes                                                         */
/* ------------------------------------------------------------------ */

export async function addPromo(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const type = formData.get("type") === "fixed" ? "fixed" : "percent";
  const value = Number(formData.get("value"));
  const optionalDate = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v ? (isIsoDate(v) ? v : null) : undefined;
  };
  const validUntil = optionalDate("validUntil");
  const stayFrom = optionalDate("stayFrom");
  const stayTo = optionalDate("stayTo");
  const int = (k: string) => {
    const n = Number(formData.get(k));
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };
  if (code.length < 3) return { error: "The code needs at least 3 letters or numbers." };
  if (!Number.isFinite(value) || value <= 0) return { error: "Enter how much the code takes off." };
  if (type === "percent" && value > 90) return { error: "A percentage code can take off at most 90%." };
  if (validUntil === null || stayFrom === null || stayTo === null) return { error: "Check the dates." };
  const slugs = formData.getAll("propertySlugs").map(String).filter(Boolean);
  try {
    await createPromo({
      code,
      type,
      value: Math.round(value),
      validUntil,
      stayFrom,
      stayTo,
      minNights: int("minNights"),
      maxUses: int("maxUses"),
      propertySlugs: slugs.length ? slugs : undefined,
      note: String(formData.get("note") ?? "").trim().slice(0, 200) || undefined,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save that code." };
  }
  revalidatePath("/admin/promos");
  return { ok: `Code ${code} created.` };
}

export async function togglePromo(formData: FormData) {
  await requireAdmin();
  await setPromoActive(String(formData.get("id") ?? ""), formData.get("active") === "1");
  revalidatePath("/admin/promos");
}

export async function removePromo(formData: FormData) {
  await requireAdmin();
  await deletePromo(String(formData.get("id") ?? ""));
  revalidatePath("/admin/promos");
}

/** "Sync now" on a home's Airbnb calendar. */
export async function syncHomeCalendar(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const home = await getPropertyAnyStatus(slug);
  if (home?.airbnbIcalUrl) await syncCalendar(slug, home.airbnbIcalUrl);
  revalidatePath(`/admin/homes/${slug}`);
  revalidatePath("/admin/availability");
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ReviewStatus;
  if (["pending", "approved", "hidden"].includes(status)) await setReviewStatus(id, status);
  revalidatePath("/", "layout");
}

export async function answerReview(formData: FormData) {
  await requireAdmin();
  await replyToReview(String(formData.get("id") ?? ""), String(formData.get("reply") ?? ""));
  revalidatePath("/", "layout");
}

export async function removeReview(formData: FormData) {
  await requireAdmin();
  await deleteReview(String(formData.get("id") ?? ""));
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

export async function issueRefund(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const ref = String(formData.get("ref") ?? "");
  const amount = Number(formData.get("amount"));
  try {
    await refundBooking(ref, amount);
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin", "layout");
  return { ok: `Refunded AED ${amount}.` };
}

/* ------------------------------------------------------------------ */
/* Bookings entered by the team                                        */
/* ------------------------------------------------------------------ */

export type NewBookingState = FormState & { fieldErrors?: Record<string, string> };

export async function addManualBooking(_prev: NewBookingState, formData: FormData): Promise<NewBookingState> {
  await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "").trim();
  const parsed = bookingRequestSchema.safeParse({
    propertySlug: text("propertySlug"),
    checkIn: text("checkIn"),
    checkOut: text("checkOut"),
    guests: text("guests"),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    country: text("country") || undefined,
    specialRequests: text("specialRequests") || undefined,
    promoCode: text("promoCode") || undefined,
    acceptTerms: true,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const status = formData.get("status") === "confirmed" ? "confirmed" : "pending";
  let ref: string;
  try {
    ref = (await createAdminBooking(parsed.data, status)).ref;
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/bookings?q=${ref}`);
}
