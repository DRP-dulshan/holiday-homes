import { NextResponse } from "next/server";
import { getProperty } from "@/data/properties";
import { getUnavailableRanges } from "@/lib/server/bookings";

export async function GET(_request: Request, ctx: RouteContext<"/api/properties/[slug]/availability">) {
  const { slug } = await ctx.params;
  if (!getProperty(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const unavailable = await getUnavailableRanges(slug);
  return NextResponse.json(
    { slug, unavailable },
    { headers: { "Cache-Control": "no-store" } },
  );
}
