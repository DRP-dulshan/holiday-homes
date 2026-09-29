export type Area = {
  name: string;
  slug: string;
  image: string;
  /** Location-specific alt text for the area card image. */
  alt: string;
  note: string;
  homes: number;
};

/**
 * Area imagery — royalty-free photographs from Unsplash, each verified to show
 * the correct Dubai location (see the crop treatment in AreasWeCover.tsx).
 */
export const areas: Area[] = [
  {
    name: "Palm Jumeirah",
    slug: "palm-jumeirah",
    image:
      "https://images.unsplash.com/photo-1786991810391-e28ee367c3aa?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of Palm Jumeirah in Dubai, showing the palm-shaped island's fronds lined with beachfront villas and the outer crescent",
    note: "Beachfront villas and crescent apartments",
    homes: 14,
  },
  {
    name: "Dubai Marina",
    slug: "dubai-marina",
    image:
      "https://images.unsplash.com/photo-1582120042072-d01e2fc8f3ea?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Marina skyline with yachts moored along the waterfront and the Cayan Tower among the surrounding high-rise towers",
    note: "Waterfront towers and yacht-side living",
    homes: 21,
  },
  {
    name: "JBR",
    slug: "jbr",
    image:
      "https://images.unsplash.com/photo-1721974303220-57d1d812ed2a?auto=format&fit=crop&w=1200&q=80",
    alt: "The wide sandy beach at Jumeirah Beach Residence (JBR) in Dubai, with Bluewaters Island and the Ain Dubai observation wheel across the water",
    note: "The beach, The Walk, everything on foot",
    homes: 12,
  },
  {
    name: "Downtown Dubai",
    slug: "downtown-dubai",
    image:
      "https://images.unsplash.com/photo-1550686164-6f282d49c63c?auto=format&fit=crop&w=1200&q=80",
    alt: "Burj Khalifa lit up at night above the Dubai Fountain in full show, with The Dubai Mall alongside in Downtown Dubai",
    note: "Burj views, culture and the city's centre",
    homes: 18,
  },
  {
    name: "Business Bay",
    slug: "business-bay",
    image:
      "https://images.unsplash.com/photo-1643818738490-19931ee82bc9?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Water Canal at night curving past the Business Bay tower cluster, with the twin-sail pedestrian bridge and Burj Khalifa in the distance",
    note: "Canal promenade, minutes from Downtown",
    homes: 16,
  },
  {
    name: "JVC",
    slug: "jvc",
    image:
      "https://images.unsplash.com/photo-1642715350691-7ffde05661c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of the circular villa community in Jumeirah Village Circle (JVC), Dubai — rows of low-rise townhouses arranged in a ring around a central garden",
    note: "Quiet, green and made for longer stays",
    homes: 9,
  },
];
