# RentNeo

**An equipment rental marketplace.** Owners list construction, photography, vehicle, agriculture, electronics and event equipment; customers search, book and pay online; admins review listings and manage the platform.

## Purpose

RentNeo lets people rent the equipment they need for a project instead of buying it, and lets equipment owners earn from items they already have. Every listing is reviewed by an admin before it goes public, payments are handled through Stripe Checkout (amounts in **BDT**), and each role (customer, owner, admin) gets its own dashboard.

## Live URL

| Part | URL |
| --- | --- |
| Web app (client) | `(https://rentneo-client.vercel.app/)` |

## Key features

### For everyone
- Home page with hero, featured equipment, category browser, "why choose us", "how it works", customer reviews and an owner call-to-action
- Equipment catalogue with search (name, location, category, brand), filters (category, rental type, price range, availability), sorting (newest, price low/high) and pagination, all kept in the URL so filters survive reloads and the back button
- Equipment detail page with condition, brand/model, owner, rental terms and reviews with average rating
- Light/dark theme, responsive layout, toast notifications and animated sections

### Authentication and roles
- Email/password sign-up and login, plus Google sign-in (Better Auth)
- Password rules: at least 6 characters, with an uppercase and a lowercase letter
- Three roles: **customer** (default), **owner**, **admin**. Admins promote users from the dashboard, and cannot change their own role
- Role-gated dashboards with redirect to login and a `next` return path

### Customers
- Book equipment by pickup/return date and quantity, with a live price estimate
- Stripe Checkout payment, then a confirmation page that works even if the webhook is a moment late
- **My Rentals** with payment and booking status, and the option to cancel unpaid bookings
- **Favorites** list
- Star rating and comment on completed rentals (one review per booking)
- **Profile** page: name, email, phone, address and avatar image

### Equipment owners
- Add, edit and delete equipment listings with image upload; new or edited listings go back to **pending** until an admin approves them
- **Rental Requests**: move paid bookings through confirmed, active and completed, or cancel
- **Analytics**: bookings, active/completed rentals, total earnings and a 12-month chart

### Admins
- Approve or reject listings, edit or remove any listing
- Manage all users and roles
- View all bookings, filtered by booking and payment status
- Platform analytics: users, listings, pending approvals, bookings, revenue and a 12-month chart

### Booking and payment rules
- Price is always calculated on the server from the database, never trusted from the browser
- Rental length is calendar-based: every started week or month counts as a full unit (daily, weekly or monthly rates)
- Stock is checked against overlapping paid and in-progress bookings, and unpaid bookings hold stock for about 31 minutes while checkout is open
- Stale unpaid holds expire automatically; no cron job is needed
- Stripe webhook is signature-verified and idempotent (duplicate events are safe)

### Security and reliability
- `helmet` headers, CORS allow-list, request rate limiting (300 requests/minute) and a 100 KB JSON body limit
- Input validation with Zod; query strings accept plain strings only, to block NoSQL operator injection
- Owner email and demo flags are hidden from public equipment responses
- Users are resolved by their immutable JWT subject, not by email
- API responses are sent with `Cache-Control: no-store`; graceful shutdown on `SIGINT`/`SIGTERM`

## npm packages used

### Client (`rentneo-client`)

| Package | Used for |
| --- | --- |
| `next` 16.4.6 | App framework (App Router, route handlers, Turbopack) |
| `react`, `react-dom` 19.3.0 | UI library |
| `better-auth` | Authentication (email/password, Google, JWT plugin) |
| `@better-auth/mongo-adapter` | Stores Better Auth data in MongoDB |
| `mongodb` | Database driver for the auth server and profile route |
| `tailwindcss` 4.3.3, `@tailwindcss/turbopack` | Styling |
| `tw-animate-css` | Animation utilities for Tailwind |
| `shadcn` | UI component system and theme tokens |
| `@base-ui/react` | Accessible UI primitives behind the components |
| `class-variance-authority` | Component style variants (buttons etc.) |
| `cn` | Class name helper |
| `lucide-react` | Icons |
| `motion` | Animations (sections, charts) |
| `next-themes` | Light/dark theme switching |
| `sonner` | Toast notifications |

Dev tools: `typescript`, `eslint`, `eslint-config-next`, `@types/node`, `@types/react`, `@types/react-dom`.

### Server (`rentneo-server`)

| Package | Used for |
| --- | --- |
| `express` 5 | HTTP API framework |
| `mongodb` | Database driver |
| `jose` | Verifies Better Auth JWTs against the remote JWKS |
| `stripe` | Checkout Sessions and webhook verification |
| `zod` | Request validation |
| `helmet` | Security headers |
| `cors` | Cross-origin allow-list |
| `express-rate-limit` | Rate limiting |
| `dotenv` | Loads environment variables |
| `typescript`, `tsx` | Build (`tsc`) and dev runner (`tsx watch`) |
| `@types/express`, `@types/cors`, `@types/node` | Type definitions |

### Third-party services
MongoDB (Atlas or local), Stripe (test mode), Google OAuth, ImgBB (image hosting), Vercel (deployment).

## Roles at a glance

| Role | Can do |
| --- | --- |
| `customer` | Browse, book and pay, favorite, review, edit profile |
| `owner` | Everything a customer can, plus list and manage equipment, handle rental requests, view earnings |
| `admin` | Approve/reject listings, manage users and roles, see all bookings and platform analytics |
