# Core Traits & Recognition Awards

An internal nomination and reporting tool for Medtronic LABS' Core Traits program - a
lightweight, self-hosted alternative to Perceptyx for capturing peer nominations and
giving HR/LT full visibility into submissions, trends, and results.

## Stack

Next.js 14 (App Router) + TypeScript, Tailwind CSS, Prisma + SQLite, Zod, lucide-react.
No chart library or component kit - dashboards and charts are hand-built with Tailwind.
Sign-in is Microsoft (Entra ID) OAuth only - no local passwords, no SSO library; the
authorization code + PKCE flow is implemented directly against the Microsoft identity
platform (see `lib/microsoftOAuth.ts` and `app/api/auth/microsoft/`).

## Getting started

```bash
npm install
cp .env.example .env   # then fill in AZURE_AD_CLIENT_ID / AZURE_AD_CLIENT_SECRET (see below)
npm run db:push
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` to nominate, or `http://localhost:3000/login` to sign in
with Microsoft.

The seed script only upserts one account - `catherine.muthoni@medtroniclabs.org` (or
whatever you set `ADMIN_EMAIL` to) as admin - and otherwise leaves the database clean
(no demo cycles, nominations, or other accounts). Sign in with that Microsoft account
to land on the admin dashboard, or sign in with any Microsoft account you control and
promote it to admin from `/admin/team` (the first account ever created has no admin -
see below). Everyone else is auto-provisioned as an employee on their first sign-in.

## Microsoft sign-in setup

The app needs an app registration in [Entra ID](https://entra.microsoft.com) (Azure
AD) to authenticate against:

1. In the Entra admin center, go to **App registrations → New registration**.
2. Name it (e.g. "Core Traits & Recognition Awards"), and under **Supported account
   types** pick the option matching who should be able to sign in (this app defaults
   to "Accounts in any organizational directory and personal Microsoft accounts").
3. Under **Redirect URI**, add a **Web** platform redirect URI:
   `http://localhost:3000/api/auth/microsoft/callback` for local dev, plus your
   production URL's equivalent (e.g. `https://awards.medtroniclabs.org/api/auth/microsoft/callback`).
4. After creating it, copy the **Application (client) ID** into `AZURE_AD_CLIENT_ID`.
5. Go to **Certificates & secrets → New client secret**, create one, and copy its
   **value** (not the secret ID) into `AZURE_AD_CLIENT_SECRET` immediately - it's only
   shown once.
6. Under **API permissions**, confirm `User.Read` (Microsoft Graph, delegated) is
   present - it's added by default and is all this app needs.
7. To restrict sign-in to one organization's tenant instead of any Microsoft account,
   set `AZURE_AD_TENANT_ID` to that tenant's ID (found on the app registration's
   **Overview** page) instead of the default `"common"`.

## Accounts and access

There's one unified login (`/login`) for everyone - no separate admin sign-in page,
and no local password to manage:

- **Everyone signs in with Microsoft**. A user's account is auto-provisioned on their
  first sign-in (matched by the email Microsoft returns) and, once signed in, lands
  on `/me`: their own nomination history, plus a **Results** tab showing winners for
  any cycle an admin has published.
- **Admins** are either seeded (`ADMIN_EMAIL` in `.env`, upserted by `npm run
  db:seed`) or promoted from an existing account by another admin, from
  `/admin/team` - which can also pre-provision an email as admin before that
  person's first sign-in. Signing in as an admin lands on the admin dashboard, which
  also has a "View as employee" link back to `/me` - the same account can nominate
  and browse its own history like anyone else.
- **Removing access** (e.g. someone leaves the organization): an admin deletes the
  account from `/admin/team`, which signs it out everywhere immediately. Their past
  nominations aren't affected (they're linked by email, not the account), and if they
  ever sign in with Microsoft again a fresh non-admin account is auto-provisioned, same
  as any first sign-in. An admin can't delete their own account or drop the last
  remaining admin.
- **Nominating without an account** still works: the public form falls back to a
  lightweight one-time name + work-email gate if there's no session. Signing in isn't
  required to submit a nomination, just to see your history afterward.

## How nominations work

- **Participating countries**: Kenya, Ghana, Rwanda, Sierra Leone, Bangladesh, Bhutan,
  and the United States - see `PARTICIPATING_COUNTRIES` in `lib/countries.ts`. The
  nomination form and the admin country filter are both scoped to this list.
- **Nominator identity**: name + work email, either from an active session or the
  one-time gate. It's always visible to HR in the dashboard and CSV export, but never
  shown anywhere a nominee could see it.
- **Nominee name** is a searchable dropdown (`components/nomination/NomineeSelect.tsx`,
  backed by the public `/api/users/nominatable` endpoint) listing everyone who's ever
  signed in, to cut down on typos - but free text is still accepted for colleagues who
  haven't signed in yet. Nominating the same person more than once (by different
  nominators) is expected and not blocked by the dropdown.
