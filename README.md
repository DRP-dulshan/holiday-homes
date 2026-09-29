# DRP Holiday Homes

A premium marketing / showcase website for **DRP Holiday Homes** — the short-term
rental division of D|R|P, a Dubai real estate brokerage.

This is a client-facing demo build: polished design and UX with realistic mock
data. There is no live booking backend — the search widget and forms are
interactive UI only.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Framer Motion** for scroll reveals, the FAQ accordion, the testimonial
  carousel and hero motion
- `next/image` with remote images from Unsplash

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm start       # serve the production build
```

## Project structure

```
src/
  app/
    page.tsx              Home — fully built single-page marketing site
    explore/page.tsx      Explore Stays — full grid (filters stubbed)
    property/[slug]/       Property detail — SSG from mock data
    about/page.tsx
    contact/page.tsx
    globals.css           Brand design system (colours, fonts, shadows)
  components/              PropertyCard, SectionHeading, FAQAccordion,
                           SearchWidget, Navbar, Footer, Reveal, …
  data/                    properties, areas, testimonials, faqs, site config
```

## Brand

| Token            | Value     | Use                                  |
| ---------------- | --------- | ------------------------------------ |
| `brand`          | `#f47b49` | CTAs, active states, accents         |
| `ink`            | `#2e2e2e` | Headings, body, dark sections        |
| `canvas`         | `#ffffff` | Backgrounds                          |
| `ink-05…ink-90`  | tints     | Borders, muted text, section fills   |

Headings use **Space Grotesk**, body copy uses **Inter** (both via
`next/font`).

## Deploying

Deploys to Vercel with no configuration. `images.unsplash.com` is already
allow-listed in `next.config.ts`.

## Notes for the next round

- Wire the search widget + Explore filters to real availability
- Property detail: gallery, amenities, map, availability calendar
- Connect the contact / enquiry form to a real inbox or CRM
- Swap Unsplash placeholders for DRP's own photography
