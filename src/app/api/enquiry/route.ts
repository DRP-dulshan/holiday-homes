import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // TODO: connect this to the real destination before launch — e.g. forward
  // to the CRM (HubSpot / Pipedrive) and/or send a transactional email via
  // the provider of choice. For this demo build the enquiry is only logged.
  console.log("[enquiry] received:", parsed.data);

  return NextResponse.json({ ok: true });
}
