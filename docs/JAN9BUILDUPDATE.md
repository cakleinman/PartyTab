# PartyTab Pro — One-Shot Build Guide (Role-Split: Claude Setup vs Builder Coding)
**Date:** 2026-01-09  
**Primary goal:** Ship a single, clean **Pro** tier with **Stripe subscriptions + dunning + AI receipt parsing + automated reminders (in-app + web push + email)** with minimal rework and zero guesswork.

---

## 0) Non-Negotiable Roles (read first)

### ✅ Claude Code CLI is the **only** model allowed to do:
**Anything involving external services, CLIs, keys, credentials, dashboards, or environment variables**, including but not limited to:
- Stripe setup (products/prices, customer portal, webhooks)  
- **Stripe CLI installation + auth + webhook forwarding**
- Supabase setup via Supabase CLI (migrations, RLS, storage buckets, secrets)
- Vercel setup via Vercel CLI (env vars, cron schedule, deployments)
- Email provider setup (Postmark/SES/SendGrid) and keys
- Web Push VAPID key generation + secret storage
- Any other service integration if it becomes necessary (Sentry/PostHog/etc.)  
  **If a new external dependency appears, Claude owns it.**

### ✅ Codex / Gemini Code / Claude Code (in “builder mode”) can do:
- Application code implementation (API routes, UI, DB queries, service worker)
- Internal logic (entitlements, gating, reminder rules, allocation math)
- Tests, fixtures, and local dev wiring **that does not require creating or configuring external services**

### 🚫 Builders must NOT:
- Create Stripe products/prices
- Configure Stripe webhooks or portal settings
- Touch Supabase/Vercel secrets or environment variables
- Choose new third-party services
- “Make up” IDs, pricing, schedules, limits, or configuration values  
  **All constants are defined in this document.**

---

## 1) Locked Decisions (no guessing)
These values are fixed for this build. If you change one, update this doc **and** the code constants.

### 1.1 Pricing (Stripe Billing)
- **Pro Monthly:** **$3.99 / month**
- **Pro Annual:** **$34.99 / year** (discounted; strongly promoted)

> Rationale: At $3.99, Stripe’s $0.30 fixed fee is less brutal than at $3.00, and annual reduces churn + fees.

### 1.2 Dunning / grace behavior
- Stripe Smart Retries: **enabled**
- Past due grace window: **up to 14 days**
- During `past_due`: Pro features remain available, but show a persistent “Fix payment” banner

### 1.3 Pro feature scope (single tier)
Pro includes:
1) **AI receipt parsing** (upload receipt -> detect items -> assign items -> compute shares)
2) **Proportional tax/tip/fees allocation** across items
3) **Automated reminders** (in-app + web push + email) to settle tab

### 1.4 Receipt parsing limits (cost guardrail)
- Monthly receipt parsing soft limit: **15 receipts / user / calendar month**
- Enforcement: if limit exceeded -> block parse + show message
- Increment count **only after** a successful parse is persisted

### 1.5 Reminder defaults
- Default reminder schedule: **Day 3, Day 7, Day 14** (after reminders are enabled on a tab)
- Cooldown: **no more than 1 reminder per recipient per 48 hours**
- Channel priority: **Push first**, fallback to **Email**
- Never prompt push permission on first visit (only after a “value moment”)

### 1.6 Timezone for scheduling
- All reminder scheduling anchored to: **America/Los_Angeles**

---

## 2) System Overview (what we’re building)
### 2.1 Subscription state model (internal)
We will store an internal entitlement state:
- `FREE`
- `PRO_ACTIVE`
- `PRO_PAST_DUE` (grace)
- `PRO_CANCELED` (Pro removed after period end)

**Source of truth:** Stripe webhooks update DB entitlements.  
**App checks:** DB entitlements (never calls Stripe to decide gating).

### 2.2 Reminder channels (cheap-first)
1) In-app banner + “Remind now” (Pro-only)
2) Web Push (PWA installed + opted-in)
3) Email reminders (fallback)

**Explicit non-goal:** no SMS reminders.

---

