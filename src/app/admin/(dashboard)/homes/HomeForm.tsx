"use client";

import { useActionState, useRef, useState } from "react";
import { areas } from "@/data/areas";
import { AMENITIES, type AmenityId } from "@/data/amenities";
import { propertyTypes, type Property } from "@/data/properties";
import { saveHome, type HomeFormState } from "../../actions";
import { adminInput } from "../../AdminForms";

const amenityIds = Object.keys(AMENITIES) as AmenityId[];

function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-60">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-40">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function HomeForm({ home, mode }: { home?: Property; mode: "create" | "edit" }) {
  const [state, action, pending] = useActionState<HomeFormState, FormData>(saveHome, {});
  const err = state.fieldErrors ?? {};
  const cover = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  /** Uploads photos and drops the first into "cover" if empty, the rest into the gallery. */
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadMsg(null);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadMsg(json.error ?? "Upload failed.");
        break;
      }
      urls.push(json.url);
    }
    setUploading(false);
    if (!urls.length) return;
    if (cover.current && !cover.current.value.trim()) cover.current.value = urls.shift()!;
    if (urls.length && gallery.current) {
      gallery.current.value = [gallery.current.value.trim(), ...urls].filter(Boolean).join("\n");
    }
    setUploadMsg("Uploaded — save the home to publish the photos.");
  };

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="slug" value={home?.slug ?? ""} />

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">The basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Title" error={err.title} className="sm:col-span-2">
            <input name="title" defaultValue={home?.title} className={adminInput} required />
          </Field>
          <Field label="Area" error={err.area}>
            <select name="area" defaultValue={home?.area ?? ""} className={adminInput} required>
              <option value="" disabled>
                Choose…
              </option>
              {areas.map((a) => (
                <option key={a.slug}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Building or community (optional)" error={err.building}>
            <input name="building" defaultValue={home?.building} className={adminInput} />
          </Field>
          <Field label="Type" error={err.type}>
            <select name="type" defaultValue={home?.type ?? "apartment"} className={adminInput}>
              {propertyTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tag on the card" hint='A short highlight, e.g. "Private balcony"' error={err.tag}>
            <input name="tag" defaultValue={home?.tag} maxLength={40} className={adminInput} />
          </Field>
          <Field label="Bedrooms" hint="0 = studio" error={err.bedrooms}>
            <input name="bedrooms" type="number" min={0} max={12} defaultValue={home?.bedrooms ?? 1} className={adminInput} />
          </Field>
          <Field label="Bathrooms" error={err.bathrooms}>
            <input name="bathrooms" type="number" min={1} max={12} defaultValue={home?.bathrooms ?? 1} className={adminInput} />
          </Field>
          <Field label="Sleeps (guests)" error={err.guests}>
            <input name="guests" type="number" min={1} max={30} defaultValue={home?.guests ?? 2} className={adminInput} />
          </Field>
          <Field label="Size, sq ft (optional)" error={err.sizeSqft}>
            <input name="sizeSqft" type="number" min={50} defaultValue={home?.sizeSqft} className={adminInput} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Price and times</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nightly rate (AED)" error={err.pricePerNight}>
            <input name="pricePerNight" type="number" min={50} defaultValue={home?.pricePerNight} className={adminInput} required />
          </Field>
          <Field label="Cleaning fee (AED, one-time)" error={err.cleaningFee}>
            <input name="cleaningFee" type="number" min={0} defaultValue={home?.cleaningFee ?? 0} className={adminInput} />
          </Field>
          <Field label="Check-in from" error={err.checkIn}>
            <input name="checkIn" defaultValue={home?.checkIn ?? "15:00"} placeholder="15:00" className={adminInput} />
          </Field>
          <Field label="Check-out by" error={err.checkOut}>
            <input name="checkOut" defaultValue={home?.checkOut ?? "11:00"} placeholder="11:00" className={adminInput} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Photos</h2>
        <div className="mt-4 grid gap-4">
          <Field
            label="Cover photo address"
            hint="Photos load from dubairapidproperties.com, Cloudinary, Unsplash or an upload below."
            error={err.image}
          >
            <input ref={cover} name="image" defaultValue={home?.image} placeholder="https://…" className={adminInput} required />
          </Field>
          <Field label="More photos (one address per line)" error={err.gallery}>
            <textarea
              ref={gallery}
              name="gallery"
              rows={5}
              defaultValue={(home?.gallery ?? []).filter((u) => u !== home?.image).join("\n")}
              className={`${adminInput} font-mono text-xs`}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn btn-secondary btn-sm cursor-pointer">
              {uploading ? "Uploading…" : "Upload photos"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => upload(e.target.files)}
              />
            </label>
            <span className="text-xs text-ink-60">JPG, PNG or WebP, up to 4 MB each.</span>
            {uploadMsg ? <span className="text-xs text-ink-80">{uploadMsg}</span> : null}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Description</h2>
        <div className="mt-4 grid gap-4">
          <Field label="About this home" error={err.description}>
            <textarea name="description" rows={6} defaultValue={home?.description} className={adminInput} required />
          </Field>
          <Field label="Highlights (one per line)" error={err.highlights}>
            <textarea name="highlights" rows={4} defaultValue={home?.highlights.join("\n")} className={adminInput} />
          </Field>
          <Field label="House rules (one per line)" error={err.houseRules}>
            <textarea name="houseRules" rows={6} defaultValue={home?.houseRules.join("\n")} className={adminInput} />
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-ink-10 bg-canvas p-6 shadow-soft">
        <h2 className="display text-lg font-semibold text-ink">Amenities</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {amenityIds.map((id) => (
            <label key={id} className="flex items-center gap-2.5 text-sm text-ink-80">
              <input
                type="checkbox"
                name="amenities"
                value={id}
                defaultChecked={home?.amenities.includes(id)}
                className="h-4 w-4 rounded border-ink-20"
              />
              {AMENITIES[id].label}
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-ink-10 bg-ink-05/95 px-4 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : mode === "create" ? "Add this home" : "Save changes"}
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-700">{state.ok}</p> : null}
      </div>
    </form>
  );
}
