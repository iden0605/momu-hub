# MoMU Hub

Events and attendance app for Malaysians of Melbourne University (MoMU). Committee members sign in with Google, run events, check people in (or let them self check-in with a QR code) and export UMSU-formatted attendance lists.

## Features

- **Google sign-in** through Supabase Auth. New accounts wait for an admin to give them a role.
- **Roles**: Member (see events, check people in), Committee (also create, edit, close and export events), Admin (also manage access on `/admin`).
- **Admin unlock**: any signed-in account can enter `ADMIN_PASSWORD` on the waiting screen to become an admin. Emails in `ADMIN_EMAILS` always get admin on sign-in.
- **Events**: a card feed with open/closed filters.
- **Attendance**: search the shared roster or add someone on the spot. A public `/checkin/<event>` page (with QR code) asks for name, email and student ID, no sign-in needed.
- **Exports and stats**: UMSU CSV per event, turnout and "how did you hear about us" stats.

## Stack

Next.js (App Router), Tailwind CSS v4, Supabase (Postgres, Auth, Realtime), deployed on Vercel.

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