## 3) Phase A — Claude Code CLI “SETUP ONLY” Tasks
Claude owns every item in this section end-to-end, including installing CLIs, creating resources, and setting env vars.

### A1) Install & authenticate Stripe CLI (required)
**Goal:** Stripe CLI working locally + webhook forwarding available.

Claude tasks:
- Install Stripe CLI (macOS via Homebrew):
  - `brew install stripe/stripe-cli/stripe`
- Login:
  - `stripe login`
- Verify:
  - `stripe version`

**Deliverable:** confirm Stripe CLI is installed and authenticated.

---

### A2) Create Stripe Product + Prices (locked values)
Claude tasks (Stripe dashboard or CLI):
- Create **Product:** `PartyTab Pro`
- Create **Price (monthly):** `$3.99` recurring monthly
- Create **Price (annual):** `$34.99` recurring yearly

**Deliverable:** record the Stripe Price IDs:
- `STRIPE_PRICE_PRO_MONTHLY=price_...`
- `STRIPE_PRICE_PRO_ANNUAL=price_...`

> These IDs must be placed into the app environment (Vercel + local dev).

---

### A3) Enable Stripe Customer Portal
Claude tasks:
- Enable Customer Portal
- Allow:
  - Update payment method
  - View invoices
  - Cancel subscription

**Deliverable:** portal enabled (no code changes required besides portal session endpoint).

---

### A4) Configure Stripe webhooks (prod + dev)
Claude tasks:
1) **Local dev webhook forwarding** (Stripe CLI):
   - Run: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
   - Capture the printed webhook signing secret:
     - `STRIPE_WEBHOOK_SECRET=whsec_...` (local)

2) **Production webhook endpoint** in Stripe dashboard:
   - Endpoint URL: `https://<your-domain>/api/stripe/webhook`
   - Subscribe to events (exact list):
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Capture production signing secret:
     - `STRIPE_WEBHOOK_SECRET_PROD=whsec_...` (prod)

**Deliverable:** dev + prod webhook secrets stored correctly in env.

---

### A5) Supabase (DB + storage) setup via Supabase CLI
Claude tasks:
- Ensure Supabase project is linked locally
- Create migrations for all required tables (see Section 4)
- Apply migrations
- Create/verify:
  - Storage bucket for receipt images (e.g., `receipts`)
  - RLS policies (as needed)
  - Service role access for server-side ops (no client leakage)

**Deliverable:** migrations applied; tables exist; storage bucket exists.

---

### A6) Email provider setup (choose ONE now; no ambiguity)
**Locked decision for this build:** **Postmark** (best DX, fast, reliable).  
Claude tasks:
- Create Postmark Server
- Verify sender signature/domain
- Create API token
- Store env vars:
  - `POSTMARK_SERVER_TOKEN=...`
  - `EMAIL_FROM=PartyTab <no-reply@yourdomain>`

**Deliverable:** sending credentials in env, ready for code.

> If you already have SES/SendGrid live, Claude may switch ONLY if it’s already configured; otherwise default is Postmark.

---

### A7) Web Push VAPID keys (required)
Claude tasks:
- Generate a VAPID keypair (one time)
- Store:
  - `PUSH_VAPID_PUBLIC_KEY=...`
  - `PUSH_VAPID_PRIVATE_KEY=...`

**Deliverable:** keys stored in env (local + prod).

---

### A8) Vercel setup via CLI (env + cron)
Claude tasks:
- Set environment variables on Vercel:
  - Stripe keys + price IDs + webhook secret
  - Postmark token + EMAIL_FROM
  - VAPID keys
  - Any DB/service role keys needed server-side
- Create a cron schedule that hits:
  - `POST https://<domain>/api/reminders/run`
- Cron timing (locked): **Daily at 09:00 America/Los_Angeles**
  - (Runner decides what’s due; daily cadence is enough with day-based schedules)

**Deliverable:** Vercel env configured + cron enabled.

---

## 4) Phase B — Builder Tasks (Codex/Gemini/Claude code building)
This section is pure application code + DB queries. No external configuration.

### B1) Database schema (must match; no improvising)
Create tables (names can vary if repo conventions require, but fields must exist):

