# Manual Claim Entry — Design Plan

## Goal

Let any user (free or Pro) split a bill by entering items by hand and having
each person tap to claim what they ate, without uploading a receipt photo. The
claim experience after items exist is identical to the current AI flow.

This unblocks: receipts the AI mis-parses, hand-written tabs, calls where one
person dictates while others claim, and offline scenarios.

## Out of scope

- Editing AI-parsed items inline (separate work — useful but bigger).
- Importing items from a CSV/text paste.
- Any Pro gating. **Manual entry is free for everyone.** AI scanning stays
  metered (current quota: 2/mo free, 15/mo Pro).

## UX flow

The existing "How to split" toggle (`Even | Claim | Custom`) keeps working.
When the user picks **Claim**, they see two side-by-side affordances:

```
┌────────────────────────────────────────────┐
│  Take photo or upload receipt              │  ← AI flow (existing)
│  AI will extract items for claiming        │
└────────────────────────────────────────────┘
                    or
┌────────────────────────────────────────────┐
│  + Enter items manually                    │  ← new
└────────────────────────────────────────────┘
```

Tapping "Enter items manually":

1. Creates the placeholder expense the same way the photo flow does today
   (`POST /api/tabs/[tabId]/expenses` with `receiptMode: true`).
2. Skips the upload + parse steps.
3. Reveals an empty item list with an inline "Add item" form (name, price,
   quantity).
4. Once any items exist, the regular `ClaimPanel` UI appears: tap initials to
   claim, see the live Split Summary.
5. Tax / fees / tip inputs become editable (not derived from a parsed receipt).
6. **Save expense** — same submit path as the AI flow, computes splits via
   `computeClaimSplits()` and PATCHes.

After the expense is saved, the detail page treats it identically to a
receipt-parsed expense — same claim UI, same edit-in-place semantics.

## Schema — no changes required

The existing models cover this:

- `ReceiptItem(expenseId, name, priceCents, quantity, sortOrder)` — already
  exists, used by the AI flow. Manual items are just `ReceiptItem` rows
  created without a parse step.
- `ReceiptItemClaim(receiptItemId, participantId)` — unchanged.
- `Expense.receiptUrl` becomes optional in this flow (it already is in the
  Prisma schema; only the parse route requires it).

We may want a soft signal on the expense like `Expense.itemSource` enum
(`"AI_PARSED" | "MANUAL"`) so analytics/quota logic can distinguish them, but
it's not required for v1 — `receiptUrl == null && receiptItems.count > 0`
is a reliable proxy.

## API surface

### Routes (all paths under `/api/tabs/[tabId]/expenses/[expenseId]`)

```
POST   /receipt/items                     name, priceCents, quantity?
PATCH  /receipt/items/[itemId]            name?, priceCents?, quantity?
DELETE /receipt/items/[itemId]            -
POST   /receipt/items/[itemId]/claims     participantId          (anyone)
DELETE /receipt/items/[itemId]/claims     participantId          (anyone)
PATCH  /                                  receiptSubtotal/Tax/FeeCents,
                                          tipMode, tipValue, splits, ...
```

