import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/server/admin-auth";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept request bodies up to ~4.5 MB
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** Team-only photo upload to Vercel Blob. Needs BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob). */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Photo upload isn't set up yet. Add a Blob store in Vercel (Storage → Blob) and redeploy." },
      { status: 501 },
    );
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG, WebP or AVIF photo." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is over 4 MB — resize it and try again." }, { status: 413 });
  }
  const ext = file.type.split("/")[1];
  const blob = await put(`homes/photo.${ext}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