#### `stripe_customers`
- `user_id` (PK/FK)
- `stripe_customer_id` (unique)
- `created_at`

#### `stripe_subscriptions`
- `user_id` (FK)
- `stripe_subscription_id` (unique)
- `stripe_price_id`
- `stripe_status` (raw: `active`, `past_due`, `canceled`, etc.)
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `cancel_at_period_end` (bool)
- `updated_at`

#### `entitlements`
- `user_id` (PK/FK)
- `plan` (`FREE` | `PRO`)
- `state` (`FREE` | `PRO_ACTIVE` | `PRO_PAST_DUE` | `PRO_CANCELED`)
- `effective_at` (timestamp)
- `expires_at` (timestamp nullable)
- `updated_at`

#### `stripe_events` (idempotency)
- `event_id` (unique)
- `type`
- `received_at`

#### `receipt_usage`
- `user_id`
- `month` (YYYY-MM string OR month-start date)
- `count`
- `updated_at`

#### `receipts`
- `id`
- `user_id`
- `tab_id`
- `image_storage_key`
- `parsed_items_json`
- `tax_total_cents`
- `tip_total_cents`
- `fees_total_cents`
- `allocation_json`
- `created_at`

#### `tab_reminder_settings`
- `tab_id`
- `enabled`
- `enabled_at`
- `schedule_days_json` (default `[3,7,14]`)
- `channel_push` (default true)
- `channel_email` (default true)
- `created_by_user_id`
- `updated_at`

#### `tab_reminder_log`
- `id`
- `tab_id`
- `recipient_user_id`
- `channel` (`push` | `email`)
- `sent_at`
- `status` (`sent` | `skipped` | `failed`)
- `reason` (text)

#### `push_subscriptions`
- `user_id`
- `endpoint`
- `p256dh`
- `auth`
- `created_at`
- `revoked_at` (nullable)

#### `email_preferences`
- `user_id`
- `reminder_emails_enabled` (default true)
- `unsubscribed_at` (nullable)

---

### B2) Stripe endpoints (code)
Implement these endpoints exactly (paths may vary by framework; keep names stable):

1) `POST /api/billing/checkout`
- Input: `plan = "monthly" | "annual"`
- Creates Stripe customer if missing
- Creates Stripe Checkout session (subscription mode)
- Uses the correct price ID from env
- Returns checkout URL

2) `POST /api/billing/portal`
- Returns Stripe portal session URL

3) `POST /api/stripe/webhook`
- Verifies signature
- Idempotency: store `event_id` in `stripe_events`
- Updates `stripe_subscriptions` and `entitlements`

**Stripe->Entitlement mapping rules (locked):**
- Stripe `active` => `PRO_ACTIVE`
- Stripe `past_due` or `unpaid` => `PRO_PAST_DUE`
- Stripe `canceled`/`incomplete_expired` => `PRO_CANCELED`
- If `cancel_at_period_end=true`, remain `PRO_ACTIVE` until `current_period_end`

---

### B3) Pro gating rules (server-side)
Create helper: `requirePro(userId)`
- Allow if entitlement state in (`PRO_ACTIVE`, `PRO_PAST_DUE`)
- Deny otherwise

UI rules:
- If `PRO_PAST_DUE`: show sticky banner + “Fix payment” -> portal
- If Free: show locked UI + “Upgrade”

---

### B4) Receipt parsing + allocation (math must be exact)
#### Usage limit (locked)
- Limit: **15/month**
- Deny parse if exceeded

#### Allocation algorithm (locked; cents-based)
Inputs:
- Item subtotals (cents) for items assigned to each person
- Tax/tip/fees totals (cents)

Method:
- Compute each item’s share ratio: `item_subtotal / sum_item_subtotals`
- Allocate `tax/tip/fees` proportionally to items in cents
- Use deterministic rounding:
  - Compute floor allocations
  - Distribute remainder cents to items with largest fractional remainders
- Ensure final sums match exactly:
  - Sum(item allocations) == total for each of tax/tip/fees

