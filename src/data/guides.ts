/**
 * Travel guides for the website. Written to stay true over time: no opening hours, ticket prices
 * or event dates, which change. Check current details with the venue or ask the DRP team.
 */
export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string };

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date. */
  published: string;
  minutes: number;
  /** An area slug whose photo is used as the cover. */
  coverArea: string;
  blocks: GuideBlock[];
};

export const guides: Guide[] = [
  {
    slug: "where-to-stay-in-dubai",
    title: "Where to stay in Dubai: a guide to the neighbourhoods",
    excerpt:
      "Palm Jumeirah, Dubai Marina, Downtown, Business Bay, JVC… Dubai is spread out, and where you stay shapes your trip. Here's how the main areas differ.",
    published: "2026-10-09",
    minutes: 6,
    coverArea: "dubai-marina",
    blocks: [
      {
        type: "p",
        text: "Dubai is a long, spread-out city. Most of what visitors want to see is along a strip from Old Dubai in the north-east to the Marina and the Palm in the south-west, and the neighbourhood you choose decides how much of your holiday is spent in a car. This guide compares the areas where DRP has homes.",
      },
      { type: "h2", text: "Palm Jumeirah: a beach holiday inside the city" },
      {
        type: "p",
        text: "The Palm is a man-made island with beaches, resort hotels and a long seafront promenade. It suits families and couples who want sand and sea on the doorstep, with the rest of Dubai a 20–30 minute drive away. Our homes here range from studios high in the St. Regis Palm Tower to larger Shoreline apartments.",
      },
      { type: "h2", text: "Dubai Marina and JBR: walkable and lively" },
      {
        type: "p",
        text: "The Marina is a canal lined with towers, restaurants and a long walkway, with the tram and Metro nearby and JBR beach a short walk away. It is the easiest area to enjoy without a car, and the busiest in the evenings.",
      },
      { type: "h2", text: "Downtown Dubai and Business Bay: in the middle of it all" },
      {
        type: "p",
        text: "Downtown is home to the Burj Khalifa, The Dubai Mall and the fountains. Business Bay sits along the Dubai Water Canal right next to it, with a calmer feel and generally better value. Both are well placed for the Metro and for getting to either end of the city. Our current Downtown-area stays are in Business Bay and nearby DIFC; Downtown homes are on the way.",
      },
      { type: "h2", text: "DIFC: skyline views and good restaurants" },
      {
        type: "p",
        text: "Dubai's financial district has galleries, dining and some of the best skyline views, and is next door to Downtown. It works well for business travel and for guests who want space and views in a central spot.",
      },
      { type: "h2", text: "JVC, JVT, Sports City and Meydan: space, pools and value" },
      {
        type: "p",
        text: "These newer residential communities are a drive from the coast, but the homes are modern, the buildings have resort-style pools and gyms, and the price per night is lower. They suit longer stays, families who want facilities on site, and travellers happy to use a car or taxi for outings.",
      },
      {
        type: "tip",
        text: "Not sure? Tell the team your dates and what matters most — beach, nightlife, a quiet base, budget — and we'll suggest the best match.",
      },
    ],
  },
  {
    slug: "best-time-to-visit-dubai",
    title: "The best time to visit Dubai, month by month",
    excerpt:
      "Dubai is warm all year, but the experience changes a lot between winter and summer. Here's what to expect and how to plan around the heat.",
    published: "2026-10-09",
    minutes: 4,
    coverArea: "palm-jumeirah",
    blocks: [
      {
        type: "p",
        text: "Dubai has two seasons in practice: a pleasant, sunny winter and a very hot summer. Neither is wrong, but they suit different trips and different budgets.",
      },
      { type: "h2", text: "October to April: the comfortable months" },
      {
        type: "p",
        text: "From around late October to April the weather is warm and sunny rather than punishing. It is the best time for beaches, walking, outdoor dining, the desert and the city's open-air attractions. It is also the busiest and most expensive time, especially around the end-of-year holidays, so book early.",
      },
      { type: "h2", text: "May to September: hot, quiet and good value" },
      {
        type: "p",
        text: "Summer days are very hot and humid, and most people move between air-conditioned places. In return you get quieter attractions and lower prices. Plan outdoor time for early morning or after sunset, and make the most of pools, malls, aquariums and indoor attractions.",
      },
      { type: "h2", text: "Ramadan and public holidays" },
      {
        type: "p",
        text: "Ramadan moves earlier each year, and the dates of Eid holidays shift with it. During Ramadan daytime eating and drinking in public is restricted, many restaurants adjust their hours, and evenings are lively. Check the dates for your travel year before booking.",
      },
      {
        type: "tip",
        text: "Travelling in summer? Ask us about homes with a building pool, and plan a car for the middle of the day — our guests get special rates on the DRP car fleet.",
      },
    ],
  },
  {
    slug: "getting-around-dubai",
    title: "Getting around Dubai without stress",
    excerpt:
      "Metro, tram, taxis, ride-hailing and rental cars — what works best for which trip, and how your choice of neighbourhood affects it.",
    published: "2026-10-09",
    minutes: 4,
    coverArea: "business-bay",
    blocks: [
      {
        type: "p",
        text: "Dubai is easy to get around once you know the options. The right mix depends on where you stay and how much you plan to see.",
      },
      { type: "h2", text: "Metro and tram" },
      {
        type: "p",
        text: "The Metro runs along the main Sheikh Zayed Road corridor and connects the airport, Downtown, Business Bay, the Marina area and Old Dubai. A tram links the Marina and JBR to the Metro, and a monorail runs up the Palm. It is cheap, air-conditioned and punctual — ideal if your home is near a station.",
      },
      { type: "h2", text: "Taxis and ride-hailing" },
      {
        type: "p",
        text: "Licensed taxis are plentiful and metered, and ride-hailing apps work throughout the city. For most short trips and evenings out this is the simplest choice, especially when parking is awkward.",
      },
      { type: "h2", text: "A car, when it makes sense" },
      {
        type: "p",
        text: "If you are staying outside the main corridor, travelling with a family, or want to see the desert, the coast and Abu Dhabi in one trip, a car gives you freedom. DRP guests get special rates on our private car fleet — tick the rental car option when you book and we'll send options and prices.",
      },
      { type: "h2", text: "From the airport" },
      {
        type: "p",
        text: "Taxis, the Metro and pre-arranged transfers all serve the airports.",
      },
      {
        type: "tip",
        text: "Staying in the Marina or Business Bay? You may not need a car at all. JVC, JVT and Sports City are easier with one.",
      },
    ],
  },
  {
    slug: "dubai-three-day-itinerary",
    title: "A first-timer's 3-day Dubai itinerary",
    excerpt:
      "Skyscrapers, old souks, the beach and a night in the desert: a relaxed plan for your first three days, with room to breathe.",
    published: "2026-10-09",
    minutes: 5,
    coverArea: "downtown-dubai",
    blocks: [
      {
        type: "p",
        text: "Three days is enough to see Dubai's headline sights without rushing. This plan groups things by area so you spend more time enjoying the city and less time in traffic.",
      },
      { type: "h2", text: "Day 1: Downtown and the skyline" },
      {
        type: "list",
        items: [
          "Morning: the view from the Burj Khalifa observation decks (book ahead for a time slot).",
          "Midday: The Dubai Mall, with its aquarium, ice rink and plenty of places to eat.",
          "Evening: the Dubai Fountain show at sunset, then dinner along the lake or in DIFC.",
        ],
      },
      { type: "h2", text: "Day 2: Old Dubai and the coast" },
      {
        type: "list",
        items: [
          "Morning: the Al Fahidi historic district, then an abra boat across the Creek.",
          "Midday: the gold and spice souks in Deira; bargaining is part of the fun.",
          "Afternoon: Jumeirah's beaches and the view of the Burj Al Arab.",
          "Evening: a stroll at The Walk in JBR or Marina Walk.",
        ],
      },
      { type: "h2", text: "Day 3: Palm Jumeirah and the desert" },
      {
        type: "list",
        items: [
          "Morning: the Palm — beach time, or a walk along the crescent.",
          "Late afternoon: a desert safari with dune driving, sunset and a camp dinner (most operators collect you from your home).",
        ],
      },
      {
        type: "tip",
        text: "Want a car for the three days? Tick \"I'd like to rent the DRP car\" when you book and the team will confirm it.",
      },
    ],
  },
  {
    slug: "dubai-holiday-home-essentials",
    title: "Staying in a Dubai holiday home: what to know before you arrive",
    excerpt:
      "Guest registration, the Tourism Dirham fee, house rules and check-in — a short checklist so your arrival is smooth.",
    published: "2026-10-09",
    minutes: 3,
    coverArea: "jvt",
    blocks: [
      {
        type: "p",
        text: "Holiday homes in Dubai are licensed and regulated, which is good for guests, but it means a few steps that hotels handle at the front desk. Here is what to expect when you book with DRP.",
      },
      { type: "h2", text: "Guest registration" },
      {
        type: "p",
        text: "Every guest staying in a licensed holiday home must be registered with the authorities. We ask for a copy of each guest's passport or Emirates ID before arrival. You can send names and arrival details from your booking page, and the documents by WhatsApp or email.",
      },
      { type: "h2", text: "The Tourism Dirham fee" },
      {
        type: "p",
        text: "Dubai charges a per-night Tourism Dirham fee for holiday-home stays. It is shown as its own line in your price breakdown and is included in your total.",
      },
      { type: "h2", text: "Security deposit" },
      {
        type: "p",
        text: "Many homes ask for a refundable security deposit, returned after the check-out inspection. The amount is shown in the price summary and in each home's house rules; the team arranges it with you before arrival.",
      },
      { type: "h2", text: "House rules and your neighbours" },
      {
        type: "p",
        text: "Our homes are in residential buildings, so quiet hours, no parties and no smoking indoors apply. Each home's page lists its rules. They keep the building pleasant for everyone, including you.",
      },
      { type: "h2", text: "Check-in and check-out" },
      {
        type: "p",
        text: "Most homes check in from the afternoon and check out in the morning; times are on each home's page. Many have self check-in with a smart lock, and we send access details before you arrive. Need early check-in or late check-out? Ask when you book and we'll do our best.",
      },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
