import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readOrCreateText } from "./store";

/**
 * Signing secret for booking links and admin sessions. Set APP_SECRET in
 * production; otherwise a random one is generated once and kept in DATA_DIR.
 */
let cached: Promise<string> | null = null;

function getSecret() {
  const fromEnv = process.env.APP_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 16) return Promise.resolve(fromEnv);
  cached ??= readOrCreateText(".secret", () => randomBytes(32).toString("hex")).catch((err) => {
    cached = null; // don't cache a failure — retry on the next request
    throw err;
  });
  return cached;
}

export async function sign(value: string) {
  return createHmac("sha256", await getSecret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function verify(value: string, signature: string | null | undefined) {
  if (!signature) return false;
  return safeEqual(await sign(value), signature);
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly reference like "DRP-7K3Q9X" (no 0/O/1/I ambiguity). */
export function newReference(prefix = "DRP") {
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `${prefix}-${out}`;
}

export function newId() {
  return randomBytes(9).toString("base64url");
}
