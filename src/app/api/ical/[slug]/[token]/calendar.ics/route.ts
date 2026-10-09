import { buildIcs } from "@/lib/ical";
import { exportEvents } from "@/lib/server/bookings";
import { getPropertyAnyStatus } from "@/lib/server/catalog";
import { verifyIcalToken } from "@/lib/server/ical";

/**
 * The home's availability as an iCalendar feed, for Airbnb's "Import calendar". The link carries
 * a signed token so it can't be guessed; it contains no guest details.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/ical/[slug]/[token]/calendar.ics">) {
  const { slug, token } = await ctx.params;
  const home = await getPropertyAnyStatus(slug);
  if (!home || !(await verifyIcalToken(slug, token))) {
    return new Response("Not found", { status: 404 });
  }
  const ics = buildIcs(`${home.title} — DRP availability`, await exportEvents(slug));
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendar.ics"',
      "Cache-Control": "no-store",
    },
  });
}
