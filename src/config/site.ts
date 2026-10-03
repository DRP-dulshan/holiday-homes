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

  // TODO: confirm the live phone number before launch — placeholder for the demo.
  phoneDisplay: "+971 4 529 4904",
  phoneHref: "tel:+97145294904",
  // TODO: confirm the live WhatsApp number before launch — placeholder for the demo.
  whatsappNumber: "971 56 777 0272",
  whatsappHref: "https://wa.me/971567770272",
  // TODO: confirm the live inbox before launch — placeholder for the demo.
  email: "stay@drpholidayhomes.ae",
  ownersEmail: "owners@drpholidayhomes.ae",

  address: {
    line1: "Golden Mile 9",
    line2: "Palm Jumeirah",
    city: "Dubai",
    country: "United Arab Emirates",
    full: "Golden Mile 9, Palm Jumeirah, Dubai, United Arab Emirates",
  },
  officeHours: [
    { days: "Monday – Friday", hours: "9:00am – 7:00pm" },
    { days: "Saturday", hours: "10:00am – 6:00pm" },
    { days: "Sunday", hours: "Guest support only (24/7 via WhatsApp)" },
  ],
  mapEmbedSrc:
    "https://www.google.com/maps?q=Palm+Jumeirah,+Dubai,+United+Arab+Emirates&output=embed",

  license: "Licensed holiday-home operator · Dubai DET / DTCM",
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

export const socialLinks = [
  // TODO: link real profiles before launch — placeholders for the demo.
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

/** Build a wa.me link pre-filled with a message. */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
