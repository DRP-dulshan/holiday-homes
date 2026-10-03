"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
