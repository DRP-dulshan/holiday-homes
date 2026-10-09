import { NextResponse } from "next/server";
import { getAllProperties } from "@/lib/server/catalog";
import { syncStale } from "@/lib/server/ical";
import { safeEqual } from "@/lib/server/crypto";

/**
 * Refreshes every home's Airbnb calendar. Vercel Cron calls it daily (vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`; a free external pinger (e.g. cron-job.org) can call it
 * every 15 minutes with the same header or `?key=`. Visitors' requests also refresh stale calendars.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  const given =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("key") ??
    "";
  if (!safeEqual(given, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homes = (await getAllProperties()).filter((h) => h.airbnbIcalUrl);
  await syncStale(homes, 0, 8000);
  return NextResponse.json({ ok: true, synced: homes.length });
}
