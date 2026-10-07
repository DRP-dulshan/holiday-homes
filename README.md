# DRP Holiday Homes

The website for **DRP Holiday Homes**, the short-term rental division of
D|R|P, a Dubai real estate brokerage.

Guests can search homes by date, see live availability, request a booking,
and look up or cancel it later. The team works from a password-protected
dashboard where they confirm or decline requests, block dates and handle
enquiries. Email notifications go out at each step.

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
  Guests can also ask for a **rental car** (type and airport or home
  pick-up). The team sees it in the dashboard and emails.
- `/booking/[ref]` is the booking page. It's reached through a signed link
  sent by email, or by looking up the reference and email at `/booking`.
  Guests can see the status and cancel there.
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
  booking. The guest is emailed on each change.
- Availability: an occupancy grid for every home over 35 days, and a form
  to block dates (owner stays, maintenance, bookings taken elsewhere).
- Enquiries: reply by email, mark as handled, or delete.
- CSV export of bookings and enquiries.

**Not included:** online card payment. A booking stays a *request* until
the team confirms it and arranges payment directly. Online payment
(Stripe, Network International, etc.) can be added to the confirmation
step later.

## Stack

- **Next.js 16** (App Router, Route Handlers, Server Actions) + **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Framer Motion**, **react-hook-form** + **zod**
- Storage (`src/lib/server/store.ts`): **Upstash Redis** over its REST API
  when configured (needed on Vercel), otherwise JSON files on disk. Every
  write runs under a lock, so the same nights can't be booked twice.
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
      bookings/               POST — create a booking request
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

- Confirm the phone, WhatsApp, emails and social links in `src/config/site.ts`.
- Connect Upstash Redis (on Vercel), and set `ADMIN_PASSWORD`, `APP_SECRET`, `SITE_URL` and the Resend
  variables, and verify the sending domain in Resend.
- Have `/terms` and `/privacy` reviewed against your DET licence and the
  UAE PDPL.
- Replace the remaining Unsplash area photos and the placeholder team
  profiles with DRP's own.
