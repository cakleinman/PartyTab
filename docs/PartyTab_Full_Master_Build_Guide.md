
# PartyTab — FULL MASTER BUILD GUIDE (Codex Execution Document)
Version: v1.1 (Exhaustive)
Status: Implementation-ready
Deployment: Web-only MVP
Stack: Next.js + TypeScript + Prisma + Supabase Postgres + Vercel

ROLE DEFINITIONS:
- Human (You): Product owner, reviewer, decision-maker
- Codex (Builder): Executes this document step-by-step exactly as written
- This document is authoritative. If something is unclear, Codex should STOP and ASK.
- Codex must build the app in its entirety; partial implementations are not acceptable.

================================================================================
SECTION 1 — PRODUCT DEFINITION
================================================================================

## 1.1 What PartyTab Is

PartyTab is a lightweight shared-expense tracker designed for **temporary, bounded group events**
such as family gatherings, trips, and short-term projects.

The core philosophy:
- Track first
- Settle once
- Reduce mental and social friction
- End cleanly

## 1.2 What Problem PartyTab Solves

In group settings:
- People buy things for each other over days or weeks
- Expenses are forgotten or tracked mentally
- Money conversations become awkward
- Circular debts create unnecessary transfers

PartyTab solves this by:
- Centralizing expense tracking
- Showing *net-so-far* balances for awareness
- Computing a minimal settlement only at the end

## 1.3 Explicit Non-Goals

PartyTab is NOT:
- A payments app
- A budgeting app
- A long-term household ledger
- An accounting or reimbursement system
- A social network
- A finance optimization tool

These exclusions are intentional and must be enforced.

================================================================================
SECTION 2 — UX & PRODUCT PRINCIPLES
================================================================================

## 2.1 UX Principles

1. Low friction
2. No pressure
3. No urgency signaling
4. Calm, neutral language
5. Deterministic outcomes
6. Explicit closure

## 2.2 Language Rules

Allowed:
- "You owe $X"
- "You're owed $X"
- "Even so far"
- "Final amounts calculated when the tab closes"

Forbidden:
- "Debt"
- "Pay now"
- "Overdue"
- "Owes big time"

## 2.3 Visual Rules

- Mobile-first
- No red/green financial colors
- Typography conveys emphasis, not color
- No gamification
- No animations beyond spinners

================================================================================
SECTION 3 — TECH STACK (LOCKED)
================================================================================

Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:
- Next.js Route Handlers (REST)
- Prisma ORM

Database:
- Supabase Postgres (DB only, no Supabase Auth)

Auth:
- Minimal cookie-based session
- Invite-based onboarding
- Display name required

Hosting:
- Vercel

## 3.1 Environment Variables (Required)

- DATABASE_URL (Supabase Postgres connection string)
- DIRECT_URL (optional for Prisma migrations)
- SESSION_SECRET (min 32 chars, rotateable)
- APP_BASE_URL (used for invite link generation)
- NODE_ENV (controls cookie "secure" flag)

================================================================================
SECTION 4 — REPOSITORY STRUCTURE
================================================================================

