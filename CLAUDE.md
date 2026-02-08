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
| Storage | Supabase (receipt images) | — |
| Email | Postmark | — |
| AI | Anthropic Claude (receipt parsing) | claude-sonnet-4 |
| Rate Limiting | Upstash Redis (optional, in-memory fallback) | — |
| Push | Web Push (VAPID) | — |
| Testing | Vitest (unit), Playwright (E2E) | 3.x / 1.x |
| Deployment | Vercel | — |

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build (runs prisma generate first)
npm run start            # Start production server

# Database
npm run db:up            # Start Docker Postgres (port 5433)
npm run db:down          # Stop Docker Postgres
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations (dev)
npm run db:deploy        # Apply migrations (production)
npm run db:seed          # Seed demo data
npm run db:reset         # Reset DB + seed

# Testing
npm run test             # Vitest unit tests
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking
npm run format           # Prettier formatting
```

## Project Structure

```
app/
  api/                   # 44 REST API routes (Next.js Route Handlers)
  components/            # Shared React components
    split/               # Split mode UI (Even, Custom, Claim)
  hooks/                 # Custom React hooks (usePushNotifications)
  tabs/                  # Core app pages (tab dashboard, expenses, settlement)
  login/ signin/ register/ join/ claim/  # Auth flows
  blog/ use-cases/ compare/              # SEO/marketing pages

lib/
  api/                   # errors.ts, guards.ts, handler.ts, response.ts
  auth/                  # config.ts, pin.ts, password.ts, entitlements.ts, merge.ts, rate-limit.ts
  billing/               # usage.ts (receipt quota tracking)
  db/                    # prisma.ts (singleton client)
  email/                 # client.ts (Postmark + escapeHtml)
  money/                 # cents.ts (parsing/formatting), allocation.ts (proportional distribution)
  notifications/         # create.ts (in-app notifications)
  push/                  # server.ts (VAPID push)
  receipts/              # parser.ts (Claude AI receipt parsing)
  reminders/             # runner.ts (cron job logic)
  session/               # session.ts, parse.ts (cookie-based sessions)
  settlement/            # computeSettlement.ts (greedy algorithm), acknowledgement.ts
  stripe/                # client.ts, billing.ts (checkout, portal, sync)
  supabase/              # client.ts (storage for receipts)
  upstash/               # client.ts (Redis rate limiting)
  validators/            # schemas.ts (Zod), splits.ts (split validation)
  env.ts                 # Environment variable validation

tests/                   # Vitest unit tests
e2e/                     # Playwright E2E tests
prisma/                  # schema.prisma + migrations
scripts/                 # seed.ts, smoke.mjs
```

## Architecture Patterns

### API Route Pattern

All routes follow one of two patterns:

**Pattern 1 — Manual try/catch (most routes):**
```typescript
export async function POST(request: Request, { params }: { params: Promise<{ tabId: string }> }) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");
    const user = await getUserFromSession();
    if (!user) throwApiError(401, "unauthorized", "Unauthorized");
    await requireOpenTab(tabId);
    await requireParticipant(tabId, user.id);
    // ... business logic ...
    return ok({ data });
  } catch (error) {
    if (isApiError(error)) return error(error.status, error.code, error.message);
    return validationError(error);
  }
}
```

**Pattern 2 — `withApiHandler` wrapper (newer routes):**
```typescript
export const POST = withApiHandler<{ token: string }>(async (request, { params }) => {
  const { token } = await params;
  // Just throw errors — wrapper handles conversion
  return ok({ success: true });
});
```

### Guards (lib/api/guards.ts)

Use these to validate auth and authorization — they throw `ApiError` on failure:

- `getUserFromSession()` — Returns `User | null` (checks NextAuth then guest cookie)
- `requireUser(displayName?, pin?)` — Requires auth OR creates guest user
- `requireTab(tabId)` — Throws 404 if not found
- `requireOpenTab(tabId)` — Throws 404 if not found, 409 if closed
- `requireParticipant(tabId, userId)` — Throws 403 if not a participant

### Validators (lib/validators/)

Zod-based validators in `schemas.ts` — all throw `ZodError`:

- `parseUuid(value, label)`, `parseEmail(value)`, `parseDisplayName(value)`
- `parseTabName(value)`, `parseDescription(value)`, `parseDateInput(value)`
- `parseAmountToCents(value)`, `parseOptionalString(value, maxLength)`
- `EMAIL_REGEX` — Use for optional email checks (parseEmail throws ZodError, not ApiError)

Split validation in `splits.ts`:
- `parseSplits(body, totalCents, participantIds)` — Validates even/custom splits

### Response Helpers (lib/api/response.ts)

- `ok(payload)` — 200
- `created(payload)` — 201
- `noContent()` — 204
- `error(status, code, message, details?)` — Error JSON
- `validationError(err, status?)` — 400

### Error Codes

`validation_error` | `not_found` | `forbidden` | `unauthorized` | `tab_closed` | `not_participant` | `already_claimed` | `tab_limit_reached` | `pro_required` | `limit_exceeded` | `internal_error` | `email_exists` | `upgrade_required` | `rate_limited`

### Money Handling (lib/money/)

All money is in **USD cents** (integers). Never use floats for money.

- `parseCents(input)` — `"12.34"` → `1234`
- `formatCents(cents)` — `1234` → `"$12.34"`
- `distributeEvenSplit(totalCents, participantIds)` — Largest remainder method
- `allocateProportionally(items, total)` — Hamilton method (deterministic)
- `distributeCustomExtras(splits, taxCents, tipCents)` — Tax/tip distribution

### Settlement Algorithm (lib/settlement/)

Greedy algorithm that minimizes transfer count:
1. `computeNets()` — Calculate net balance per participant
2. `computeSettlement()` — Match largest debtor with largest creditor, repeat

## Database Schema (Key Models)

```
User → Tab (creator) → Participant (junction: User ↔ Tab)
                      → Expense → ExpenseSplit (per participant)
                                → ReceiptItem → ReceiptItemClaim
                      → Settlement → SettlementTransfer
                      → SettlementAcknowledgement (payment confirmations)
                      → Invite (shareable join tokens)
