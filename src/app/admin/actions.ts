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
  setBookingStatus,
  type BookingStatus,
} from "@/lib/server/bookings";
import { deleteEnquiry, setEnquiryStatus } from "@/lib/server/enquiries";
import {
  deleteCustomProperty,
  getAllProperties,
  resetToImported,
  saveProperty,
} from "@/lib/server/catalog";
import { homeFormSchema, slugify } from "@/lib/home-schema";
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