partytab/
├─ PartyTab_Full_Master_Build_Guide.md   # this file
├─ PartyTab_Master_Build_Guide.md        # shorter summary guide
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                      # Landing
│  ├─ home/page.tsx                 # Tab list
│  ├─ tabs/new/page.tsx
│  ├─ join/[token]/page.tsx
│  ├─ tabs/[tabId]/page.tsx
│  ├─ tabs/[tabId]/expenses/page.tsx
│  ├─ tabs/[tabId]/expenses/new/page.tsx
│  ├─ tabs/[tabId]/expenses/[expenseId]/page.tsx
│  ├─ tabs/[tabId]/participants/page.tsx
│  ├─ tabs/[tabId]/settings/page.tsx
│  ├─ tabs/[tabId]/close/page.tsx
│  ├─ tabs/[tabId]/settlement/page.tsx
│  └─ api/
│     ├─ me/route.ts
│     ├─ tabs/route.ts
│     ├─ tabs/[tabId]/route.ts
│     ├─ tabs/[tabId]/close/route.ts
│     ├─ tabs/[tabId]/invites/route.ts
│     ├─ invites/[token]/route.ts
│     ├─ invites/[token]/join/route.ts
│     ├─ tabs/[tabId]/participants/route.ts
│     ├─ tabs/[tabId]/expenses/route.ts
│     ├─ tabs/[tabId]/expenses/[expenseId]/route.ts
│     └─ tabs/[tabId]/settlement/route.ts
├─ lib/
│  ├─ db/prisma.ts
│  ├─ money/cents.ts
│  ├─ settlement/computeSettlement.ts
│  ├─ session/session.ts
│  └─ validators/schemas.ts
├─ prisma/schema.prisma
├─ tests/settlement.test.ts
└─ README.md

================================================================================
SECTION 5 — DATA MODEL (PRISMA SPECIFICATION)
================================================================================

## 5.1 Models (Authoritative)

User:
- id (UUID)
- displayName (string, required)
- email (nullable)
- phone (nullable)
- createdAt
- updatedAt

Tab:
- id
- name (string, required)
- description (nullable)
- status (ACTIVE | CLOSED)
- startDate
- endDate (nullable)
- createdByUserId
- createdAt
- closedAt (nullable)

Participant:
- id
- tabId
- userId
- joinedAt
- unique(tabId, userId)

Invite:
- id
- tabId
- token (unique)
- createdAt
- revokedAt (nullable)

Expense:
- id
- tabId
- paidByParticipantId
- amountTotalCents (integer)
- note (nullable)
- createdByUserId
- createdAt
- updatedAt

ExpenseSplit:
- id
- expenseId
- participantId
- amountCents (integer)

Settlement:
- id
- tabId (unique)
- createdAt

SettlementTransfer:
- id
- settlementId
- fromParticipantId
- toParticipantId
- amountCents

## 5.2 Field Types and Defaults

- id: UUID, default uuid()
- createdAt: timestamp, default now()
- updatedAt: timestamp, auto-update on write
- startDate: date (YYYY-MM-DD), default to createdAt date
- endDate: date, nullable
- closedAt: timestamp, nullable
- status: enum ACTIVE | CLOSED (default ACTIVE)
- amountCents fields: integer, > 0
- token: string, 24+ chars, URL-safe
- All timestamps stored in UTC.

## 5.3 Data Rules and Constraints

- displayName: required, trimmed, 1-40 chars.
- tab name: required, trimmed, 1-80 chars; description: 0-240 chars.
- creator is auto-added as a Participant on tab creation.
- Invite tokens can be reused to join; revokedAt blocks new joins.
- ExpenseSplit participants must be unique per expense.
- Sum(ExpenseSplit.amountCents) must equal Expense.amountTotalCents.
- No destructive deletes in v1; use updates only, and only while ACTIVE.
- Expense edits allowed only by expense creator while tab is ACTIVE.
- Settlement and SettlementTransfer are write-once at close; never modified.

================================================================================
SECTION 6 — MONEY & SETTLEMENT ENGINE
================================================================================

## 6.1 Money Rules

- All money stored as integer cents
- UI converts string dollars ↔ cents
- No floating point math ever
- Parse inputs as USD-style decimals with up to 2 digits after the dot.
- Reject values with > 2 decimal places; no rounding.
- Even split remainder cents assigned deterministically by participantId sort.

## 6.2 Net Balance Definition

net = paid - owed

Interpretation:
- net > 0 → participant is owed money
- net < 0 → participant owes money
- net = 0 → settled

Sum of all nets MUST equal 0 or settlement fails.

## 6.3 Settlement Algorithm

1. Calculate net for all participants
2. Split into creditors and debtors
3. Sort deterministically
4. Greedy match debtor → creditor
5. Generate minimal transfers
6. Persist results at tab close

