# Changelog

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
