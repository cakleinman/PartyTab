# PartyTab — Claude Code Handoff (Start Here)

## Overview

PartyTab is a lightweight shared-expense tracker for short-lived group events.
Core flow: create tab → invite participants → track expenses (even/custom split)
→ view net balances → close tab → generate deterministic settlement transfers.

New in this build: **Settlement Acknowledgements** (payer marks paid, receiver confirms).
This is a social confirmation layer and does not change ledger math.

## Project Goals

- 100% local build/demo ready (no 3rd-party services required for local)
- Deterministic settlement engine
- Closed tabs are read-only
- Clean UI with calm, neutral language
- Demo mode for quick walkthroughs

## Document Map

- `PartyTab_Full_Master_Build_Guide.md`
  - Authoritative build spec and UX rules
- `PartyTab_Master_Build_Guide.md`
  - Shorter summary guide
- `README.md`
  - Local setup, scripts, and demo notes
- `docs/LOCAL_SETUP.md`
  - Clean-machine local setup instructions
- `docs/MORNING_CHECKLIST.md`
  - 10-minute demo checklist
- `docs/BLOCKERS.md`
  - Issues encountered (permissions/network)
- `CODEX_CLI_TOOLS.md`
  - CLI access notes from previous setup

## Main Code Map

- `app/` — Next.js App Router UI + API
  - `app/page.tsx` — landing
  - `app/home/page.tsx` — tab list
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

## Service Credentials Checklist

Fill these in before deployment:

- GitHub repo: <owner>/<repo>
- Vercel project: <vercel_project_name>
- Supabase project ref: <supabase_project_ref>

Confirm authentication:

```bash
gh auth status
npx vercel whoami
supabase projects list
```

## Handoff Checklist (Claude Code)

Follow this in order:

1) Clean install

```bash
sudo rm -rf node_modules .next
npm install
```

2) Local DB

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
```

3) Tests + build

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm start
```

4) Demo walkthrough

- Visit `/demo` and reset
- Open active tab and add even/custom expense
- Participants show “You” badge
- Close tab and view settlement
- Confirm acknowledgements

5) Third‑party services setup

- GitHub: `gh auth status`, create repo if needed
- Supabase: link project, set DB URLs
- Vercel: link + env vars + deploy

## Expected Success Signals

- `npm run test` passes
- `npm run build` succeeds
- `/demo` reset works and creates seeded tabs
- Settlement acknowledgements can be marked/confirmed on closed tab
- Production deploy runs without errors

## Notes

- Local demo uses docker Postgres (`DATABASE_URL_LOCAL`).
- Settlement acknowledgements require CLOSED tabs and matching transfers.
- Use `docs/BLOCKERS.md` if any previous issues reappear.
