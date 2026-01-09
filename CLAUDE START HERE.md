# PartyTab — Claude Code Handoff (Start Here)

## Overview

PartyTab is a lightweight shared-expense tracker for short-lived group events.
Core flow: create tab → invite participants → track expenses (even/custom split)
→ view net balances → close tab → generate deterministic settlement transfers.

New in this build: **Settlement Acknowledgements** (payer marks paid, receiver confirms).
This is a social confirmation layer and does not change ledger math.

## Quick Resume (read first)

- Core flow works end-to-end via API checks (create tab → invite/join → expenses → close → settlement → acknowledgements).
- Lint/typecheck/test/build are green; API contract tests pass when `SMOKE_BASE_URL` is set.
- Supabase is linked (`tygdysxknxzkqqdkazxn`); baseline migration is created and marked applied.
- Demo data is seeded in Supabase (see `scripts/seed.ts` output below).
- Remaining: receipt parsing flow (Step 7) and production deploy (Step 10), plus a human UI walkthrough.

## Project Goals

- 100% local build/demo ready (no 3rd-party services required for local)
- Deterministic settlement engine
- Closed tabs are read-only
- Clean UI with calm, neutral language
- Demo mode for quick walkthroughs

## Document Map

- `PartyTab_Full_Master_Build_Guide.md`
  - Authoritative build spec and UX rules
- `README.md`
  - Local setup, scripts, and demo notes
- `docs/LOCAL_SETUP.md`
  - Clean-machine local setup instructions
- `docs/MORNING_CHECKLIST.md`
  - 10-minute demo checklist (includes optional receipt flow)
- `docs/BLOCKERS.md`
  - Issues encountered (permissions/network)
- `CODEX_CLI_TOOLS.md`
  - CLI access notes from previous setup

## Main Code Map

- `app/` — Next.js App Router UI + API
  - `app/page.tsx` — landing
  - `app/tabs/page.tsx` — tab list
  - `app/tabs/[tabId]/page.tsx` — dashboard
  - `app/tabs/[tabId]/expenses/` — list + create + detail
  - `app/tabs/[tabId]/participants/` — net list + “You” badge
  - `app/tabs/[tabId]/settings/` — invites + settings
  - `app/tabs/[tabId]/close/` — close tab
  - `app/tabs/[tabId]/settlement/` — settlement + acknowledgements
  - `app/demo/` — dev-only reset + demo links
  - `app/api/` — REST endpoints (see routes under `tabs/`, `invites/`, `dev/`)

- `lib/`
  - `lib/db/prisma.ts` — Prisma client
  - `lib/env.ts` — env validation + friendly error
  - `lib/money/cents.ts` — cents parsing/formatting + even split
  - `lib/settlement/computeSettlement.ts` — settlement algorithm
  - `lib/settlement/acknowledgement.ts` — acknowledgement logic
  - `lib/validators/schemas.ts` — Zod validators

- `prisma/schema.prisma` — DB schema (includes SettlementAcknowledgement)
- `scripts/seed.ts` — seed demo data
- `tests/` — vitest test suite

## Environment Quick‑Start

Required env vars (local or prod):

- `DATABASE_URL` or `DATABASE_URL_LOCAL`
- `SESSION_SECRET` (32+ chars)
- `APP_BASE_URL` (http://localhost:3000 for local)
- `NODE_ENV` (development/production)

If env vars are missing, the app will render a friendly setup screen.

Optional (receipt upload + parsing):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Service Credentials Checklist

Fill these in before deployment:

- GitHub repo: <owner>/<repo>
- Vercel project: partytab (`.vercel/project.json` has project + org IDs)
- Supabase project ref: tygdysxknxzkqqdkazxn (linked)

Confirm authentication:

```bash
gh auth status
npx vercel whoami
supabase projects list
```

## Current Status (last verified)

- [x] `npm run lint` (eslint)
- [x] `npm run typecheck`
- [x] `npm run test` (DB tests skipped unless `RUN_DB_TESTS=true`)
- [x] `npm run build` (requires network for Google Fonts)
- [x] `SMOKE_BASE_URL=http://localhost:3002 npm run test` (API contract coverage)
- [x] Supabase linked to `tygdysxknxzkqqdkazxn`
- [x] `npx prisma db push` reports schema in sync
- [x] Baseline migration created and marked applied (`20260107164923_baseline`)
- [x] `npm run smoke` against local dev server (uses PINs)
- [x] Auth flows validated via API (guest PIN sign-in, closed-tab join, merge-confirm)
- [x] Demo seed ran against Supabase
  - Active tab: `a0b48004-1fe4-45ce-b6c4-ec50ae87cf5d`
  - Closed tab: `d51c3892-e5fd-4126-abb4-e3eb6b1ab29d`

## Remaining Tasks

- [ ] Optional local Docker DB setup (`npm run db:up`, then `npm run db:migrate`, `npm run db:seed`)
- [ ] Manual UI walkthrough (see `docs/MORNING_CHECKLIST.md` for steps)
- [ ] Receipt parsing flow (Step 7; requires Supabase Storage + Anthropic keys)
  - Follow the optional receipt flow in `docs/MORNING_CHECKLIST.md`

- [ ] Production deploy (Vercel link + env vars + `npm run db:deploy` + deploy + smoke)

## Production Deploy Checklist (Step 10)

1) Confirm Vercel project link (`.vercel/project.json` should exist).
2) Set Vercel env vars:
   - Required: `DATABASE_URL`, `SESSION_SECRET`, `APP_BASE_URL`, `NODE_ENV=production`
   - NextAuth (if Google sign-in is enabled): `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Receipts (if enabled): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`
3) Run migrations: `npm run db:deploy`
4) Deploy: `npx vercel --prod --yes`
5) Post-deploy smoke: `SMOKE_BASE_URL=https://<prod-url> npm run smoke`

## Expected Success Signals

- `npm run test` passes
- `npm run build` succeeds
- `/demo` reset works and creates seeded tabs
- Settlement acknowledgements can be marked/confirmed on closed tab
- Production deploy runs without errors

## Notes

- Local demo uses docker Postgres (`DATABASE_URL_LOCAL`).
- Production DB uses Prisma migrations (`npm run db:deploy`).
- Settlement acknowledgements require CLOSED tabs and matching transfers.
- Use `docs/BLOCKERS.md` if any previous issues reappear.
- `npm run dev` may use port 3001+ if 3000 is taken; update `SMOKE_BASE_URL` accordingly.
- Build logs show a deprecation warning for `middleware.ts` (optional cleanup).
- Receipt upload/parse endpoints will throw if Supabase/Anthropic env vars are missing.
- Prisma migrations live in `prisma/migrations` (baseline applied); new schema changes should use `npm run db:migrate`.
- Supabase CLI link state lives in `supabase/.temp` (ignored by git).
