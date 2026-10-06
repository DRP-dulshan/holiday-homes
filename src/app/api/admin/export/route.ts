import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/admin-auth";
import { listBookings } from "@/lib/server/bookings";
import { describeCar } from "@/lib/booking-schema";
import { listEnquiries } from "@/lib/server/enquiries";

function toCsv(rows: (string | number | undefined)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          let s = cell === undefined ? "" : String(cell);
          // Neutralise spreadsheet formula injection.
          if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\r\n");
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type");
  let csv: string;

  if (type === "enquiries") {
    const rows = await listEnquiries();
    csv = toCsv([
      ["Received", "Status", "Type", "Name", "Email", "Phone", "Property", "Source", "Message"],
      ...rows.map((e) => [
        e.createdAt,
        e.status,
        e.enquiryType,
        e.name,
        e.email,
        e.phone,
        e.propertySlug,
        e.source,
        e.message,
      ]),
    ]);
  } else {
    const rows = await listBookings();
    csv = toCsv([
      [
        "Reference", "Status", "Created", "Property", "Area", "Check-in", "Check-out",
        "Nights", "Guests", "Guest name", "Email", "Phone", "Country", "Total (AED)",
        "Arrival time", "Requests", "Rental car",
      ],
      ...rows.map((b) => [
        b.ref, b.status, b.createdAt, b.propertyTitle, b.area, b.checkIn, b.checkOut,
        b.quote.nights, b.guests, b.guest.name, b.guest.email, b.guest.phone, b.guest.country,
        b.quote.total, b.arrivalTime, b.specialRequests, b.car ? describeCar(b.car) : "",
      ]),
    ]);
  }

  const name = `${type === "enquiries" ? "enquiries" : "bookings"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
