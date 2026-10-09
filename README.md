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
  holds the dates and sends the guest to Stripe's hosted payment
  page for the full amount in AED. Once paid, the booking is confirmed
  automatically and the guest and team are emailed. If the guest doesn't
  pay within 30 minutes, the checkout expires and the dates are released.
  Without Stripe keys, a booking is a *request* the team confirms and
  arranges payment for directly.
  Guests can also ask for a **rental car** (type and airport or home
  pick-up). The team sees it in the dashboard and emails.
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
| `STRIPE_SECRET_KEY` | Turns on online payment (`sk_test_…` to test, `sk_live_…` for real payments). |
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
   **Developers → API keys**, copy the secret key into `STRIPE_SECRET_KEY`.
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
