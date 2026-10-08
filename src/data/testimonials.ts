export type Testimonial = {
  name: string;
  stay: string;
  quote: string;
  rating: number;
};

/**
 * Sample content — names and quotes are illustrative, so the home page does NOT show them.
 * Replace with real guest reviews (with permission) and re-add <Testimonials /> to src/app/page.tsx.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Aisha R.",
    stay: "Palm Jumeirah · 6 nights",
    quote:
      "The home looked exactly like the photos, which almost never happens. Someone met us at the door, the fridge was stocked and the car service made the whole trip feel effortless.",
    rating: 5,
  },
  {
    name: "Thomas & Lena M.",
    stay: "Dubai Marina · 4 nights",
    quote:
      "We've used the big rental platforms for years. This was the first time it felt like staying somewhere genuinely looked after. Quick replies, spotless, beautifully furnished.",
    rating: 5,
  },
  {
    name: "Priya S.",
    stay: "DIFC · 8 nights",
    quote:
      "I travel to Dubai for work every few months and now I only book through DRP. Same standard every time, and the concierge sorts everything before I even land.",
    rating: 5,
  },
  {
    name: "Omar K.",
    stay: "Business Bay · 5 nights",
    quote:
      "Booked for a family visit at short notice. The team was on WhatsApp within minutes, and the apartment was better than some hotels we've paid twice as much for.",
    rating: 5,
  },
];
