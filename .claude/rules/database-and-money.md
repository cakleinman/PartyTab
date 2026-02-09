# Database Schema & Money Handling

## Core Models

```
User → Tab (creator) → Participant (junction: User ↔ Tab)
                      → Expense → ExpenseSplit (per participant)
                                → ReceiptItem → ReceiptItemClaim
                      → Settlement → SettlementTransfer
                      → SettlementAcknowledgement (payment confirmations)
                      → Invite (shareable join tokens)
```

## Pro/Billing Models

```
User → StripeCustomer (1:1) → StripeSubscription
     → Entitlement (plan state)
     → ReceiptUsage (monthly receipt scan quota)
     → Receipt (parsed receipt data)
```

## Notification Models

```
User → InAppNotification
     → PushSubscription
     → EmailPreference
Tab  → TabReminderSetting → TabReminderLog
```

## Enums

`TabStatus` (ACTIVE/CLOSED), `AuthProvider` (GUEST/EMAIL/GOOGLE), `SubscriptionTier` (GUEST/BASIC/PRO), `NotificationType` (PAYMENT_RECEIVED/PAYMENT_CONFIRMED/PAYMENT_REMINDER), `SettlementAcknowledgementStatus`

## Critical: Participant ID ≠ User ID

Participant has its own `id` separate from `userId`. Expense splits and settlements always reference `participantId`, never `userId` directly.

## Money Handling (lib/money/)

All money is in **USD cents** (integers). Never use floats for money.

- `parseCents(input)` — `"12.34"` → `1234`
- `formatCents(cents)` — `1234` → `"$12.34"`
- `distributeEvenSplit(totalCents, participantIds)` — Largest remainder method
- `allocateProportionally(items, total)` — Hamilton method (deterministic)
- `distributeCustomExtras(splits, taxCents, tipCents)` — Tax/tip distribution for custom splits

## Settlement Algorithm (lib/settlement/)

Greedy algorithm that minimizes transfer count:
1. `computeNets()` — Calculate net balance per participant
2. `computeSettlement()` — Match largest debtor with largest creditor, repeat
