# Phase 1 Audit Results — February 8, 2026

## 1A. Security Follow-Up

**Result: 9 PASS / 3 FAIL**

### Fixed Since Feb 1 Audit
- IDOR in acknowledgements — `requireParticipant()` added to both POST handlers
- Account enumeration — Registration returns generic "Unable to create account" error
- Cron endpoint auth — Returns 500 when `CRON_SECRET` is unset
- PIN hashing — Upgraded from SHA-256 to bcrypt with 10 salt rounds
- Password policy — Enforces uppercase, lowercase, digit, special char
- Session expiry — Guest cookies have 30-day `maxAge`
- Security headers — All 5 headers configured (X-Frame-Options, CSP, etc.)
- Stripe webhook verification — Signature check in place
- Next.js version — Updated to 16.1.6 (patched)

### Still Open

| Issue | Risk | Location | Fix |
|-------|------|----------|-----|
| Rate limiting missing on `/auth/register` and `/auth/merge-confirm` | HIGH | `app/api/auth/register/route.ts`, `app/api/auth/merge-confirm/route.ts` | Add `checkRateLimit()` or `checkGenericRateLimit()` |
| No security logging for failed auth attempts | MEDIUM | `app/api/signin/route.ts`, `app/api/auth/register/route.ts` | Add `console.warn` with IP on failures |
| Receipt parse checks Pro before authorization | LOW | `app/api/tabs/[tabId]/expenses/[expenseId]/receipt/parse/route.ts` | Reorder: auth → authz → feature check |

---

## 1B. Database Migration Drift

**Result: CRITICAL — 56% of schema missing from migrations**

### Summary
- Schema defines 27 models
- Baseline migration only creates 12 tables
- 15 tables have NO CREATE TABLE in any migration
- 3 existing tables have missing columns
- 1 enum missing (NotificationType)

### Missing Tables (15)
**Billing:** StripeCustomer, StripeSubscription, Entitlement, StripeEvent, ReceiptUsage, Receipt
**Notifications:** InAppNotification, PushSubscription, EmailPreference
**Reminders:** TabReminderSetting, TabReminderLog

### Missing Fields
- **User:** guestEmail, guestEmailConsentAt, guestEmailSetByUserId
- **Tab:** archivedAt
- **Expense:** receiptSubtotalCents, receiptTaxCents, receiptTipCents, receiptTipPercent, receiptFeeCents

### Impact
Running `prisma migrate reset` on a fresh database would break: Pro subscriptions, receipt scanning, notifications, reminders, and billing.

### Root Cause
Tables were created via `prisma db push` or manual SQL in Supabase, bypassing the migration system. The RLS migration references all 24 tables (proving they exist in production), but no CREATE TABLE migration was generated.

### Fix
Generate a consolidated migration to bring the history in sync:
```bash
npx prisma migrate dev --name add_missing_pro_notification_tables --create-only
```

---

## 1C. Test Coverage

**Result: 4.5% API route coverage, 0% component coverage**

### Current State
- 78 tests total (76 pass, 2 skipped)
- 11 test files (9 pass, 2 skipped — DB and smoke tests)
- 2 E2E tests (landing page + auth page rendering)
- No coverage tooling configured (v8 provider not installed)

### Coverage by Layer

| Layer | Tested | Total | Coverage |
|-------|--------|-------|----------|
| API Routes | 2 | 44 | 4.5% |
| Components | 0 | 19 | 0% |
| Lib Modules (well tested) | 4 | 33 | 12% |
| E2E User Flows | 0 | 5 critical | 0% |

### What IS Tested
- Settlement computation (13 tests)
- Custom tax/tip distribution (21 tests)
- Money allocation algorithms (7 tests)
- Reminder runner logic (15 tests)
- Feedback API route (11 tests)
- Save image API route (9 tests)
- Push notification server (3 tests)
- Email client formatting (3 tests)
- In-app notification creation (3 tests)

### Critical Gaps (Prioritized)
1. **Stripe webhook handler** — Processes payments, zero tests
2. **Account merge logic** — Transfers user data, zero tests
3. **Expense CRUD routes** — Core money tracking, zero tests
4. **Tab close + settlement generation** — Finalizes balances, zero tests
5. **API guards** — Authorization for all routes, zero tests
6. **Validators** — Input validation, zero tests
7. **Invite join flow** — Primary user acquisition, zero tests
8. **Receipt parsing** — AI-powered Pro feature, zero tests

### Recommended Test Schedule
- **Week 1:** Stripe webhook, account merge, expense CRUD
- **Week 2:** Tab lifecycle, participant management, guards + validators
- **Week 3:** E2E flows (guest PIN, OAuth settlement, Pro receipt)
- **Week 4:** Push notifications, billing, acknowledgements
