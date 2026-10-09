import { z } from "zod";
import { areas } from "@/data/areas";
import { AMENITIES, type AmenityId } from "@/data/amenities";
import { propertyTypes } from "@/data/properties";
import { isIsoDate } from "@/lib/dates";

/** Hosts the site's image optimiser is allowed to load photos from (see next.config.ts). */
export const IMAGE_HOSTS = [
  "dubairapidproperties.com",
  "images.unsplash.com",
  "res.cloudinary.com",
  "public.blob.vercel-storage.com",
];

export const imageHostAllowed = (url: string) => {
  try {
    const host = new URL(url).hostname;
    return IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
};

const lines = (v: string) =>
  v
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

const imageUrl = z
  .string()
  .trim()
  .url("Enter a full image address starting with https://")
  .refine((u) => u.startsWith("https://"), "Image addresses must start with https://")
  .refine(imageHostAllowed, "That image host isn't allowed — upload the photo here, or use Cloudinary or Unsplash.");

const amenityIds = Object.keys(AMENITIES) as AmenityId[];
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, e.g. 15:00");

/** The form's fields as submitted (strings), turned into a Property patch. */
export const homeFormSchema = z.object({
  title: z.string().trim().min(5, "Add a title (at least 5 characters)").max(140),
  area: z.string().refine((a) => areas.some((x) => x.name === a), "Choose an area"),
  building: z.string().trim().max(80).optional(),
  type: z.enum(propertyTypes.map((t) => t.value) as [string, ...string[]]),
  bedrooms: z.coerce.number().int().min(0).max(12),
  bathrooms: z.coerce.number().int().min(1).max(12),
  guests: z.coerce.number().int().min(1).max(30),
  sizeSqft: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(50).max(50000).optional()),
  pricePerNight: z.coerce.number().int().min(50, "Nightly rate must be at least AED 50").max(50000),
  cleaningFee: z.coerce.number().int().min(0).max(5000),
  weekendRate: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(50).max(50000).optional(),
  ),
  weeklyDiscountPct: z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().min(0).max(60)),
  monthlyDiscountPct: z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().min(0).max(60)),
  seasons: z.string().transform((v, ctx) => {
    const out: { name?: string; from: string; to: string; rate: number }[] = [];
    for (const line of lines(v)) {
      // "2026-12-20 to 2027-01-05: 1200 New Year"
      const m = line.match(/^(\d{4}-\d{2}-\d{2})\s*(?:to|-|–|→)\s*(\d{4}-\d{2}-\d{2})\s*[:=]\s*(\d+)\s*(.*)$/i);
      if (!m || !isIsoDate(m[1]) || !isIsoDate(m[2]) || m[2] < m[1] || Number(m[3]) < 50) {
        ctx.addIssue({
          code: "custom",
          message: `Couldn't read "${line.slice(0, 50)}" — use: 2026-12-20 to 2027-01-05: 1200 New Year`,
        });
        return z.NEVER;
      }
      out.push({ from: m[1], to: m[2], rate: Number(m[3]), name: m[4].trim() || undefined });
    }
    return out;
  }),
  tag: z.string().trim().max(40),
  image: imageUrl,
  gallery: z.string().transform((v, ctx) => {
    const urls = lines(v);
    for (const u of urls) {
      const r = imageUrl.safeParse(u);
      if (!r.success) {
        ctx.addIssue({ code: "custom", message: `${u.slice(0, 60)} — ${r.error.issues[0].message}` });
        return z.NEVER;
      }
    }
    return urls;
  }),
  amenities: z.array(z.string()).transform((a) => a.filter((x): x is AmenityId => amenityIds.includes(x as AmenityId))),
  highlights: z.string().transform(lines),
  description: z.string().trim().min(40, "Write a description of at least 40 characters").max(4000),
  houseRules: z.string().transform(lines),
  checkIn: time,
  checkOut: time,
});

export type HomeFormValues = z.infer<typeof homeFormSchema>;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
