/**
 * Single source of truth for business details shown across the site.
 * Edit the values below — every page reads from here, nothing is hardcoded.
 */

export const site = {
  name: "DRP Holiday Homes",
  parent: "D|R|P",
  parentFull: "Dubai Rapid Properties",
  tagline: "Dubai's curated collection of designed, managed holiday homes.",
  url: "https://drpholidayhomes.ae",

  // Phone and WhatsApp match https://dubairapidproperties.com.
  phoneDisplay: "+971 4 529 4904",
  phoneHref: "tel:+97145294904",
  whatsappNumber: "971 56 777 0272",
  whatsappHref: "https://wa.me/971567770272",
  email: "lettings@dubairapidproperties.com",

  address: {
    line1: "Golden Mile 9",
    line2: "Palm Jumeirah",
    city: "Dubai",
    country: "United Arab Emirates",
    full: "DRP, Golden Mile 9, Palm Jumeirah, Dubai, United Arab Emirates",
  },
  officeHours: [
    { days: "Monday – Friday", hours: "9:00am – 7:00pm" },
    { days: "Saturday", hours: "10:00am – 6:00pm" },
    { days: "Sunday", hours: "Guest support only (24/7 via WhatsApp)" },
  ],
  mapEmbedSrc:
    "https://www.google.com/maps?q=Palm+Jumeirah,+Dubai,+United+Arab+Emirates&output=embed",

  license: "Licensed holiday-home operator · Dubai DET / DTCM",
  /** The DRP car guests can rent: details on the main D|R|P website. Collected from the office. */
  carFleetUrl: "https://new-home-drp6.vercel.app/ecosystem/car-fleet",
  timeZone: "Asia/Dubai",
};

/** Booking rules enforced on both the booking widget and the server. */
export const bookingRules = {
  minNights: 1,
  maxNights: 90,
  /** How far ahead (in days) guests can book. */
  maxAdvanceDays: 365,
  /** AED per night — Dubai Tourism Dirham fee, charged per occupied night. */
  tourismFeePerNight: 20,
  /** Free cancellation if cancelled at least this many days before check-in. */
  freeCancellationDays: 7,
  /** Shown wherever the cancellation policy is summarised. */
  lateCancellationNote: "After that, the first night is non-refundable.",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Stays", href: "/explore" },
  { label: "Why DRP", href: "/#why-drp" },
  { label: "Areas", href: "/#areas" },
  { label: "List Your Property", href: "/owners" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = [
  { label: "Monthly stays", href: "/monthly" },
  { label: "Travel guides", href: "/guides" },
  { label: "Manage my booking", href: "/booking" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Only real, verified profiles belong here. Add Instagram / LinkedIn once the URLs are confirmed. */
export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/dubairapidproperties" },
];

/**
 * The site's public address, for canonical links, the sitemap and email links.
 * Set SITE_URL in production; otherwise the Vercel production domain is used.
 */
export function siteUrl() {
  const fromEnv = process.env.SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return site.url;
}

/** Build a wa.me link pre-filled with a message. */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
