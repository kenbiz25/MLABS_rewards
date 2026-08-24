# Core Traits & Recognition Awards

An internal nomination and reporting tool for Medtronic LABS' Core Traits program — a
lightweight, self-hosted alternative to Perceptyx for capturing peer nominations and
giving HR/LT full visibility into submissions, trends, and results.

## Stack

Next.js 14 (App Router) + TypeScript, Tailwind CSS, Prisma + SQLite, Zod, bcryptjs,
nodemailer (password-reset email), lucide-react. No chart library or component kit —
dashboards and charts are hand-built with Tailwind.

## Getting started

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` to nominate, or `http://localhost:3000/login` to sign in.

**Seeded logins** (from the default `.env.example`, password `ChangeMe123!` for all):

- Admin: `catherine.muthoni@medtroniclabs.org` — lands on the admin dashboard.
- Employee (has nomination history to browse): `wanjiru.kamau@medtroniclabs.org`,
  `david.mensah@medtroniclabs.org`, or `priya.nair@medtroniclabs.org` — lands on `/me`.

The seed also creates four financial-year cycles (FY27 Q1–Q4, the current one open)
with ~37 realistic nominations across the 7 participating countries and all four Core
Traits, plus a not-yet-activated FY28 Q1 cycle and a mix of published/unpublished
cycle winners — enough to demo the dashboard, PDF export, and results tab convincingly.

## Accounts and access

There's one unified login (`/login`) for everyone — no separate admin sign-in page:

- **Employees** self-register (name, work email, password — no SSO/OAuth) and, once
  signed in, land on `/me`: their own nomination history, plus a **Results** tab
  showing winners for any cycle an admin has published.
- **Admins** are either seeded (see below) or promoted from an existing employee
  account by another admin, from `/admin/team`. Signing in as an admin lands on the
  admin dashboard, which also has a "View as employee" link back to `/me` — the same
  account can nominate and browse its own history like anyone else.
- **Nominating without an account** still works: the public form falls back to a
  lightweight one-time name + work-email gate if there's no session. Signing in isn't
  required to submit a nomination, just to see your history afterward.
- **Forgot password**: `/forgot-password` → emails a one-hour reset link (or logs it
  to the server console in development — see SMTP setup below) → `/reset-password`.
  Resetting a password signs that account out everywhere.

## Generating an admin password hash

`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` in `.env` control the one account the seed
script always upserts as an admin. To set a real password:

```bash
npm run hash -- "your-password"
```

Paste the output into `ADMIN_PASSWORD_HASH`, then re-run `npm run db:seed` (safe to
re-run — it upserts). To grant admin access to anyone else afterward, use
`/admin/team` instead of environment variables.

## SMTP (password-reset emails)

