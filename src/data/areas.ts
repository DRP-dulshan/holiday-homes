export type Area = {
  name: string;
  slug: string;
  image: string;
  /** Location-specific alt text for the area card image. */
  alt: string;
  note: string;
  homes: number;
  /** Longer guide copy for the area's own page: what it's known for, who it suits. */
  guide: string;
  bestFor: string;
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
    guide:
      "Palm Jumeirah is Dubai's original statement address — a man-made island shaped like a palm tree, its fronds lined with private beachfront villas and its crescent home to resort hotels and sea-view apartments. Every DRP home here comes with direct beach access, and most with a private pool.",
    bestFor: "Couples and families who want a beach holiday without leaving the city",
  },
  {
    name: "Dubai Marina",
    slug: "dubai-marina",
    image:
      "https://images.unsplash.com/photo-1582120042072-d01e2fc8f3ea?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Marina skyline with yachts moored along the waterfront and the Cayan Tower among the surrounding high-rise towers",
    note: "Waterfront towers and yacht-side living",
    homes: 21,
    guide:
      "Dubai Marina is the city's densest stretch of waterfront living — a canal lined with high-rise towers, restaurants and a promenade that never really closes. It's the most connected of DRP's neighbourhoods, with the tram, metro and a marina full of yachts all on the doorstep.",
    bestFor: "Guests who want restaurants, nightlife and the marina walk within reach",
  },
  {
    name: "JBR",
    slug: "jbr",
    image:
      "https://images.unsplash.com/photo-1721974303220-57d1d812ed2a?auto=format&fit=crop&w=1200&q=80",
    alt: "The wide sandy beach at Jumeirah Beach Residence (JBR) in Dubai, with Bluewaters Island and the Ain Dubai observation wheel across the water",
    note: "The beach, The Walk, everything on foot",
    homes: 12,
    guide:
      "JBR (Jumeirah Beach Residence) is built around one long stretch of open beach and The Walk — a promenade of cafés, shops and beach clubs that runs the length of the towers. It's the most walkable of DRP's beach addresses, with Bluewaters Island and Ain Dubai just across the water.",
    bestFor: "Beach-first travellers and families who'd rather walk than drive",
  },
  {
    name: "Downtown Dubai",
    slug: "downtown-dubai",
    image:
      "https://images.unsplash.com/photo-1550686164-6f282d49c63c?auto=format&fit=crop&w=1200&q=80",
    alt: "Burj Khalifa lit up at night above the Dubai Fountain in full show, with The Dubai Mall alongside in Downtown Dubai",
    note: "Burj views, culture and the city's centre",
    homes: 18,
    guide:
      "Downtown Dubai is the postcard: the Burj Khalifa, the Dubai Fountain and The Dubai Mall all within walking distance. It's the address most first-time visitors picture, and the easiest base for Dubai Opera, fine dining and the city's biggest shopping in one compact district.",
    bestFor: "First-time visitors and anyone who wants the view to match the stay",
  },
  {
    name: "Business Bay",
    slug: "business-bay",
    image:
      "https://images.unsplash.com/photo-1643818738490-19931ee82bc9?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Water Canal at night curving past the Business Bay tower cluster, with the twin-sail pedestrian bridge and Burj Khalifa in the distance",
    note: "Canal promenade, minutes from Downtown",
    homes: 16,
    guide:
      "Business Bay sits along the Dubai Water Canal, a short drive or water-taxi ride from Downtown and DIFC. It trades some of Downtown's density for a calmer canal-side promenade, and suits guests who want to be close to the centre without paying its premium.",
    bestFor: "Business trips and longer stays close to Downtown, at a calmer pace",
  },
  {
    name: "JVC",
    slug: "jvc",
    image:
      "https://images.unsplash.com/photo-1642715350691-7ffde05661c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of the circular villa community in Jumeirah Village Circle (JVC), Dubai — rows of low-rise townhouses arranged in a ring around a central garden",
    note: "Quiet, green and made for longer stays",
    homes: 9,
    guide:
      "Jumeirah Village Circle trades skyline for space — low-rise townhouses and villas arranged around green, quiet streets, a 15–20 minute drive from the coast and Downtown. It's DRP's pick for families and longer stays who want a private garden and a slower pace over a view.",
    bestFor: "Longer family stays and guests who'd rather have room to spread out",
  },
];