All results must be deterministic and test-covered.

Deterministic ordering rules:
- Creditors: net desc, then participantId asc
- Debtors: net asc (most negative first), then participantId asc
- Skip zero nets
- Each transfer amount is min(abs(debtor), creditor)

================================================================================
SECTION 7 — SESSION & AUTH MODEL
================================================================================

## 7.1 Session Strategy

- Anonymous-first
- Cookie-based session
- Session contains userId only
- Display name stored on User record

## 7.2 Session Rules

- If no session exists and a write action is attempted, require displayName,
  then create User and session.
- Session cookie is httpOnly + signed; secure in production; SameSite=Lax.
- Write routes call getOrCreateUser(); read routes may return unauthenticated responses.

## 7.3 Display Name Rules

- Required before creating a tab, joining a tab, or creating an expense.
- Can be updated via /api/me (PATCH) at any time.
- Not used for auth; only for display.

================================================================================
SECTION 8 — API CONTRACT (EXHAUSTIVE)
================================================================================

All endpoints are JSON, REST, and require Zod validation.

### 8.1 Standard Error Format

HTTP status + body:
{
  "error": {
    "code": "validation_error | not_found | forbidden | unauthorized | tab_closed | not_participant",
    "message": "human readable"
  }
}

### 8.2 Routes and Methods

/api/me
- GET: return current user (id, displayName)
- PATCH: update displayName

/api/tabs
- GET: list tabs for current user (ACTIVE and CLOSED)
- POST: create tab { name, description?, startDate? }

/api/tabs/{id}
- GET: tab detail (includes totals + current user net)
- PATCH: update tab { name?, description?, endDate? } (creator only, ACTIVE only)

/api/tabs/{id}/close
- POST: close tab (creator only); compute + persist settlement

/api/tabs/{id}/invites
- GET: list active invites (creator only)
- POST: create invite (creator only)

/api/invites/{token}
- GET: resolve invite, returns tab summary

/api/invites/{token}/join
- POST: join tab { displayName? } (creates user + participant)

/api/tabs/{id}/participants
- GET: list participants with nets

/api/tabs/{id}/expenses
- GET: list expenses (recent-first)
- POST: create expense { amount, note?, paidByParticipantId, splits[] }

/api/tabs/{id}/expenses/{expenseId}
- GET: expense detail
- PATCH: update expense (creator only, ACTIVE only)
- DELETE: soft-delete not supported; return 405

/api/tabs/{id}/settlement
- GET: settlement transfers (only if CLOSED)

### 8.3 Validation Rules (API)

- amount: string input; parse to cents with 2 decimal max; must be > 0.
- splits: array of { participantId, amountCents } or evenSplit flag.
- Even split: split across selected participantIds (defaults to all).
- Custom split: sum of amountCents must equal amountTotalCents.
- paidByParticipantId must be a participant in the tab.
- All writes require ACTIVE status; CLOSED returns tab_closed.
- Participants can read; only creators can close, rename, or manage invites.

### 8.4 Response Shapes (Required)

All responses are JSON with stable keys.

/api/me GET:
{
  "user": { "id": "uuid", "displayName": "string" }
}

/api/tabs GET:
{
  "tabs": [{
    "id": "uuid",
    "name": "string",
    "status": "ACTIVE | CLOSED",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD | null",
    "createdAt": "ISO",
    "closedAt": "ISO | null"
  }]
}

/api/tabs/{id} GET:
{
  "tab": {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "status": "ACTIVE | CLOSED",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD | null",
    "createdAt": "ISO",
    "closedAt": "ISO | null",
    "totalSpentCents": 12345,
    "yourNetCents": -500
  }
}

/api/tabs/{id}/participants GET:
{
  "participants": [{
    "id": "uuid",
    "displayName": "string",
    "netCents": 0
  }]
}

