import { properties } from "./properties";

export type Area = {
  name: string;
  slug: string;
  image: string;
  /** Location-specific alt text for the area card image. */
  alt: string;
  /** CSS object-position for the photo when it is cropped to a banner or card. */
  imagePosition?: string;
  note: string;
  /** Longer guide copy for the area's own page: what it's known for, who it suits. */
  guide: string;
  bestFor: string;
};

/**
 * Every neighbourhood DRP covers. Palm Jumeirah, Dubai Marina, Business Bay,
 * JVC and Downtown use Unsplash photographs verified to show the location;
 * the others use photos from DRP's own listings in that community.
 * Downtown has no published home yet, so its card says "Coming soon".
 */
export const areas: Area[] = [
  {
    name: "Palm Jumeirah",
    slug: "palm-jumeirah",
    image:
      "https://images.unsplash.com/photo-1786991810391-e28ee367c3aa?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of Palm Jumeirah in Dubai, showing the palm-shaped island's fronds and the outer crescent",
    note: "St. Regis, Seven Palm and Shoreline residences",
    guide:
      "Palm Jumeirah is Dubai's original statement address — a man-made island shaped like a palm tree, ringed by beaches and resort hotels. DRP's homes here range from studios high in the St. Regis Palm Tower to a three-bedroom Shoreline apartment, most a short walk from West Beach and Nakheel Mall.",
    bestFor: "Couples and families who want a beach holiday without leaving the city",
  },
  {
    name: "Dubai Marina",
    slug: "dubai-marina",
    image:
      "https://images.unsplash.com/photo-1582120042072-d01e2fc8f3ea?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Marina skyline with yachts moored along the waterfront and the Cayan Tower among the surrounding high-rise towers",
    note: "Marina views, steps from JBR Beach",
    guide:
      "Dubai Marina is the city's densest stretch of waterfront living — a canal lined with high-rise towers, restaurants and a promenade that never really closes. DRP's Marina homes in Sparkle Towers and Zumurud Tower are steps from Marina Walk, the tram and JBR Beach.",
    bestFor: "Guests who want the beach, restaurants and nightlife within walking distance",
  },
  {
    name: "JVT",
    slug: "jvt",
    image:
      "https://dubairapidproperties.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-18-at-9.15.56-PM-3.jpeg",
    alt: "Rooftop sports court and lawn at Cloud Towers in Jumeirah Village Triangle (JVT), Dubai",
    note: "Calm, green and well connected",
    guide:
      "Jumeirah Village Triangle is a quiet residential community of low-rise streets and open green spaces, around 10 minutes from Dubai Marina and 15 from Palm Jumeirah. DRP's JVT homes are in Cloud Towers, with a large pool, gym, sauna, steam room and BBQ area on site.",
    bestFor: "Longer stays and guests who prefer a calm base with resort-style facilities",
  },
  {
    name: "Business Bay",
    slug: "business-bay",
    image:
      "https://images.unsplash.com/photo-1643818738490-19931ee82bc9?auto=format&fit=crop&w=1200&q=80",
    alt: "The Dubai Water Canal at night curving past the Business Bay tower cluster, with the twin-sail pedestrian bridge and Burj Khalifa in the distance",
    note: "Canal-side, minutes from Downtown",
    guide:
      "Business Bay sits along the Dubai Water Canal, minutes from Burj Khalifa, The Dubai Mall and Downtown. It trades some of Downtown's density for a calmer canal-side promenade, and suits guests who want to be close to the centre without paying its premium.",
    bestFor: "Business trips and city breaks close to Downtown, at a calmer pace",
  },
  {
    name: "DIFC",
    slug: "difc",
    image: "https://dubairapidproperties.com/wp-content/uploads/2026/04/5.jpeg",
    alt: "Living room of a DIFC penthouse with floor-to-ceiling windows overlooking the Dubai skyline",
    note: "Skyline living in the financial district",
    guide:
      "The Dubai International Financial Centre is the city's business district, known for its galleries, Gate Avenue and some of Dubai's best restaurants — with Downtown, Burj Khalifa and The Dubai Mall just next door. DRP's DIFC penthouse is in Park Towers, with panoramic skyline views.",
    bestFor: "Executives and small groups who want space, views and the city on the doorstep",
  },
  {
    name: "JVC",
    slug: "jvc",
    image:
      "https://images.unsplash.com/photo-1642715350691-7ffde05661c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial view of the circular community in Jumeirah Village Circle (JVC), Dubai — low-rise buildings arranged in a ring around a central garden",
    note: "New-build living with resort amenities",
    guide:
      "Jumeirah Village Circle trades skyline for space — a green, family-friendly community a 15–20 minute drive from the coast and Downtown. DRP's JVC home is a brand-new one-bedroom with a resort-style pool, sauna, gym and smart-lock self check-in.",
    bestFor: "Couples, business travellers and long stays looking for value and comfort",
  },
  {
    name: "Dubai Sports City",
    slug: "dubai-sports-city",
    image: "https://dubairapidproperties.com/wp-content/uploads/2026/05/IMG_3135.png",
    alt: "Bright studio bedroom in Dubai Sports City with floor-to-ceiling windows and a balcony",
    note: "Golf views and a rooftop pool",
    guide:
      "Dubai Sports City is a peaceful, well-connected community built around golf courses and sports academies, with easy road access to Dubai Marina, Palm Jumeirah and Downtown. DRP's studio here has golf course views, a rooftop pool and an outdoor cinema.",
    bestFor: "Couples and solo travellers who want a quiet base with resort facilities",
  },
  {
    name: "Meydan",
    slug: "meydan",
    image:
      "https://dubairapidproperties.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-18-at-9.17.28-PM.jpeg",
    alt: "Pool deck with sun loungers at Azizi Riviera in Meydan, Dubai",
    note: "Azizi Riviera, near Downtown",
    guide:
      "Meydan (Mohammed Bin Rashid City) is a newer district of mid-rise residences and promenades, a short drive from Downtown Dubai. DRP's studio is in Azizi Riviera, a waterfront community with pools, gyms and shops at street level.",
    bestFor: "Business travellers and couples who want a modern base near the centre",
  },
  {
    name: "Downtown Dubai",
    slug: "downtown-dubai",
    image:
      "https://images.unsplash.com/photo-1634007626524-f47fa37810a7?auto=format&fit=crop&w=1600&q=80",
    alt: "The Burj Khalifa rising above the illuminated Downtown Dubai skyline at dusk, with the Sheikh Zayed Road interchange below",
    imagePosition: "50% 55%",
    note: "Burj Khalifa, Dubai Mall and the fountains",
    guide:
      "Downtown Dubai is the city's centrepiece — the Burj Khalifa, The Dubai Mall, the Dubai Fountain and Opera District, all within walking distance of one another. It is the most connected address in Dubai, with the Metro, Business Bay and DIFC minutes away. We're preparing our first Downtown homes; message us and we'll tell you as soon as one is ready.",
    bestFor: "First-time visitors and short city breaks who want to be in the middle of it all",
  },
];

/** Number of DRP homes in an area. */
export const homesInArea = (areaName: string) =>
  properties.filter((p) => p.area === areaName).length;

/** Areas with at least one published home — the ones worth offering as a search filter. */
export const areasWithHomes = areas.filter((a) => homesInArea(a.name) > 0);
