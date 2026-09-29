export type Property = {
  id: string;
  slug: string;
  title: string;
  area: string;
  bedrooms: number;
  guests: number;
  pricePerNight: number; // AED
  image: string;
  tag: string;
  blurb: string;
};

/**
 * Sample showcase data for the demo build.
 * Images are royalty-free photographs served via Unsplash.
 */
export const properties: Property[] = [
  {
    id: "p1",
    slug: "palm-signature-villa",
    title: "Signature Beachfront Villa",
    area: "Palm Jumeirah",
    bedrooms: 4,
    guests: 8,
    pricePerNight: 4200,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
    tag: "Private Pool",
    blurb:
      "A serene four-bedroom villa on the Palm's outer crescent with a private pool, direct beach access and interiors styled by the DRP design studio.",
  },
  {
    id: "p2",
    slug: "marina-skyline-residence",
    title: "Skyline Residence",
    area: "Dubai Marina",
    bedrooms: 2,
    guests: 4,
    pricePerNight: 1650,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    tag: "Marina View",
    blurb:
      "Floor-to-ceiling glass framing the yachts and towers of Dubai Marina, with a calm, tonal interior and a wraparound balcony for slow mornings.",
  },
  {
    id: "p3",
    slug: "jbr-sea-view-apartment",
    title: "Sea View Apartment at The Walk",
    area: "JBR",
    bedrooms: 3,
    guests: 6,
    pricePerNight: 2100,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
    tag: "Sea View",
    blurb:
      "Steps from the beach and the buzz of The Walk, this bright three-bedroom home balances family space with a considered, gallery-like finish.",
  },
  {
    id: "p4",
    slug: "downtown-burj-view-loft",
    title: "Burj View Loft",
    area: "Downtown Dubai",
    bedrooms: 1,
    guests: 2,
    pricePerNight: 1450,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
    tag: "Skyline View",
    blurb:
      "A refined one-bedroom loft looking straight onto the Burj Khalifa and the fountains, minutes from Dubai Opera and The Dubai Mall.",
  },
  {
    id: "p5",
    slug: "business-bay-canal-suite",
    title: "Canal-Side Designer Suite",
    area: "Business Bay",
    bedrooms: 2,
    guests: 4,
    pricePerNight: 1550,
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    tag: "Canal View",
    blurb:
      "Warm oak, soft stone and layered lighting in a two-bedroom suite overlooking the Dubai Water Canal promenade.",
  },
  {
    id: "p6",
    slug: "jvc-garden-townhouse",
    title: "Garden Townhouse",
    area: "JVC",
    bedrooms: 3,
    guests: 6,
    pricePerNight: 980,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    tag: "Private Garden",
    blurb:
      "A quiet, leafy three-bedroom townhouse with its own garden and terrace — an easy base for longer family stays away from the crowds.",
  },
];

export const getProperty = (slug: string) =>
  properties.find((p) => p.slug === slug);