Set `SMTP_HOST` (plus `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) in `.env` to
send real reset emails via any SMTP provider (Microsoft 365, Gmail, etc.). Leave
`SMTP_HOST` unset in development — reset links are logged to the server console
instead, so the flow is fully testable without real credentials.

## How nominations work

- **Participating countries**: Kenya, Ghana, Rwanda, Sierra Leone, Bangladesh, Bhutan,
  and the United States — see `PARTICIPATING_COUNTRIES` in `lib/countries.ts`. The
  nomination form and the admin country filter are both scoped to this list.
- **Nominator identity**: name + work email, either from an active session or the
  one-time gate. It's always visible to HR in the dashboard and CSV export, but never
  shown anywhere a nominee could see it.
- **All fields are required** to submit, including at least one Core Trait.
- **Cycles**: named by financial year and quarter (e.g. "FY27 Q1" — see
  `lib/fiscalYear.ts` for how the next label is suggested). HR schedules a cycle from
  `/admin/cycles` by picking a start date and a duration; the window automatically
  opens at 12:01 a.m. in Bangladesh (the farthest-ahead participating country) and
  closes at 11:59 p.m. in Sierra Leone (the farthest-behind) on the last day — see
  `lib/schedule.ts`. That's fully automatic once a cycle is activated: no one has to
  be online at the exact open/close instant. Several cycles can be scheduled, live, or
  closed at once — activating, closing, or editing one never touches another.
  Once a window's closing instant passes, the public form stops accepting submissions
  for it — the shared link is effectively inaccessible until the next cycle opens.
- **Duplicate prevention**: one nomination per nominator email per cycle, enforced by
  a database unique constraint and checked proactively before the form loads.
  Multiple nominations *for the same nominee* are expected and encouraged — only one
  nomination *per nominator* is restricted.
- **Winners & results**: HR records winners per cycle from `/admin/cycles` (names
  only — no photos) and controls exactly when they become visible with a
  "Publish results" toggle, independent of whether the cycle itself is closed. Once
  published, winners show up in every employee's `/me` → Results tab and in the public
  `/api/winners` feed.

## Reporting

`/admin/nominations` includes:

- Stats cards (total nominations, countries represented, Patients First count,
  Innovation count) scoped to the selected cycle.
- A cycle-by-cycle volume trend chart.
- A most-selected Core Trait breakdown (per cycle or cumulative — toggle via the cycle
  filter).
- A **Recurring words** panel — not a raw word-frequency count. It matches against a
  curated set of Core Trait / organizational-value concepts (collaboration,
  accountability, integrity, innovation, and so on — see `VALUE_TERMS` in
  `lib/words.ts`) and rolls variants up under one label, so it surfaces meaningful
  themes instead of incidental nouns, verbs, or dates from a specific anecdote.
- A filterable, searchable table (cycle, country, trait, free-text search across
  nominee/nominator names) with a detail drawer showing the full moment/impact text.
- **Export CSV** — respects the current filters.
- **Export PDF** — opens a print-optimized summary (stats + charts, matching the
  dashboard's first two rows) in a new tab; use the browser's "Print → Save as PDF" to
  get an actual file. There's no PDF-generation dependency involved — see
  `components/admin/SummaryPrintView.tsx`.

## Design notes

- Countries and trait definitions are shared between client and server —
  `lib/countries.ts` and `lib/traits.ts` — so validation, the form, and the dashboard
  can never drift out of sync.
- The Core Trait icons (`HeartPulse`, `Award`, `Handshake`, `Lightbulb`) and the
  background's drifting icon texture are deliberately not the corporate logomark —
  they're meant to symbolize the traits themselves, kept intentionally light and
  simple rather than a heavy brand treatment.

## Switching to Postgres

Everything is written against Prisma so this is a one-line change for production:

1. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to a `postgres://` connection string.
3. Run `npx prisma db push` (or set up migrations with `npx prisma migrate dev`).

Note: the `contains` filters used for search/trait filtering rely on SQLite's default
case-insensitive `LIKE`. On Postgres, add `mode: "insensitive"` to those Prisma `where`
clauses if you want the same case-insensitive behavior.

## Data portability

All data lives in a normal relational schema (`User`, `Cycle`, `CycleWinner`,
`Nomination`, `Session`, `PasswordResetToken` — see `prisma/schema.prisma`) and is
always exportable as CSV via the dashboard, so it can be migrated back into Perceptyx
or any other tool later without lock-in.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Provision a Postgres database (Vercel Postgres, Neon, Supabase, etc.) and switch the
   Prisma datasource as above.
3. Set the environment variables from `.env.example` in the Vercel project settings
   (`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `APP_URL`,
   and the `SMTP_*` variables if you want real reset emails).
4. Add `npx prisma generate` to the build command if it isn't picked up automatically,
   and run `npx prisma db push` once against the production database before first use.

## Known limitations

- Rate limiting (login, signup, nomination submissions, password-reset requests) is
  in-memory and per-instance — fine for a single-server deployment, but swap for a
  shared store (e.g. Redis) if you scale to multiple instances.
- The forgot-password flow needs `SMTP_*` configured to send real email; without it,
  reset links only appear in the server console (development-safe, not production-safe).

## Project structure

```
app/                  Routes (App Router): public form, login/signup, /me, admin, API handlers
components/           UI components (nomination flow, employee home, admin dashboard, auth)
lib/                  Shared schemas, trait/country data, auth, scheduling, email, CSV, word matching
prisma/               Schema and seed script
scripts/              One-off CLI utilities (password hashing)
```