```

**Enums:** `TabStatus` (ACTIVE/CLOSED), `AuthProvider` (GUEST/EMAIL/GOOGLE), `SubscriptionTier` (GUEST/BASIC/PRO), `NotificationType`, `SettlementAcknowledgementStatus`

**Important:** Participant has its own `id` separate from `userId` — expense splits and settlements reference `participantId`, not `userId`.

## Authentication

Three auth modes coexist:

1. **Guest PIN** — 4-digit PIN + display name, stored in signed cookie (`partytab_session`)
2. **Email/Password** — NextAuth credentials provider, bcrypt hashed
3. **Google OAuth** — NextAuth Google provider

Guest accounts can be merged into authenticated accounts via `/auth/merge-confirm`.

## Pro Features

Gated by `canUseProFeatures(userId)` / `requirePro(userId)`:
- Receipt upload & AI parsing (Claude Vision)
- Item-level claiming ("I had the steak")
- Guest email capture with consent
- Manual payment reminders
- Higher receipt quota (15/month)

Billing via Stripe checkout → webhook sync → `Entitlement` table.

## Code Style

- **Formatting:** Prettier — double quotes, trailing commas, 100-char width
- **Linting:** ESLint 9 with Next.js core-web-vitals + TypeScript presets
- **TypeScript:** Strict mode. Path alias `@/*` maps to project root.
- **Imports:** Use `@/lib/...`, `@/app/...` absolute imports
- **Fonts:** Space Grotesk (headings), Work Sans (body)
- **CSS:** Tailwind 4 with custom CSS variables (sand, ink, teal, mint, orange palettes)
- **Components:** Prefer `'use client'` only when needed (forms, interactivity)
- **Shared utilities:** Always check `lib/` before creating new helpers. Key exports:
  - `LoadingSpinner` from `@/app/components/LoadingSpinner`
  - `escapeHtml` from `@/lib/email/client`
  - `EMAIL_REGEX` from `@/lib/validators/schemas`

## Testing

- **Unit tests** (`tests/`): Vitest. Mock external deps with `vi.mock()`. ~113 test cases.
- **E2E tests** (`e2e/`): Playwright on Chromium. Landing page + auth flows.
- **DB tests**: Skipped by default. Set `RUN_DB_TESTS=true` to enable.
- **Smoke tests**: Set `SMOKE_BASE_URL` for API contract tests against a running server.

## Environment Variables

**Required:**
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Cookie signing (32+ chars)
- `APP_BASE_URL` — Base URL for invite links
- `AUTH_SECRET` — NextAuth secret

**External services (optional, features degrade gracefully):**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL` — Billing
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Receipt storage
- `ANTHROPIC_API_KEY` — Receipt AI parsing
- `POSTMARK_SERVER_TOKEN`, `EMAIL_FROM` — Transactional email
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Rate limiting
- `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY` — Push notifications

## Deployment

- **Platform:** Vercel (auto-deploy from `main` branch)
- **Cron:** `/api/reminders/run` runs daily at 2 PM UTC
- **Redirect:** `partytab.vercel.app` → `partytab.app` (permanent)
- **CI:** GitHub Actions — lint, typecheck, test (parallel) → E2E (sequential)

## Gotchas

- `parseEmail()` throws `ZodError`, not `ApiError` — use `EMAIL_REGEX.test()` for optional email validation
- Participant `id` ≠ User `id` — splits and settlements use participant IDs
- Session parsing is in `lib/session/parse.ts` (extracted to avoid circular deps between auth config and session module)
- Guest cookie is `partytab_session` with HMAC-SHA256 signature — don't confuse with NextAuth session
- The `withApiHandler` wrapper is newer and not yet used in all routes — both patterns are valid
- Supabase is used ONLY for file storage (receipts) — all data lives in Prisma/PostgreSQL
- Rate limiting falls back to in-memory Maps when Upstash is not configured