- **All fields are required** to submit, including at least one Core Trait.
- **Cycles**: named by financial year and quarter (e.g. "FY27 Q1" - see
  `lib/fiscalYear.ts` for how the next label is suggested). HR schedules a cycle from
  `/admin/cycles` by picking a start date and a duration; the window automatically
  opens at 00:00 UTC on the start date and closes at 00:00 UTC on the day
  after the last day - see `lib/schedule.ts`. That's the same instant for everyone;
  each admin/employee's browser simply displays it converted to their own local
  timezone. That's fully automatic once a cycle is
  activated: no one has to be online at the exact open/close instant. Several cycles
  can be scheduled, live, or
  closed at once - activating, closing, or editing one never touches another.
  Once a window's closing instant passes, the public form stops accepting submissions
  for it - the shared link is effectively inaccessible until the next cycle opens.
- **Duplicate prevention**: one nomination per nominator email per cycle, enforced by
  a database unique constraint and checked proactively before the form loads.
  Multiple nominations *for the same nominee* are expected and encouraged - only one
  nomination *per nominator* is restricted.
- **Winners & results**: HR records winners per cycle from `/admin/cycles` - each
  winner gets a name, one or more Core Traits, and a justification for why they won -
  and controls exactly when they become visible with a "Publish results" toggle,
  independent of whether the cycle itself is closed. Once published, winners (name +
  traits) show up in every employee's `/me` → Results tab and in the public
  `/api/winners` feed; the justification stays internal to HR.

## Reporting

`/admin/nominations` includes:

- Stats cards (total nominations, countries represented, Patients First count,
  Innovation count) scoped to the selected cycle.
- A cycle-by-cycle volume trend chart.
- A most-selected Core Trait breakdown (per cycle or cumulative - toggle via the cycle
  filter).
- A **Recurring words** panel - not a raw word-frequency count. It matches against a
  curated set of Core Trait / organizational-value concepts (collaboration,
  accountability, integrity, innovation, and so on - see `VALUE_TERMS` in
  `lib/words.ts`) and rolls variants up under one label, so it surfaces meaningful
  themes instead of incidental nouns, verbs, or dates from a specific anecdote.
- A filterable, searchable table (cycle, country, trait, free-text search across
  nominee/nominator names) with a detail drawer showing the full moment/impact text.
- **Export CSV** - respects the current filters.
- **Export PDF** - opens a print-optimized summary (stats + charts, matching the
  dashboard's first two rows) in a new tab; use the browser's "Print → Save as PDF" to
  get an actual file. There's no PDF-generation dependency involved - see
  `components/admin/SummaryPrintView.tsx`.

## Design notes

- **Public GET route handlers that don't call `cookies()`/`headers()` need
  `export const dynamic = "force-dynamic"`** - otherwise Next.js treats them as static
  and caches the response at build time, so a DB change (e.g. opening a cycle,
  publishing results) never shows up until the next deploy. `/api/cycles/current`,
  `/api/winners`, and `/api/users/nominatable` all set this explicitly; keep doing so
  for any new public GET route backed by live data.
- Countries and trait definitions are shared between client and server -
  `lib/countries.ts` and `lib/traits.ts` - so validation, the form, and the dashboard
  can never drift out of sync.
- The Core Trait icons (`HeartPulse`, `Award`, `Handshake`, `Lightbulb`) and the
  background's drifting icon texture are deliberately not the corporate logomark -
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
`Nomination`, `Session` - see `prisma/schema.prisma`) and is always exportable as CSV
via the dashboard, so it can be migrated back into Perceptyx or any other tool later
without lock-in.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Provision a Postgres database (Vercel Postgres, Neon, Supabase, etc.) and switch the
   Prisma datasource as above.
3. Set the environment variables from `.env.example` in the Vercel project settings
   (`DATABASE_URL`, `ADMIN_EMAIL`, `SESSION_SECRET`, `APP_URL`, `AZURE_AD_CLIENT_ID`,
   `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`).
4. Add the production redirect URI (`https://<your-domain>/api/auth/microsoft/callback`)
   to the app registration in Entra ID - see "Microsoft sign-in setup" above.
5. Add `npx prisma generate` to the build command if it isn't picked up automatically,
   and run `npx prisma db push` once against the production database before first use.

## Known limitations

- Rate limiting (nomination submissions, admin actions) is in-memory and
  per-instance - fine for a single-server deployment, but swap for a shared store
  (e.g. Redis) if you scale to multiple instances.

## Project structure

```
app/                  Routes (App Router): public form, login (Microsoft sign-in), /me, admin, API handlers
components/           UI components (nomination flow, employee home, admin dashboard, auth)
lib/                  Shared schemas, trait/country data, auth, Microsoft OAuth, scheduling, CSV, word matching
prisma/               Schema and seed script
```
