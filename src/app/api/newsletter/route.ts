import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { subscribe } from "@/lib/server/newsletter";

const schema = z.object({
  email: z.string().trim().min(1).email().max(200),
  company: z.string().max(0).optional(), // honeypot
});

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request.headers)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts — please try again shortly." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  if (body && typeof body === "object" && "company" in body && body.company) return NextResponse.json({ ok: true });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  try {
    await subscribe(parsed.data.email);
    // The same answer whether or not the address was already on the list.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] failed:", err);
    return NextResponse.json({ ok: false, error: "We couldn't sign you up just now — please try again." }, { status: 503 });
  }
}
