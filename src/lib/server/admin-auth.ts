import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeEqual, sign, verify } from "./crypto";

const COOKIE = "drp_admin";
const SESSION_DAYS = 7;
const DEV_PASSWORD = "drp-admin";

/**
 * The dashboard password comes from ADMIN_PASSWORD. In development a default
 * is used so the dashboard works out of the box; in production the dashboard
 * stays locked until the variable is set.
 */
export function adminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORD;
}

export const usingDevPassword = () =>
  !process.env.ADMIN_PASSWORD?.trim() && process.env.NODE_ENV !== "production";

// Binding sessions to the password means changing it signs everyone out.
const passwordFingerprint = (pw: string) =>
  createHash("sha256").update(pw).digest("base64url").slice(0, 12);

const payload = (expires: number, pw: string) => `admin:${expires}:${passwordFingerprint(pw)}`;

export async function checkPassword(candidate: string) {
  const pw = adminPassword();
  if (!pw) return false;
  // Compare digests so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(candidate).digest("hex");
  const b = createHash("sha256").update(pw).digest("hex");
  return safeEqual(a, b);
}

export async function startAdminSession() {
  const pw = adminPassword();
  if (!pw) throw new Error("ADMIN_PASSWORD is not set");
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const value = `${expires}.${await sign(payload(expires, pw))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // Read the cookie first: it marks the page as per-request, so an admin
  // page can never be prerendered at build time.
  const raw = (await cookies()).get(COOKIE)?.value;
  const pw = adminPassword();
  if (!pw || !raw) return false;
  const dot = raw.indexOf(".");
  const expires = Number(raw.slice(0, dot));
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return verify(payload(expires, pw), raw.slice(dot + 1));
}

/** Call at the top of every admin page and admin Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
