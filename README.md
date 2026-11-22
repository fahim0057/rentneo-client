# RentNeo Client

Next.js 16 app for the RentNeo equipment rental marketplace. It also hosts the
Better Auth server (email/password + Google) that issues the JWTs consumed by
`rentneo-server`.

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. `npm install`
3. `npm run dev` (http://localhost:3000)

The API server must be running separately; `NEXT_PUBLIC_API_URL` points at it.

## Environment

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Public origin of this app; must equal the API's `AUTH_URL` |
| `MONGODB_URI` | Atlas/local MongoDB connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `NEXT_PUBLIC_API_URL` | Base URL of `rentneo-server` |
| `IMGBB_API_KEY` | ImgBB key used by `/api/upload` |

## Roles

- `customer` — browse equipment
- `owner` — list and manage equipment
- `admin` — review equipment and manage user roles

New users are `customer`; an admin promotes them from
`/dashboard/admin/users`. Any signed-in user may rent; listing requires the
`owner` role.

## Structure

- `src/app/api/auth/[...all]` — Better Auth handler (including `/jwks` and `/token`)
- `src/app/api/upload` — authenticated ImgBB upload
- `src/app/equipment` — public catalogue and item detail page
- `src/app/dashboard` — role-gated owner/admin dashboards
- `src/lib/api.ts` — authenticated fetch helper (gets a JWT, adds `Authorization`)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the build
- `npm run lint` — ESLint