Deliverable:
- Unit tests verifying totals match exactly and allocations are deterministic.

---

### B5) Reminders MVP (Pro-only)
#### Eligibility checks (locked)
Before sending to a recipient:
- Tab is unsettled
- Reminders enabled
- Recipient is tab member
- Cooldown: last reminder to recipient for tab > **48 hours**
- If email: `email_preferences.reminder_emails_enabled=true`
- If push: recipient has at least one non-revoked push subscription

#### Schedule (locked)
- Due on enabled_at + 3 days, +7 days, +14 days  
Runner runs daily at 09:00 PT (cron), checks what’s due “today”.

#### Channel policy (locked)
- Attempt push first
- If no push available, send email
- Log every attempted send in `tab_reminder_log` (including skips)

Endpoints:
- `POST /api/reminders/run` (cron-only; protected)
- `POST /api/reminders/remind-now` (manual; Pro-only; rate-limited)

---

### B6) Web push (PWA)
Client:
- Service worker registration
- Push subscribe flow
- Post subscription to backend

Backend:
- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`

Permission prompt timing (locked):
- Only after:
  - Tab created OR expense added OR user taps “Enable reminders”
- Never on first load.

---

### B7) Email reminders
Provider: Postmark (locked in setup)

Requirements:
- 1 CTA button linking to tab
- Unsubscribe link

Endpoint:
- `GET /unsubscribe?token=...` sets `reminder_emails_enabled=false`

---

## 5) Phase C — Claude Verification (E2E “one-shot” checklist)
Claude runs these in order after builders complete Phase B.

### C1) Local Stripe test
- Start app locally
- Run `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
- Purchase Pro in Stripe test mode
- Confirm:
  - entitlements becomes `PRO_ACTIVE`
  - cancel_at_period_end keeps Pro until end
  - failed payment transitions to `PRO_PAST_DUE`
  - portal fixes payment -> returns to `PRO_ACTIVE`

### C2) Reminder test
- Enable reminders on a test tab
- Force-run: call `/api/reminders/run`
- Confirm:
  - push is attempted first for installed/opted-in device
  - fallback email sent otherwise
  - cooldown enforced
  - logs written for every recipient

### C3) Receipt limit test
- Perform 15 parses successfully
- Attempt 16th parse -> blocked with clear message
- Confirm usage counter only increments on success

### C4) Production readiness
- Confirm Vercel env set
- Confirm Vercel cron enabled
- Confirm Stripe prod webhook configured and verified
- Confirm Postmark sender verified

---

## 6) Deliverables Checklist (no missing pieces)
### Claude deliverables (setup)
- [ ] Stripe CLI installed + authenticated
- [ ] Stripe product + monthly/annual prices created
- [ ] Price IDs stored in env
- [ ] Customer portal enabled
- [ ] Dev + prod webhooks configured; secrets stored
- [ ] Supabase migrations applied + storage bucket created
- [ ] Postmark configured + token stored
- [ ] VAPID keys generated + stored
- [ ] Vercel env set + cron configured

### Builder deliverables (code)
- [ ] Billing endpoints: checkout + portal + webhook (idempotent)
- [ ] Entitlements table updated via webhook
- [ ] Pro gating server-side + UI banners
- [ ] Receipt usage limits enforced
- [ ] Allocation math exact + unit tested
- [ ] Reminders runner + eligibility rules + logs
- [ ] Push subscribe/unsubscribe + service worker
- [ ] Email sending + unsubscribe

---

## 7) Important guardrails (prevent rework)
- No model invents IDs, prices, limits, schedules, or endpoints.
- No one except Claude changes env vars or service configs.
- Stripe webhooks are the only authority for entitlements.
- Every reminder send is logged.
- Every receipt parse is usage-limited.

---

## 8) Open items (must be resolved now; owned by Claude)
These are the only “choices” remaining, and Claude must lock them before coding:
1) Confirm Postmark vs existing provider (default Postmark)
2) Confirm cron mechanism is Vercel Cron (default yes)
3) Confirm receipt image storage location (Supabase storage bucket `receipts`)

Once those are locked, builders proceed without interpretation.
