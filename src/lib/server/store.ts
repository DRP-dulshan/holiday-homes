import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Tiny JSON-file data store. Each collection lives in its own file under
 * DATA_DIR (default `.data/` in the project root). Writes are serialised
 * through a single in-process queue and written atomically (temp file +
 * rename), so concurrent requests can't corrupt a file or double-book.
 *
 * This needs a persistent, writable disk (a VPS, Docker volume, Render /
 * Railway disk…). On serverless hosts with an ephemeral filesystem, swap
 * these four functions for a real database — nothing else needs to change.
 */

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), ".data");

let queue: Promise<unknown> = Promise.resolve();

function fileFor(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

async function readFile<T>(collection: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileFor(collection), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeFile<T>(collection: string, rows: T[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = fileFor(collection);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, target);
}

/** Run `fn` exclusively — no other read-modify-write can interleave. */
function exclusive<R>(fn: () => Promise<R>): Promise<R> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export async function readAll<T>(collection: string): Promise<T[]> {
  // Wait for pending writes so readers never see a half-applied change.
  await queue;
  return readFile<T>(collection);
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
    const rows = await readFile<T>(collection);
    const result = await fn(rows, readFile);
    await writeFile(collection, rows);
    return result;
  });
}

/** Read or create a small text value (e.g. a generated secret). */
export function readOrCreateText(name: string, create: () => string): Promise<string> {
  return exclusive(async () => {
    const file = path.join(DATA_DIR, name);
    try {
      return (await fs.readFile(file, "utf8")).trim();
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      const value = create();
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(file, value, { encoding: "utf8", mode: 0o600 });
      return value;
    }
  });
}
