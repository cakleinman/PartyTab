# Changelog

## 2026-02-22 — Payment Methods + Account Settings

### Payment Methods

Users can save their Venmo, Zelle, PayPal, Cash App, or custom payment handles so payers don't have to ask "what's your Venmo?" every time.

- **Settings page** at `/settings` — full account management (profile, email, password, payment methods, notifications, account deletion)
- **5 payment types**: Venmo, Zelle, PayPal, Cash App, and free-text custom instructions
- **One per type** per user — upsert on save, simple remove button
- **Guest upgrade banner** — prompts guest users to create an account to save payment methods

### Settlement Page Integration

Payee's payment methods now appear inline on the settlement page when you owe someone.

- **Venmo deep link** — "Pay with Venmo" button opens the Venmo app pre-filled with amount and note, plus a web fallback link
- **Copy to clipboard** — one-tap copy for Zelle, PayPal, and Cash App handles
- **Custom instructions** — free-text payment info displayed as a block
- **Nudge** — if payee hasn't added payment methods, shows "Ask [name] to add payment details in Settings"

### Account Settings Page

New `/settings` page with full account management.

- **Profile** — edit display name, view auth provider
- **Email** — editable for email auth, read-only "Managed by Google" for OAuth
- **Password** — change password (email auth only, validates strength)
- **Notifications** — toggle email reminders on/off
- **Danger zone** — account deletion with "type DELETE to confirm" modal, anonymizes data

### Navigation

- **Header** — gear icon next to notification bell links to `/settings`
- **Tabs page** — "Settings" link in the account footer

### Database Migration

- Added `PaymentMethodType` enum (VENMO, ZELLE, PAYPAL, CASHAPP, CUSTOM)
- Added `PaymentMethod` model with `@@unique([userId, type])`
- Migration: `20260222000000_add_payment_methods`

### New API Routes

- `GET /api/me/payment-methods` — list user's payment methods
- `PUT /api/me/payment-methods` — upsert a payment method (one per type)
- `DELETE /api/me/payment-methods/[type]` — remove a payment method
- `POST /api/me/password` — change password (email auth only)
- `POST /api/me/delete` — soft-delete account (anonymize, remove PII)
- Expanded `GET /api/me` — now returns email, email preferences, payment methods
- Expanded `PATCH /api/me` — now accepts email and notification preference updates
- Expanded `GET /api/tabs/[tabId]/participants` — now includes payment methods per participant

---

## 2026-02-21 — Three-Layer Moat Strategy

### Layer 1: Estimated Expenses (Pre-Trip Planning)

Expenses can now be marked as estimates for budgeting before a trip or event.

- **Estimate toggle** on expense creation and edit forms
- **Visual cues**: dashed amber border + "~" prefix on estimated amounts, "(estimate)" label
- **Tab dashboard**: shows estimated vs confirmed totals breakdown
- **Confirm estimate**: one-click button to convert an estimate to a confirmed expense
- **Close tab warning**: alerts when estimates remain, with option to convert all and close
- **Settlement warning**: banner when settlement includes unconfirmed estimates

### Layer 2: Shareable Cards (Viral Distribution)

Tabs generate shareable summary cards with rich link previews for group chats and social media.

- **Share button** on tab dashboard (when estimates exist) and settlement page (when closed)
- **Public share page** at `/share/[token]` — read-only summary, no login required
- **OG image generation** — dynamic preview cards via Vercel `ImageResponse`
- **Two share moments**: pre-trip budget sharing and post-trip settlement sharing
- **Mobile-first**: uses `navigator.share()` with clipboard fallback
- **Security**: share token is separate from tab ID; only summary data exposed

### Layer 3: Free Receipt Scanning (Conversion Hook)

Receipt scanning is now available to all users with tiered monthly quotas.

- **Free users**: 2 scans/month (previously 0 — Pro-only)
- **Pro users**: 15 scans/month (unchanged)
- **Quota display**: remaining scan count shown on expense creation page
- **Item-level claiming**: works on all scanned receipts regardless of tier
- **Upgrade prompt**: shown when free quota is exhausted

### Database Migration

- Added `isEstimate` (boolean, default false) to Expense model
- Added `shareToken` (string, nullable, unique) to Tab model
- Migration: `20260221000000_add_estimate_and_share_token`

### New API Routes

- `GET /api/me/receipt-quota` — returns receipt scan quota info
- `POST /api/tabs/[tabId]/share` — generates share token
- `GET /api/tabs/[tabId]/share` — returns existing share URL
