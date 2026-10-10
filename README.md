# DRP Holiday Homes

The website for **DRP Holiday Homes**, the short-term rental division of
D|R|P, a Dubai real estate brokerage.

Guests can search homes by date, see live availability, book and pay by card
through Stripe, and look up or cancel their booking later. The team works from
a password-protected dashboard where they manage bookings, block dates and
handle enquiries. Email notifications go out at each step.

## Features

**Guests**

- Search by area, dates and party size from the home page or `/explore`.
  When dates are given, homes that are already booked for them are hidden.
- Property pages have a live availability calendar. Booked nights are
  crossed out, and the minimum stay and maximum guest count are enforced.
- `/book/[slug]` is the checkout: guest details, the price breakdown
  (nightly rate, cleaning fee, Tourism Dirham fee) and the cancellation
  policy. The server re-checks availability under a lock, so the same
  nights can't be booked twice.
- **Payment (Stripe Checkout).** With Stripe configured, "Book now"
  holds the dates and opens a secure card form (Stripe's embedded Checkout) on the
  site's own payment page, for the full amount in AED. Once paid, the booking is confirmed
  automatically and the guest and team are emailed. If the guest doesn't
  pay within 30 minutes, the checkout expires and the dates are released.
  Without Stripe keys, a booking is a *request* the team confirms and
  arranges payment for directly.
  Guests can also ask to rent the **DRP car** (linked to its page via
  `site.carFleetUrl`). The team sees it in the dashboard and emails.
- `/booking/[ref]` is the booking page. It's reached through a signed link
  sent by email, or by looking up the reference and email at `/booking`.
  Guests can see the status and payment, finish an unpaid payment, and
  cancel there.
- Owners fill in one form at the top of `/owners` (area, type, bedrooms, furnishing,
  status, timing), then leave their details. No income estimate is shown;
  the team follows up with a proposal after a walkthrough.
- Enquiry forms (contact, owners and property pages) are saved and emailed
  to the team. They include a honeypot field and rate limiting against spam.
- `/terms` and `/privacy` pages.

**Team dashboard (`/admin`)**

- Overview: requests to review, arrivals in the next 14 days, guests
  currently staying, new enquiries and upcoming confirmed revenue.
- Bookings: filter, search, and confirm, decline, cancel or re-open a
  booking. The guest is emailed on each change. Paid bookings link to the
  payment in Stripe; cancelling a paid booking emails the team that a
  refund is due (refunds are issued from the Stripe dashboard).
- Homes: edit any home (price, photos, description, amenities, times), add a
  new one, unlist it, or restore the imported details. Photos can be uploaded
  (needs a Vercel Blob store) or pasted from Cloudinary / Unsplash.
- Airbnb calendar sync (admin → Homes → a home): paste the home's Airbnb
  "Export calendar" link and nights booked on Airbnb are blocked here too;
  give Airbnb the home's private calendar link ("Import calendar") and nights
  booked here are blocked there. Calendars refresh when guests browse (every 10
  minutes), before a booking is saved (every 2 minutes) and daily by Vercel Cron.
  Set `CRON_SECRET` to enable the cron routes; an external pinger can call
  `/api/cron/ical` more often.
- Reviews: guests whose stay has ended get a review link by email (daily cron)
  and a button on their booking page. Reviews wait in admin → Reviews until you
  publish them (and optionally reply); published reviews show on the home page,
  the home's page and its rating on the cards, and feed Google rich results.
- Cookie consent and analytics: set `NEXT_PUBLIC_GA_ID` (Google Analytics 4),
  `NEXT_PUBLIC_META_PIXEL_ID` and/or `NEXT_PUBLIC_TAWK_SRC` (Tawk.to live chat) and a
  cookie banner appears; the services only load after "Accept all". Conversions
  (begin checkout, enquiry/lead) are reported when allowed. With none set there is no
  banner and no tracking.
- Newsletter: a signup box in the footer; admin → Subscribers lists and exports
  the addresses (CSV) for Mailchimp, Brevo and similar. Every email has an unsubscribe link.
- Saved homes: guests tap the heart on any home (kept in their browser) and see
  them under "Saved"; every home page also has Share (phone share sheet, copy link, WhatsApp).
- Bookings by phone or WhatsApp: admin → Bookings → Add a booking. It follows the
  same availability and stay rules as the website, and confirming it emails the guest.
- Refunds: for bookings paid online, the admin has a "Refund to card" box (any amount up
  to what is left); the guest is emailed. Cancelling a paid booking flags "refund due".
- Reports: admin → Reports shows bookings, nights, revenue, average rates, occupancy,
  discounts and online payments by month and by home for any period.
- Extras: guests can ask for early check-in, late check-out, a baby
  cot or extra cleaning at checkout; the team quotes them (nothing is charged for them online).
- Guests can email themselves a private link to all their bookings ("Manage my booking"),
  send their guests' names and arrival details from their booking page, and get an
  "arriving soon" email three days before check-in (daily cron).
- Travel guides (`/guides`): five Dubai guides (neighbourhoods, best season, getting around, a
  3-day plan, holiday-home essentials) kept in `src/data/guides.ts`; add more there.
- Currency: guests can view prices in USD, EUR, GBP, SAR, INR, RUB or CNY (approximate,
  from live rates refreshed twice a day, with a built-in fallback). Payment is always in AED.
- Explore has a List / Map toggle (OpenStreetMap). Pins are approximate, at neighbourhood level.
- Rates: per home, a weekend rate (Fri/Sat nights), seasonal / event rates for
  date ranges, and weekly (7+ nights) and monthly (28+ nights) discounts.
- Promo codes: percent or AED-off codes with optional expiry, stay window,
  minimum nights, redemption limit and home restriction. Guests apply them at
  checkout; the server re-checks them when the booking is made.
- Availability: an occupancy grid for every home over 35 days, and a form
  to block dates (owner stays, maintenance, bookings taken elsewhere).
- Enquiries: reply by email, mark as handled, or delete.
- CSV export of bookings and enquiries.

Refunds are not automatic: the cancellation policy decides how much is
refunded, so the team issues them from the Stripe dashboard.

## Stack

- **Next.js 16** (App Router, Route Handlers, Server Actions) + **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Framer Motion**, **react-hook-form** + **zod**
- Storage (`src/lib/server/store.ts`): **Upstash Redis** over its REST API
  when configured (needed on Vercel), otherwise JSON files on disk. Every
  write runs under a lock, so the same nights can't be booked twice.
- Payments: [Stripe Checkout](https://stripe.com/payments/checkout) (`stripe` SDK)
- Email: [Resend](https://resend.com) over HTTPS (optional)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev
```

Open http://localhost:3000. The team dashboard is at
http://localhost:3000/admin, and the development password is `drp-admin`.

Without email settings, every email is printed to the terminal, so you can
test all the flows locally.

## Configuration

| Variable          | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `ADMIN_PASSWORD`  | Dashboard password. **Required in production**: the dashboard stays locked without it. |
| `APP_SECRET`      | Signs booking links and admin sessions. If unset, one is generated and stored. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (set automatically by Vercel's Upstash integration). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work. **Required on Vercel.** |
| `DATA_DIR`        | File storage folder when Redis isn't configured (default `./.data`). Must be on a persistent disk. |
| `SITE_URL`        | Public URL used in email links.                                          |
| `RESEND_API_KEY`, `MAIL_FROM` | Turn on real email delivery.                                 |
| `NOTIFY_EMAIL`    | Inbox for team notifications (default: `site.email`).                   |
| `CRON_SECRET` | Protects the cron routes (`/api/cron/daily` also sends review requests; `/api/cron/ical` only refreshes Airbnb calendars). |
| `PORTAL_API_URL`, `PORTAL_API_KEY` | Optional. Connect the D\|R\|P portal: homes published there (portal → unit → Website) replace the built-in list, their availability (incl. Airbnb) comes from the portal, and website bookings are pushed to it. The key equals `WEBSITE_API_KEY` in the portal. If the portal is unreachable the site shows the built-in homes and refuses new bookings for portal homes instead of risking a double booking. |
| `BLOB_READ_WRITE_TOKEN` | Photo uploads in the admin (Vercel Blob). Optional.               |
| `STRIPE_SECRET_KEY` | Turns on online payment (`sk_test_…` to test, `sk_live_…` for real payments). |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` / `pk_live_…`. With it, guests pay in a card form on this site (`/booking/[ref]/pay`); without it, they are sent to Stripe's hosted page. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_…`) of the Stripe webhook below.            |

Business details live in `src/config/site.ts`: phone, WhatsApp, emails,
address and the **booking rules**: minimum and maximum nights, how far
ahead guests can book, the Tourism Dirham fee and the cancellation window.
The homes are in `src/data/properties.ts`. They were imported from the
DRP listings at https://dubairapidproperties.com/holiday-home/: title,
description, price, bedrooms, bathrooms, guests, amenities, house rules and
photos. The photos are served from `dubairapidproperties.com` (allow-listed
in `next.config.ts`). Add a home by adding an entry there; its area must
match one in `src/data/areas.ts`.

## Deploying

### Vercel

Vercel's filesystem is read-only, so bookings and enquiries are stored in
Upstash Redis (the free tier is plenty):

1. In the Vercel dashboard, open the project → **Storage** → **Create
   Database** → **Upstash for Redis**, and connect it to the project. This
   adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Under **Settings → Environment Variables**, add `ADMIN_PASSWORD` and
   `APP_SECRET` (and the email variables if you want real emails).
3. Redeploy.

Without Redis, the site still works but can't save requests: the checkout
then offers a **Send my request on WhatsApp** button with the full request
filled in, and the server log says what to configure.

### Stripe

1. In the [Stripe dashboard](https://dashboard.stripe.com), under
   **Developers → API keys**, copy the secret key into `STRIPE_SECRET_KEY` and the
   publishable key into `STRIPE_PUBLISHABLE_KEY` (the card form then appears on this site).
2. Under **Developers → Webhooks**, add an endpoint at
   `https://<your-site>/api/stripe/webhook` with the events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed` and `checkout.session.expired`.
   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Set `SITE_URL` to the public address, then redeploy.

Start with test keys and pay with the card `4242 4242 4242 4242` (any future
date and CVC), then switch to live keys and a live webhook. The guest's
booking page also checks the payment with Stripe when they return, so a
late webhook never leaves a paid booking unconfirmed.

To test locally, run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
with the [Stripe CLI](https://stripe.com/docs/stripe-cli) and use the
`whsec_…` it prints.

### A server with a disk

Without Redis, data is written to JSON files, so use a host with a
**persistent filesystem** (a VPS, Docker with a volume, or Render or Railway
with a disk):

```bash
npm run build
ADMIN_PASSWORD=… APP_SECRET=… DATA_DIR=/var/lib/drp npm start
```

Back up `DATA_DIR` (or the Redis database) regularly. It holds all bookings
and enquiries.

## Project structure

```
src/
  app/
    page.tsx                  Home
    explore/                  Search + filters (availability-aware)
    property/[slug]/          Property detail + booking card
    book/[slug]/              Checkout
    booking/                  Manage my booking (lookup, detail, cancel)
    admin/                    Team dashboard (login, overview, bookings,
                              availability, enquiries)
    api/
      bookings/               POST — create a booking (and its Stripe checkout)
      stripe/webhook/         POST — Stripe payment events
      enquiry/                POST — send an enquiry
      properties/[slug]/availability/   GET — booked nights
      admin/export/           GET — CSV export (admin only)
    terms/, privacy/, about/, contact/, owners/, areas/[slug]/
  components/                 UI (booking/ holds calendar, checkout, summary)
  config/site.ts              Business details + booking rules
  data/                       Properties, areas, testimonials, FAQs
  lib/
    dates.ts, pricing.ts      Shared date maths and price quotes
    server/                   Store, bookings, enquiries, mailer, auth
```

## Before launch

- Phone and WhatsApp in `src/config/site.ts` match dubairapidproperties.com; confirm the
  email and add the real Instagram / LinkedIn URLs to `socialLinks` (only Facebook is listed).
- Connect Upstash Redis (on Vercel), and set `ADMIN_PASSWORD`, `APP_SECRET`, `SITE_URL` and the Resend
  variables, and verify the sending domain in Resend. Until Redis is connected, the
  dashboard says so and guests are offered WhatsApp instead of the online forms.
- Add the Stripe keys and webhook (live mode), and make one real test booking.
- Have `/terms` and `/privacy` reviewed against your DET licence and the
  UAE PDPL.
- Guest reviews: the "Guest stories" section on the home page shows the sample reviews in
  `src/data/testimonials.ts` and says so. Replace them with real guest reviews (with permission), and
  remove the "sample" wording in `src/components/Testimonials.tsx`, before launch.
- Some area photos are Unsplash stock; replace them with DRP's own when available.
