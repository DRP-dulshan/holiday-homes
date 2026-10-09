import { NextResponse } from "next/server";
import { getProperties } from "@/lib/server/catalog";

/** Public details of listed homes by slug (`?slugs=a,b,c`), for the saved-homes page. */
export async function GET(request: Request) {
  const slugs = (new URL(request.url).searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
  if (!slugs.length) return NextResponse.json({ homes: [] });
  const homes = (await getProperties()).filter((p) => slugs.includes(p.slug));
  // Keep the order the visitor saved them in.
  homes.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  return NextResponse.json({ homes }, { headers: { "Cache-Control": "no-store" } });
}
