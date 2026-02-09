# PartyTab — Claude Code Instructions

## What Is This?

PartyTab is a group expense-splitting web app. Users create tabs, invite friends, track expenses with even or custom splits, and settle up with minimal transfers. Pro subscribers get AI-powered receipt scanning, item-level claiming, and automated payment reminders.

**Production URL:** https://partytab.app

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript (strict) | 5.x |
| Database | PostgreSQL (Supabase-hosted) | 16 |
| ORM | Prisma | 6.x |
| Auth | NextAuth v5 (beta) | 5.0.0-beta.30 |
| Styling | Tailwind CSS | 4.x |
| Payments | Stripe | 20.x |
| Storage | Supabase (receipt images only) | — |
| Email | Postmark | — |
| AI | Anthropic Claude (receipt parsing) | claude-sonnet-4 |
| Rate Limiting | Upstash Redis (optional, in-memory fallback) | — |
| Testing | Vitest (unit), Playwright (E2E) | 3.x / 1.x |
| Deployment | Vercel (auto-deploy from `main`) | — |

## Commands

```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build (runs prisma generate)
npm run test             # Vitest unit tests (~91 cases across 11 files)
npm run test:e2e         # Playwright E2E tests
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking
npm run db:migrate       # Run Prisma migrations (dev)
npm run db:seed          # Seed demo data
npm run db:reset         # Reset DB + seed
```

## Project Structure

```
app/
  api/                   # ~44 route handlers (Next.js Route Handlers)
  components/            # Shared React components (including split/ subdirectory)
  hooks/                 # Custom hooks (usePushNotifications)
  tabs/                  # Core app pages (tab dashboard, expenses, settlement)
  auth/ login/ signin/ register/ join/ claim/  # Auth flows
  upgrade/ feedback/ demo/ how-it-works/       # App pages
  blog/ use-cases/ compare/ privacy/ terms/    # SEO/marketing/legal

lib/
  api/                   # errors.ts, guards.ts, handler.ts, response.ts
  auth/                  # config.ts, pin.ts, password.ts, entitlements.ts, merge.ts
  billing/               # usage.ts (receipt quota tracking)
  db/                    # prisma.ts (singleton client)
  email/                 # client.ts (Postmark + escapeHtml)
  money/                 # cents.ts (parsing/formatting), allocation.ts (distribution)
  notifications/         # create.ts (in-app notifications)
  push/                  # server.ts (VAPID push)
  receipts/              # parser.ts (Claude AI receipt parsing)
  reminders/             # runner.ts (cron job logic)
  session/               # session.ts, parse.ts (cookie-based sessions)
  settlement/            # computeSettlement.ts (greedy algorithm)
  stripe/                # client.ts, billing.ts (checkout, portal, sync)
  supabase/              # client.ts (storage for receipts)
  upstash/               # client.ts (Redis rate limiting)
  validators/            # schemas.ts (Zod), splits.ts (split validation)

tests/                   # Vitest unit tests
e2e/                     # Playwright E2E tests
prisma/                  # schema.prisma + migrations (3 migration files)
```

## Key Architecture

- **API patterns:** Two valid patterns — manual try/catch (most routes) and `withApiHandler`/`withSimpleApiHandler` wrappers (newer routes). Prefer wrappers for new routes. See `.claude/rules/api-patterns.md`.
- **Guards** (`lib/api/guards.ts`): `getUserFromSession()`, `requireUser()`, `requireTab()`, `requireOpenTab()`, `requireParticipant()`
- **Validators** (`lib/validators/schemas.ts`): `parseUuid()`, `parseEmail()`, `parseDisplayName()`, `parseAmountToCents()`, `parseSplits()`, `EMAIL_REGEX`
- **Money:** All USD cents (integers). Never floats. See `.claude/rules/database-and-money.md`.
- **Auth:** Three modes coexist — Guest PIN (cookie), Email/Password (NextAuth), Google OAuth (NextAuth). Guest merging via `/auth/merge-confirm`.
- **Pro features** gated by `canUseProFeatures(userId)`: receipt scanning, item-level claiming, reminders, 15/month receipt quota.

## Code Style

- **Formatting:** Prettier — double quotes, trailing commas, 100-char width
- **TypeScript:** Strict mode. Path alias `@/*` maps to project root.
- **Imports:** Use `@/lib/...`, `@/app/...` absolute imports
- **Components:** Prefer `'use client'` only when needed (forms, interactivity)
- **Shared utilities — check before creating new helpers:**
  - `LoadingSpinner` from `@/app/components/LoadingSpinner`
  - `escapeHtml` from `@/lib/email/client`
  - `EMAIL_REGEX` from `@/lib/validators/schemas`

## Gotchas

- `parseEmail()` throws `ZodError`, not `ApiError` — use `EMAIL_REGEX.test()` for optional email validation
- Participant `id` ≠ User `id` — expense splits and settlements reference `participantId`, not `userId`
- Session parsing is in `lib/session/parse.ts` (extracted to avoid circular deps)
- Guest cookie is `partytab_session` with HMAC-SHA256 — don't confuse with NextAuth session
- Supabase is used ONLY for file storage (receipts) — all data lives in Prisma/PostgreSQL
- Rate limiting falls back to in-memory Maps when Upstash is not configured

## Environment Variables

**Required:** `DATABASE_URL`, `SESSION_SECRET`, `APP_BASE_URL`, `AUTH_SECRET`

**Optional (features degrade gracefully):** `GOOGLE_CLIENT_ID`/`SECRET`, `STRIPE_SECRET_KEY` + price IDs, `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `POSTMARK_SERVER_TOKEN`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `PUSH_VAPID_PUBLIC_KEY`/`PRIVATE_KEY`

## Deployment

- **Platform:** Vercel (auto-deploy from `main`)
- **Cron:** `/api/reminders/run` daily at 2 PM UTC
- **CI:** GitHub Actions — lint, typecheck, test (parallel) → E2E (sequential)

## Maintenance

This file is checked by `scripts/check-claude-md.sh`. Run it after major changes to detect stale counts or missing entries. See `.claude/rules/maintenance.md` for update guidelines.