The mutating item routes — POST/PATCH/DELETE on items — require the caller to
be the expense creator or tab owner. Claim toggling stays open to any
participant (intentional — that's the social model). All mutations require an
open tab (`requireOpenTab`).

### Phase 1 — what shipped

The receipt items POST/PATCH/DELETE endpoints already existed for the AI
flow. Phase 1 hardened and extended them:

- **Ownership check** added to POST/PATCH/DELETE on items (was: any
  participant could mutate; now: expense creator or tab owner only).
- **PATCH `/expenses/[expenseId]`** extended to accept `receiptSubtotalCents`,
  `receiptTaxCents`, `receiptFeeCents`. (Decided against a separate `/totals`
  route — fewer endpoints, same shape.) Tip percent auto-recomputes when
  subtotal changes so totals stay consistent.
- **No Pro gate** on any of these — `canScanReceipt` and the receipt quota
  only apply to the AI parse route (`/receipt/parse`), so manual entry is
  free for everyone.
- **Tests**: `tests/api/receipt-items.test.ts` — 12 cases covering 401/403
  ownership boundaries, validation (empty name, zero/negative price), tab
  scoping, and 200/201 happy paths for both creator and tab-owner callers.

## Free-tier gating

Manual entry **bypasses** all of these checks (they only apply to the parse
route):

- `canScanReceipt(userId)` — scan-only; not on the manual path.
- `getReceiptLimit / checkReceiptLimit / incrementReceiptUsage` — quota only
  ticks when AI parses.
- `requirePro(userId)` — never invoked here.

Translation: if the user opens an expense, taps **Enter items manually**,
adds 50 items, and saves — zero AI quota burned, no Pro pop-up.

## Edge cases / decisions

1. **What if the user uploads a photo *and* adds manual items?** Allow both;
   they merge into the same `ReceiptItem` list (sorted by `sortOrder`). We
   already de-dupe by row, not by content. `sortOrder` should be set to
   `MAX(sortOrder) + 1` when creating a manual item so it appears after AI
   items.

2. **Editing an AI-parsed item.** With the per-item PATCH endpoint, free
   users can fix AI mistakes by editing prices/names directly. Big UX win.

3. **Validating priceCents > 0.** Reuse `parseAmountToCents`. Reject 0 and
   negatives (covered by existing validator).

4. **Quantity field.** Keep optional, default 1. Display is informational —
   `priceCents` is the line total, not unit price (matches AI parser
   behavior). Document this in the form: "Price for this line item".

5. **Tax/fees/tip on manual entry.** The detail page already exposes a tip
   input. Add a similar inline editor for tax + fees in the new-expense form
   when `splitMode === "claim"` and there's no parsed receipt. The
   `/totals` endpoint persists them.

6. **What if no items are claimed but user hits Save?** Same handling as the
   bug we just fixed — block submit with "Claim at least one item".

7. **Mobile keyboard focus loop.** When tapping "Add item" inline, focus the
   name field; on Enter, save and focus the price field. Repeat until the
   user taps "Done." Avoid losing keyboard between fields (a real PartyTab
   pattern issue on iOS Safari today).

8. **Concurrent editors.** Two participants editing items at once — last
   write wins per-item (acceptable; items are independent rows).

## Implementation phases

**Phase 1 — backend** ✅ shipped
- Item routes already existed; added ownership checks (creator + tab owner).
- Extended expense PATCH with `receiptSubtotalCents`/`receiptTaxCents`/
  `receiptFeeCents` instead of adding a separate `/totals` endpoint.
- 12 vitest cases in `tests/api/receipt-items.test.ts`.
- `sortOrder` already wired (POST uses `MAX(sortOrder) + 1`).

**Phase 2 — new-expense flow** ✅ shipped
- "Enter items manually" affordance below the Claim panel upload UI.
- Inline add/edit/delete on items via the new `ManualItemEntry` and
  `ItemEditRow` components.
- Tax/fee inputs alongside the tip input when manual mode is active.
- `ClaimPanel` extended with `onStartManualEntry` / `onItemAdd` / `onItemEdit`
  / `onItemDelete` props — same panel handles AI and manual flows.
- Save guards: blocks when no items, blocks when nothing claimed.

**Phase 3 — detail-page parity** ✅ shipped
- Detail page now renders `<ClaimPanel>` instead of inline items UI
  (~150 lines deleted) — automatically inherits add/edit/delete affordances.
- Tax/fee inputs editable on the detail page (was read-only).
- Editable totals persist via the Phase 1 expense PATCH extension.
- Item handlers use immediate persistence (matches the page's existing
  claim-toggle behavior).
- Removed dead `getUniqueInitials` helper now that ClaimPanel owns
  initial generation.

**Phase 4 — polish**
- Empty state copy on the manual flow.
- Analytics: emit `item_added_manually` so we can see free-tier adoption.
- Optional: `Expense.itemSource` enum if the analytics signal proves useful.

## Success metrics

- % of new-expense submits that use manual entry vs AI parse (target: >25%
  of free-user submits within 30 days).
- AI-quota error rate drops (free users no longer hitting `2/mo` cap because
  they have a no-AI alternative).
- Drop in support reports of "AI parsed my receipt wrong."

## Open questions for review

1. Should manual entry default to "Claim" mode in the split selector, or
   keep "Even" as default and require an explicit toggle? Leaning Even
   default; manual claim is opt-in.
2. Do we want a "duplicate item" affordance (handy for "two of the same
   thing")? Probably yes — cheap to add.
3. Item names: cap at 80 chars? Match AI-parser cleaning rules?