/api/tabs/{id}/expenses GET:
{
  "expenses": [{
    "id": "uuid",
    "amountTotalCents": 12345,
    "note": "string | null",
    "paidByParticipantId": "uuid",
    "createdAt": "ISO"
  }]
}

/api/tabs/{id}/expenses/{expenseId} GET:
{
  "expense": {
    "id": "uuid",
    "amountTotalCents": 12345,
    "note": "string | null",
    "paidByParticipantId": "uuid",
    "createdAt": "ISO",
    "splits": [{ "participantId": "uuid", "amountCents": 123 }]
  }
}

/api/tabs/{id}/settlement GET:
{
  "settlement": {
    "createdAt": "ISO",
    "transfers": [{
      "fromParticipantId": "uuid",
      "toParticipantId": "uuid",
      "amountCents": 123
    }]
  }
}

/api/invites/{token} GET:
{
  "invite": { "token": "string" },
  "tab": { "id": "uuid", "name": "string" }
}

================================================================================
SECTION 9 — UI SCREENS (DETAILED)
================================================================================

Each screen includes purpose, fields, primary actions, and required states.

- Landing: product intro, CTA create/join, if session exists link to Home.
- Home: list tabs (ACTIVE first), CTA "New Tab", empty state text.
- Create Tab: fields name, description, startDate (optional), displayName if missing.
- Join Tab: resolve invite token, show tab name, displayName if missing, join button.
- Active Dashboard: total spent, your net, participants list, recent expenses, add expense CTA.
- Add Expense: amount, note, paid by, split (even default), validate totals, submit.
- Expense List: list all expenses, search optional, empty state.
- Expense Detail: show amount, paid by, splits; edit if creator + ACTIVE.
- Participants: list participants with net so far, no removal.
- Settings: rename tab, description, invites list/create, close tab CTA (creator only).
- Close Confirmation: summary of nets, irreversible warning, confirm close.
- Settlement View: list transfers or "no one owes anything".
- Closed Dashboard: read-only view of totals and settlement.

Empty, loading, and error states REQUIRED for each.

================================================================================
SECTION 10 — BUILD ORDER (CODEX EXECUTION PLAN)
================================================================================

1. Scaffold Next.js app
2. Configure Supabase + Prisma
3. Implement schema + migrations
4. Build settlement engine + tests
5. Implement session system
6. Implement API routes
7. Build UI pages
8. Implement edge states
9. Deploy to Vercel
10. Smoke test with real users

================================================================================
SECTION 11 — ACCEPTANCE CRITERIA
================================================================================

PartyTab v1 is complete when:
- A real group uses it end-to-end
- Settlement math is trusted
- No one asks for explanation
- Closed tabs are immutable
- Scope creep is resisted

================================================================================
SECTION 12 — TESTING CHECKLIST
================================================================================

- Settlement unit tests cover: even split remainders, multi-creditor, multi-debtor,
  zero nets, deterministic ordering, and sum(net) == 0.
- API contract tests: validation errors, unauthorized access, tab_closed enforcement.
- Manual smoke: create tab, invite, join, add expense, view nets, close tab, view settlement.

================================================================================
SECTION 13 — DEPLOYMENT HANDOFF (CLAUDE CODE)
================================================================================

After local build is complete, Claude Code should:
- Verify auth: gh auth status, npx vercel whoami, supabase projects list.
- Link projects: npx vercel link --yes, supabase link --project-ref <ref>.
- Set env vars in Vercel: DATABASE_URL, DIRECT_URL (optional), SESSION_SECRET,
  APP_BASE_URL, NODE_ENV.
- Push DB schema: prisma migrate deploy (or supabase db push if migrations exist).
- Deploy web: npx vercel --prod --yes.
- Smoke test production: create tab, invite, join, add expense, close tab, view settlement.

Project IDs (fill in before handoff):
- Vercel project name: <vercel_project_name>
- Supabase project ref: <supabase_project_ref>

================================================================================
END OF FULL MASTER BUILD GUIDE
