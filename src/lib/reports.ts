import { addDays } from "./dates";

type BookingLike = {
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  status: string;
  quote: { nights: number; total: number; subtotal: number; promo?: { amount: number }; discount?: number };
  payment?: { status: string; amount?: number; refunded?: number };
};

export type MonthRow = {
  month: string; // YYYY-MM
  bookings: number;
  nights: number;
  revenue: number;
  occupancy: number; // 0–1 across the listed homes
};

export type HomeRow = { slug: string; nights: number; revenue: number; occupancy: number };

export type Report = {
  months: MonthRow[];
  homes: HomeRow[];
  totals: {
    bookings: number;
    nights: number;
    revenue: number;
    avgBooking: number;
    avgNightly: number;
    discounts: number;
    paidOnline: number;
    refunded: number;
  };
};

/** "2026-03" → number of days in that month. */
const daysIn = (month: string) => new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();

/** Every YYYY-MM from `from` to `to` inclusive. */
export function monthsBetween(from: string, to: string) {
  const out: string[] = [];
  let y = +from.slice(0, 4);
  let m = +from.slice(5, 7);
  const endY = +to.slice(0, 4);
  const endM = +to.slice(5, 7);
  while ((y < endY || (y === endY && m <= endM)) && out.length < 36) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

/**
 * Confirmed bookings only. Each booking's revenue (its total) is spread evenly over its nights, and
 * every night counts in the month it falls in, so revenue and occupancy agree.
 */
export function buildReport(
  bookings: BookingLike[],
  listedHomeSlugs: string[],
  from: string,
  to: string,
): Report {
  const months = monthsBetween(from, to);
  const first = `${months[0]}-01`;
  const last = `${months[months.length - 1]}-${String(daysIn(months[months.length - 1])).padStart(2, "0")}`;
  const monthMap = new Map<string, MonthRow>(months.map((m) => [m, { month: m, bookings: 0, nights: 0, revenue: 0, occupancy: 0 }]));
  const homeMap = new Map<string, { nights: number; revenue: number }>();
  const counted = new Set<BookingLike>();
  let discounts = 0;
  let paidOnline = 0;
  let refunded = 0;

  for (const b of bookings) {
    if (b.status !== "confirmed" || b.quote.nights <= 0) continue;
    const perNight = b.quote.total / b.quote.nights;
    let any = false;
    for (let d = b.checkIn; d < b.checkOut; d = addDays(d, 1)) {
      if (d < first || d > last) continue;
      const row = monthMap.get(d.slice(0, 7));
      if (!row) continue;
      row.nights += 1;
      row.revenue += perNight;
      const h = homeMap.get(b.propertySlug) ?? { nights: 0, revenue: 0 };
      h.nights += 1;
      h.revenue += perNight;
      homeMap.set(b.propertySlug, h);
      any = true;
    }
    if (any) {
      counted.add(b);
      const startRow = monthMap.get(b.checkIn.slice(0, 7));
      if (startRow) startRow.bookings += 1;
      discounts += (b.quote.discount ?? 0) + (b.quote.promo?.amount ?? 0);
      if (b.payment?.status === "paid") {
        paidOnline += b.payment.amount ?? b.quote.total;
        refunded += b.payment.refunded ?? 0;
      }
    }
  }

  const homesCount = Math.max(1, listedHomeSlugs.length);
  for (const row of monthMap.values()) {
    row.occupancy = Math.min(1, row.nights / (homesCount * daysIn(row.month)));
    row.revenue = Math.round(row.revenue);
  }
  const totalDays = months.reduce((s, m) => s + daysIn(m), 0);
  const monthRows = [...monthMap.values()];
  const nights = monthRows.reduce((s, r) => s + r.nights, 0);
  const revenue = monthRows.reduce((s, r) => s + r.revenue, 0);
  const bookingCount = counted.size;
  const subtotal = [...counted].reduce((s, b) => s + b.quote.subtotal, 0);

  return {
    months: monthRows,
    homes: [...homeMap.entries()]
      .map(([slug, h]) => ({ slug, nights: h.nights, revenue: Math.round(h.revenue), occupancy: Math.min(1, h.nights / totalDays) }))
      .sort((a, b) => b.revenue - a.revenue),
    totals: {
      bookings: bookingCount,
      nights,
      revenue,
      avgBooking: bookingCount ? Math.round(revenue / bookingCount) : 0,
      avgNightly: nights ? Math.round(subtotal / [...counted].reduce((s, b) => s + b.quote.nights, 0)) : 0,
      discounts,
      paidOnline,
      refunded,
    },
  };
}
