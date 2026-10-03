import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";
import { createEnquiry } from "@/lib/server/enquiries";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`enquiry:${clientIp(request.headers)}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages — please try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Honeypot filled in: pretend it worked so bots don't retry.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  try {
    await createEnquiry(parsed.data);
  } catch (err) {
    console.error("[enquiry] failed to save:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send that right now — please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
