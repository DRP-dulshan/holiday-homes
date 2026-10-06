import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Tiny collection store with two backends:
 *
 * - **Redis (Upstash REST)** — used when KV_REST_API_URL + KV_REST_API_TOKEN
 *   (set by Vercel's Upstash integration) or UPSTASH_REDIS_REST_URL +
 *   UPSTASH_REDIS_REST_TOKEN are present. Works on serverless hosts such as
 *   Vercel, where the filesystem is read-only.
 * - **JSON files** under DATA_DIR (default `.data/`) — for local development
 *   and servers with a persistent disk.
 *
 * Every read-modify-write runs under a lock (in-process queue, plus a Redis
 * lock across instances), so concurrent requests can't double-book.
 */

const REDIS_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)?.replace(
  /\/$/,
  "",
);
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY_PREFIX = process.env.STORE_PREFIX || "drp";

export const storageBackend: "redis" | "file" = REDIS_URL && REDIS_TOKEN ? "redis" : "file";

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");

export class StorageNotConfiguredError extends Error {}

/* ------------------------------------------------------------------ */
/* Redis (Upstash REST API)                                            */
/* ------------------------------------------------------------------ */

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || json.error) {
    throw new Error(`Redis ${command[0]} failed: ${json.error ?? res.status}`);
  }
  return json.result as T;
}

const key = (name: string) => `${KEY_PREFIX}:${name}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Cross-instance lock so two serverless functions can't interleave writes. */
async function withRedisLock<R>(fn: () => Promise<R>): Promise<R> {
  const lockKey = key("lock");
  const token = randomUUID();
  const deadline = Date.now() + 10_000;
  while ((await redis(["SET", lockKey, token, "NX", "PX", 10_000])) !== "OK") {
    if (Date.now() > deadline) throw new Error("Storage is busy — please try again.");
    await sleep(80 + Math.random() * 120);
  }
  try {
    return await fn();
  } finally {
    if ((await redis<string | null>(["GET", lockKey])) === token) await redis(["DEL", lockKey]);
  }
}

/* ------------------------------------------------------------------ */
/* Files                                                               */
/* ------------------------------------------------------------------ */

function fileFor(name: string) {
  return path.join(DATA_DIR, name);
}

function assertWritableHost() {
  // Vercel and similar hosts have a read-only, per-instance filesystem.
  if (process.env.VERCEL) {
    throw new StorageNotConfiguredError(
      "No database configured. On Vercel, connect Upstash Redis (Storage → Upstash for Redis) " +
        "so KV_REST_API_URL and KV_REST_API_TOKEN are set, then redeploy.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Backend-neutral primitives                                          */
/* ------------------------------------------------------------------ */

async function readRaw<T>(collection: string): Promise<T[]> {
  let raw: string | null;
  if (storageBackend === "redis") {
    raw = await redis<string | null>(["GET", key(collection)]);
  } else {
    try {
      raw = await fs.readFile(fileFor(`${collection}.json`), "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      raw = null;
    }
  }
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

async function writeRaw<T>(collection: string, rows: T[]) {
  const json = JSON.stringify(rows);
  if (storageBackend === "redis") {
    await redis(["SET", key(collection), json]);
    return;
  }
  assertWritableHost();
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = fileFor(`${collection}.json`);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, target);
}

let queue: Promise<unknown> = Promise.resolve();

/** Run `fn` exclusively — no other read-modify-write can interleave. */
function exclusive<R>(fn: () => Promise<R>): Promise<R> {
  const guarded = storageBackend === "redis" ? () => withRedisLock(fn) : fn;
  const run = queue.then(guarded, guarded);
  queue = run.catch(() => undefined);
  return run;
}

export async function readAll<T>(collection: string): Promise<T[]> {
  // Wait for this instance's pending writes so readers never see a half-applied change.
  await queue;
  return readRaw<T>(collection);
}

/** Reads another collection from inside a `mutate` callback. */
export type TxRead = <U>(collection: string) => Promise<U[]>;

/**
 * Atomically read a collection, let `fn` mutate it, and write it back.
 * Whatever `fn` returns is passed through; throw inside `fn` to abort.
 * Use the `read` argument (not `readAll`) to consult other collections.
 */
export function mutate<T, R>(
  collection: string,
  fn: (rows: T[], read: TxRead) => R | Promise<R>,
): Promise<R> {
  return exclusive(async () => {
    const rows = await readRaw<T>(collection);
    const result = await fn(rows, readRaw);
    await writeRaw(collection, rows);
    return result;
  });
}

/** Read or create a small text value (e.g. a generated secret). */
export async function readOrCreateText(name: string, create: () => string): Promise<string> {
  if (storageBackend === "redis") {
    await redis(["SET", key(`text:${name}`), create(), "NX"]);
    return (await redis<string>(["GET", key(`text:${name}`)])).trim();
  }
  return exclusive(async () => {
    const file = fileFor(name);
    try {
      return (await fs.readFile(file, "utf8")).trim();
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      assertWritableHost();
      const value = create();
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(file, value, { encoding: "utf8", mode: 0o600 });
      return value;
    }
  });
}
