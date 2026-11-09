# Keepflow — waitlist

The pre-launch waitlist for **Keepflow**, a personal AI agent for people building something of their own.

A single landing page with a working signup flow, referral positions, email confirmation, unsubscribe handling, and a password-protected admin dashboard with CSV export.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase (Postgres), Resend
- **Live copy:** “Your day, quietly handled.”
- **Launch window shown on site:** Spring 2027

## Quick start

Requirements: Node.js 20.9+ and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

For local development, the app defaults to a file-backed store at `.data/waitlist.json`. No Supabase or Resend account is needed to click through the flow. Email is skipped when Resend is not configured, and the form reports that the confirmation email was not sent.

Set a local admin secret in `.env.local` to use `/admin`:

```dotenv
ADMIN_SECRET=local-development-secret-at-least-16-chars
IP_HASH_SALT=local-development-salt
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | Public origin, no trailing slash, e.g. `https://keepflow.app`. Used for canonical URLs, OG tags, referral links, and unsubscribe links. |
| `SUPABASE_URL` | Production | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Server-only key. Never expose it to the browser. |
| `RESEND_API_KEY` | Production | Resend API key for confirmation email. |
| `RESEND_FROM_EMAIL` | Production | Verified sender, e.g. `Keepflow <hello@yourdomain.com>`. |
| `ADMIN_SECRET` | Production | Admin login secret. Minimum 16 characters; use a long random value. |
| `IP_HASH_SALT` | Production | Salt for hashed IPs used in rate limiting. Never reuse across environments. |
| `WAITLIST_ALLOW_FILE_STORE` | Local only | Set to `true` to allow the file store in a production build. |
| `WAITLIST_PREVIEW_STORE` | Preview only | Set to `file` to allow the ephemeral file store on a preview deployment. |
| `WAITLIST_FILE_PATH` | Optional | Override the file store path (defaults to `.data/waitlist.json`, or `/tmp/keepflow-waitlist.json` on Vercel). |

Storage selection:

1. If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, Supabase is used.
2. Otherwise the file store is used in development, or in production only when explicitly allowed.
3. Otherwise the API returns `503` rather than pretending a signup was saved.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/migrations/20261109000000_waitlist.sql`](supabase/migrations/20261109000000_waitlist.sql) in the SQL editor or with the Supabase CLI.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your environment.

The migration creates the waitlist table, indexes, row-level security policies, and the trigger that prevents credit for unsubscribed referrers. The app uses the service-role key only on the server.

## Resend setup

1. Create a Resend account and verify the sending domain.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
3. The confirmation email includes the subscriber's position, private referral link, and unsubscribe link.

Without Resend credentials, signups still work but no email is sent. The UI and API report `emailSent: false`.

## Admin

- URL: `/admin`
- Login uses `ADMIN_SECRET`.
- Session: signed cookie, HTTP-only, 8 hours.
- Dashboard: total signups, priority count, referrals, daily chart, recent entries, CSV export.
- CSV export requires an authenticated session.

If `ADMIN_SECRET` is missing or shorter than 16 characters, admin login is disabled.

## Scripts

```powershell
npm run dev        # local development
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # unit tests (Vitest)
npm run test:e2e   # Playwright E2E (builds and serves on port 3100)
npm run lighthouse # Lighthouse against localhost:3000
```

The E2E suite uses an isolated file store and test secrets from `playwright.config.ts`. It covers signup, referral credit, duplicates, validation, honeypot, admin login/export/logout, unsubscribe, and reactivation.

## Deploy to Vercel

1. Import the repository in Vercel, or run `vercel` from this directory.
2. Add the production environment variables from the table above.
3. Deploy.

For a quick preview without credentials:

```powershell
npx vercel@latest deploy --temporary -y
```

Add `WAITLIST_PREVIEW_STORE=file` in the Vercel project settings if you want the preview signup flow to work. A temporary deployment is unclaimed and expires; claim it in the Vercel dashboard if you want to keep it.

### Preview limits

A deployment without Supabase and Resend is a **demo, not a production waitlist**:

- File storage on Vercel lives in `/tmp`, which is ephemeral, per-instance, and lost on redeploy or cold start.
- No confirmation email is sent without Resend credentials.
- Rate limiting is in-memory and per instance. A real multi-instance launch should use a shared store such as Upstash Redis.
- Admin access requires `ADMIN_SECRET` to be set in the deployment environment.

## Before launch

- [ ] Replace the placeholder contact email `hello@keepflow.app` in `lib/site.ts` and the legal pages with a real, monitored address.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] Run the Supabase migration against the production project.
- [ ] Verify the Resend sending domain and send a real test signup.
- [ ] Set a long random `ADMIN_SECRET` and a unique `IP_HASH_SALT`.
- [ ] Confirm the privacy policy and terms match the final business details.
- [ ] Run Lighthouse against the production URL and review mobile performance.

## Project layout

```text
app/                 routes, metadata, legal pages, API handlers
components/          landing page sections, forms, admin UI
lib/store/           file and Supabase waitlist adapters
lib/                 auth, email, validation, rate limiting, helpers
supabase/migrations/ production schema
e2e/                 Playwright end-to-end suite
```

## License

Private and unlicensed. All rights reserved.
