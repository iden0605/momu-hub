# MoMU Hub

Events and attendance app for Malaysians of Melbourne University (MoMU). Committee members sign in with Google, run events, check people in (or let them self check-in with a QR code) and export UMSU-formatted attendance lists.

## Features

- **Invite only, Google sign-in** through Supabase Auth. New accounts land on a waiting screen and can't read anything until committee or an admin accepts them on `/access`.
- **Pre-approved emails**: add an email with an access level on `/access`, the matching Google account gets that level on first sign-in.
- **Levels**: Member (see events, check people in), Committee (also run events and approve people), Admin (also manage admins). Changes to your own level, removals and admin demotions ask for confirmation.
- **Admin unlock**: any signed-in account can enter `ADMIN_PASSWORD` on the waiting screen to become an admin. Emails in `ADMIN_EMAILS` always get admin on sign-in.
- **Events**: a card feed with open/closed filters.
- **Attendance**: search the shared roster or add someone on the spot. A public `/checkin/<event>` page (with QR code) asks for name, email and student ID, no sign-in needed.
- **Exports and stats**: UMSU CSV per event, turnout and "how did you hear about us" stats.

## Stack

| Technology | How it's used |
|------------|---------------|
| **Next.js 16** (App Router) | Pages are React Server Components that query Supabase on the server. Mutations are Server Actions (`actions.ts` per route). `proxy.ts` refreshes the session cookie and redirects signed-out visitors to `/login`. The `(hub)` route group shares one layout so the header stays mounted while `loading.tsx` skeletons fill the page. Nav tabs are prefetched and the client router cache (`staleTimes`) keeps visited pages for 5 minutes. The attendance CSV export is a Route Handler. |
| **React 19** | Client components for forms, the custom dropdown, date and time pickers, dialogs and the mobile menu. Uses `useActionState`, `useSyncExternalStore` and portals for modals. |
| **TypeScript** | Whole codebase, with shared domain types in `lib/types.ts`. |
| **Tailwind CSS v4** | All styling. Theme tokens (MoMU coral, marigold, slate on cream) are CSS variables in `app/globals.css`, exposed to Tailwind with `@theme`. Also holds the shimmer, loader and entrance animations. |
| **Supabase Postgres** | Tables for users and roles, invites, events, the attendee roster and check-ins. Schema lives in `supabase/migrations`. Row Level Security only lets accounts with a role read data, and every write goes through Server Actions using the service role key. |
| **Supabase Auth** | Google OAuth sign-in. Sessions are stored in cookies by `@supabase/ssr` and verified locally with `getClaims()` against the project's asymmetric signing key, avoiding an auth server call per request. |
| **Supabase Realtime** | `components/live-refresh.tsx` listens for changes to events, check-ins, the roster and users, then calls `router.refresh()` so every open tab stays current. |
| **Supabase CLI** | Linking the project and applying migrations with `supabase db push`. |
| **Google Cloud OAuth** | The OAuth client used by Supabase for "Continue with Google". |
| **qrcode** | Renders each event's self check-in QR code as SVG on the server. |
| **next/font** | Self-hosts the Outfit (headings), Nunito (body) and JetBrains Mono (IDs, codes) Google Fonts. |
| **Vercel** | Hosting. Pushes to `main` deploy to production, other branches get previews. `vercel.json` pins functions to Seoul (`icn1`) next to the database. Environment variables are managed in the Vercel project. |
| **ESLint** | Linting with `eslint-config-next`. |

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
3. Apply the schema: `supabase link --project-ref <ref>` then `supabase db push`.
4. In Supabase, go to Authentication > Providers > Google, enable it and add the Google OAuth client ID and secret. Add `<APP_URL>/auth/callback` to the Redirect URLs.
5. `npm run dev`

## Environment variables

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, server only |
| `APP_URL` | Public base URL for check-in QR links |
| `ADMIN_PASSWORD` | Unlocks admin for whoever enters it |
| `ADMIN_EMAILS` | Comma separated emails that always get admin |
