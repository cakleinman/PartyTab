# PartyTab Audit Plan

**Created:** February 8, 2026
**Scope:** 7 audits across 3 phases, ordered by risk and impact

---

## Phase 1 — Security & Correctness (Critical)

These audits address potential user-facing risk. Do these first.

### 1A. Security Audit Follow-Up

**Goal:** Verify which of the 18 findings from the Feb 1 security audit are resolved and close remaining gaps.

**Checklist:**

- [ ] **IDOR in acknowledgements** — Verify `requireParticipant()` is called in:
  - `app/api/tabs/[tabId]/acknowledgements/route.ts` (POST)
  - `app/api/tabs/[tabId]/acknowledgements/confirm/route.ts` (POST)
- [ ] **Account enumeration** — Check if `app/api/auth/register/route.ts` still returns `email_exists` error code (should return generic message)
- [ ] **Cron endpoint auth** — Verify `app/api/reminders/run/route.ts` rejects requests when `CRON_SECRET` is unset (not just when it's set and mismatched)
- [ ] **PIN hashing** — Confirm `lib/auth/pin.ts` uses bcrypt (not SHA-256) with unique salts
- [ ] **Password policy** — Confirm `lib/auth/password.ts` enforces complexity (uppercase, lowercase, digit, special char)
- [ ] **Session expiry** — Confirm guest session cookie has `maxAge` set (should be 30 days)
- [ ] **Rate limiting coverage** — Verify rate limiting is applied to:
  - `app/api/signin/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/merge-confirm/route.ts`
- [ ] **Security logging** — Check if failed auth attempts are logged with IP address
- [ ] **Receipt parse auth ordering** — Verify Pro status is checked AFTER authorization (not before)

**Output:** Checklist with pass/fail status per item. File issues for anything still open.

**Estimated effort:** 1-2 hours (automated agents can parallelize the file reads)

---

### 1B. Database Migration Audit

**Goal:** Ensure the Prisma schema and migration history are in sync, and fresh deploys work.

**Checklist:**

- [ ] Run `npx prisma migrate diff --from-migrations --to-schema-datamodel` to detect drift
- [ ] Identify models in `schema.prisma` missing from migrations (billing, notifications, receipts, etc.)
- [ ] Verify the production database matches the schema (no manual DDL drift)
- [ ] Generate missing migration(s) to bring history up to date
- [ ] Test a clean `db:reset` + `db:seed` from scratch
- [ ] Verify `npm run build` succeeds with a fresh Prisma client generation

**Output:** Migration files that bring the history in sync. Verified clean deploy path.

**Estimated effort:** 1-2 hours

---

### 1C. Test Coverage Audit

**Goal:** Map what's tested vs. untested and create a prioritized backlog for filling gaps.

**Checklist:**

- [ ] Run Vitest with coverage enabled (`--coverage`) and record line/branch/function percentages
- [ ] Map all 44 API routes → which have tests, which don't
- [ ] Map all components → which have tests, which don't
- [ ] Identify the highest-risk untested code:
  - Settlement computation (has tests, but verify edge cases)
  - Stripe webhook handler (no tests)
  - Receipt parsing flow (no tests)
  - Account merge logic (no tests)
  - All CRUD routes for expenses, participants, tabs
- [ ] Identify missing E2E flows:
  - Create tab → add participants → add expense → view settlement
  - Guest PIN login → join via invite → add expense
  - Pro upgrade → receipt upload → AI parse → item claiming
- [ ] Produce a ranked backlog of tests to write, ordered by risk

**Output:** Coverage report + prioritized test backlog document.

**Estimated effort:** 2-3 hours (analysis only, not writing the tests)

---

## Phase 2 — Quality & Performance (Important)

These audits improve user experience and developer velocity. Do after Phase 1.

### 2A. Accessibility Audit

**Goal:** Identify WCAG 2.1 Level AA violations across key user flows.

**Checklist:**

- [ ] Run Lighthouse accessibility audit on:
  - Landing page (`/`)
  - Login page (`/login`)
  - Tab dashboard (`/tabs/[tabId]`)
  - Add expense form (`/tabs/[tabId]/expenses/new`)
  - Settlement page (`/tabs/[tabId]/settlement`)
- [ ] Check for:
  - Missing alt text on images
  - Insufficient color contrast (especially sand/ink palette)
  - Missing form labels and ARIA attributes
  - Keyboard navigation (tab order, focus traps in modals)
  - Screen reader compatibility (semantic HTML, ARIA roles)
  - Touch target sizes on mobile (minimum 44x44px)
- [ ] Audit custom components for a11y:
  - `NotificationBell` dropdown — keyboard accessible?
  - `ProPreviewModal` — focus trap? escape to close?
  - `SplitModeSelector` — radio group semantics?
  - `ToastProvider` — announced to screen readers?
  - `InfoTooltip` — accessible to keyboard/screen reader users?
- [ ] Check `<html lang="en">` is set in root layout
- [ ] Verify `prefers-reduced-motion` is respected for animations

**Output:** Ranked list of a11y violations with severity and fix recommendations.

**Estimated effort:** 3-4 hours (manual testing + automated scans)

---

### 2B. Performance Audit

**Goal:** Establish performance baseline and identify optimization opportunities.

**Checklist:**

- [ ] Run Lighthouse performance audit on key pages (same 5 as a11y audit)
- [ ] Measure Core Web Vitals:
  - LCP (Largest Contentful Paint) — target < 2.5s
  - FID/INP (Interaction to Next Paint) — target < 200ms
  - CLS (Cumulative Layout Shift) — target < 0.1
- [ ] Analyze bundle size:
  - Run `npx @next/bundle-analyzer` or check `.next/analyze`
  - Identify largest client-side chunks
  - Check for accidentally bundled server-only code
- [ ] Audit database queries:
  - Enable Prisma query logging temporarily
  - Check list endpoints for N+1 queries (expenses with splits, tabs with participants)
  - Check for missing database indexes on frequently queried fields
- [ ] Check image optimization:
  - Are receipt images served through Next.js Image component?
  - Are marketing images optimized (WebP, proper sizing)?
- [ ] Review `html2canvas` usage — is it lazy-loaded or bundled eagerly?
- [ ] Check for unnecessary client-side JS on server-renderable pages

**Output:** Performance scorecard + prioritized optimization backlog.

**Estimated effort:** 3-4 hours

---

## Phase 3 — Maintenance & Hygiene (Nice-to-Have)

These audits reduce tech debt and improve developer experience. Do when time allows.

### 3A. Dependency Audit

**Goal:** Ensure all dependencies are current, secure, and intentional.

**Checklist:**

- [ ] Run `npm outdated` to list stale packages
- [ ] Check NextAuth beta status — is there a newer beta or stable release?
- [ ] Check for deprecated packages (`npm ls --all | grep deprecated` or review warnings)
- [ ] Audit `devDependencies` — are any unused?
- [ ] Check if `html2canvas` can be replaced with lighter alternative (or if it's still needed)
- [ ] Verify `sharp` is listed as a dependency (required for Next.js Image in production)
- [ ] Review Stripe SDK version — any breaking changes or deprecations in the API version used (`2025-12-15.clover`)?

**Output:** List of packages to update/remove with risk assessment.

**Estimated effort:** 1 hour

---

### 3B. Repo Hygiene Audit

**Goal:** Clean up accumulated cruft and consolidate documentation.

**Checklist:**

- [ ] **Root-level markdown files** — Consolidate or archive:
  - `CI-FIX-SPEC.md` — ✅ Moved to `docs/`
  - `REMEDIATION-SPEC.md` — ✅ Moved to `docs/`
  - `ESLINT-WARNINGS-FIX.md` — ✅ Moved to `docs/`
  - `JAN9BUILDUPDATE.md` — ✅ Moved to `docs/`
  - `CODEX_CLI_TOOLS.md` — ✅ Moved to `docs/`
  - `CLAUDE START HERE.md` — ✅ Moved to `docs/`
  - `PartyTab_Full_Master_Build_Guide.md` — ✅ Moved to `docs/`
- [x] **Untracked files** — Decided:
  - `partytab-stickers/` — ✅ Moved to `marketing/assets/stickers/`
  - `custom-tax-tip-preview.html` — ✅ Moved to `docs/`
- [ ] **Marketing directory** — Review `marketing/campaigns/` for large assets that shouldn't be in git
- [ ] **Dead code scan** — Check for:
  - Unused exports in `lib/`
  - Unused components in `app/components/`
  - Unused API routes (any routes with no frontend callers?)
- [ ] **TypeScript strictness** — Scan for `any` types, `@ts-ignore`, `@ts-expect-error`
- [ ] **.gitignore review** — Ensure `.env`, `node_modules`, `.next`, large assets are excluded

**Output:** PR that cleans up the repo, or a task list for manual review.

**Estimated effort:** 2-3 hours

---

## Summary

| Phase | Audit | Priority | Effort | Risk Addressed |
|-------|-------|----------|--------|----------------|
| **1A** | Security Follow-Up | Critical | 1-2h | User data, auth bypass |
| **1B** | Database Migrations | Critical | 1-2h | Deploy failures, data loss |
| **1C** | Test Coverage | Critical | 2-3h | Regressions, blind spots |
| **2A** | Accessibility | Important | 3-4h | Usability, legal compliance |
| **2B** | Performance | Important | 3-4h | User experience, SEO |
| **3A** | Dependencies | Nice-to-have | 1h | Security, compatibility |
| **3B** | Repo Hygiene | Nice-to-have | 2-3h | Developer experience |

**Total estimated effort:** 13-19 hours across all phases

---

## Execution Notes

- **Phase 1 audits can run in parallel** — security, migrations, and test coverage are independent
- **Claude Code agents** can automate most of Phase 1 (file reads, grep searches, running commands)
- **Phase 2 requires a running dev server** for Lighthouse and browser-based testing
- **Phase 3 is safe to defer** but makes a good cleanup sprint
- Each audit produces either a fix PR or a backlog document — never just a report with no action items
