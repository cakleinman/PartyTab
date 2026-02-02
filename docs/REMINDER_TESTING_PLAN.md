# PartyTab Reminder Features Testing Plan

## Overview

This document outlines a comprehensive testing strategy for the PartyTab reminder features. The reminder system is a **Pro-exclusive feature** that allows creditors to send payment reminders to debtors through multiple channels (push, email, in-app).

## Current Test Coverage

**Existing tests:** `tests/acknowledgements.test.ts` covers the acknowledgement workflow (payment confirmation), but there are **no tests** for:
- Reminder runner/scheduler
- Manual reminder sending
- Push/email/in-app notification delivery
- Rate limiting and cooldowns
- API endpoints

---

## Test Categories

### 1. Unit Tests - Reminder Runner (`lib/reminders/runner.ts`)

Create: `tests/reminders/runner.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **Schedule Calculation** |||
| `calculates days since enabled correctly` | Enable date 3 days ago, check daysSince | Returns ~3 |
| `matches default schedule [3,7,14]` | Test day 3, 7, 14 after enablement | Returns true for each |
| `skips non-matching days` | Test day 5, 10, 20 after enablement | Returns false |
| **Debtor/Creditor Identification** |||
| `identifies creditors with positive net balance` | User with net +$50 | Identified as creditor |
| `identifies debtors with negative net balance` | User with net -$50 | Identified as debtor |
| `skips users with zero balance` | User with net $0 | Not included in reminders |
| **Pro Subscription Check** |||
| `only sends reminders from Pro creditors` | Non-Pro creditor owes money | No reminders sent |
| `sends reminders when creditor is Pro` | Pro creditor owes money | Reminders sent to debtors |
| **48-Hour Cooldown** |||
| `respects 48-hour cooldown` | Reminder sent 24 hours ago | Reminder skipped |
| `sends reminder after cooldown expires` | Reminder sent 49 hours ago | Reminder sent |
| `force=true bypasses cooldown` | force flag, reminder sent 1 hour ago | Reminder sent |
| **Channel Fallback** |||
| `tries push first when subscription exists` | Active push subscription | Push attempted first |
| `falls back to email when push fails` | Push fails, email available | Email sent |
| `creates in-app notification regardless` | Any scenario | In-app notification created |
| `skips email if user unsubscribed` | User has reminderEmailsEnabled=false | Email skipped, in-app only |

### 2. Unit Tests - Email Client (`lib/email/client.ts`)

Create: `tests/email/client.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `sends creditor reminder email with correct template` | Valid email params | Email sent via Postmark |
| `formats amount correctly` | Amount 5000 cents | Shows "$50.00" |
| `HTML-escapes user names` | Name with `<script>` tag | Escaped in output |
| `includes correct unsubscribe URL` | Valid user | URL contains user token |
| `sends payment pending email` | Payment initiated | Email sent to payee |

### 3. Unit Tests - Push Server (`lib/push/server.ts`)

Create: `tests/push/server.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `sends push notification successfully` | Valid subscription | Returns `{ success: true }` |
| `handles expired subscription (410)` | Expired endpoint | Returns `{ success: false, expired: true }` |
| `handles network errors gracefully` | Network timeout | Returns `{ success: false }` |
| `includes correct payload format` | Any notification | Payload has title, body, url |

### 4. Unit Tests - In-App Notifications (`lib/notifications/create.ts`)

Create: `tests/notifications/create.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `creates notification with correct type` | PAYMENT_REMINDER type | Record saved with type |
| `stores navigation URL` | Tab URL provided | URL saved in record |
| `defaults read to false` | New notification | read=false |

---

## Integration Tests - API Endpoints

### 5. API: `/api/reminders/run` (Cron Entry Point)

Create: `tests/api/reminders-run.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **Authentication** |||
| `rejects request without bearer token` | No Authorization header | 401 Unauthorized |
| `rejects request with wrong token` | Invalid CRON_SECRET | 401 Unauthorized |
| `accepts valid CRON_SECRET` | Correct bearer token | 200 OK |
| **Execution** |||
| `processes tabs with enabled reminders` | Tab with reminders enabled | Reminders processed |
| `skips tabs without reminder settings` | No TabReminderSetting | Tab skipped |
| `returns summary counts` | Multiple tabs processed | `{ sent, skipped, failed }` |

### 6. API: `/api/reminders/remind-now` (Manual Trigger)

Create: `tests/api/remind-now.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **Authorization** |||
| `rejects unauthenticated request` | No session | 401 Unauthorized |
| `rejects non-Pro user` | Free user | 403 Pro required |
| `accepts Pro user` | Pro subscription | 200 OK |
| **Validation** |||
| `requires tabId in body` | Missing tabId | 400 Bad Request |
| `validates user is tab participant` | Non-participant | 403 Forbidden |
| **Execution** |||
| `triggers reminders for tab` | Valid Pro user + tab | Reminders sent |
| `respects 48-hour cooldown` | Recent reminder sent | Reminder skipped |

### 7. API: `/api/tabs/[tabId]/reminders/send` (Targeted Reminder)

Create: `tests/api/reminders-send.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **Authorization** |||
| `rejects unauthenticated request` | No session | 401 Unauthorized |
| `rejects non-Pro user` | Free user | 403 Pro required |
| `rejects non-participant` | User not in tab | 403 Forbidden |
| `rejects debtor sending reminder` | Negative net balance | 403 Only creditors |
| **Validation** |||
| `requires debtorParticipantId` | Missing ID | 400 Bad Request |
| `validates debtor is in tab` | Invalid participant | 404 Not Found |
| `validates debtor has negative balance` | Zero/positive balance | 400 Not a debtor |
| **Rate Limiting** |||
| `enforces 24-hour manual rate limit` | Reminder sent 1 hour ago | 429 Too Many Requests |
| `allows after 24 hours` | Reminder sent 25 hours ago | 200 OK |
| **Execution** |||
| `sends email when available` | Debtor has email | Email sent |
| `falls back to in-app only` | No email/push | In-app notification only |
| `logs reminder in TabReminderLog` | Any successful send | Log entry created |

### 8. API: Notifications Endpoints

Create: `tests/api/notifications.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **GET /api/notifications** |||
| `returns user's notifications` | User with 5 notifications | Returns array of 5 |
| `orders unread first` | 3 read, 2 unread | Unread appear first |
| `limits to 50 results` | User with 100 notifications | Returns max 50 |
| `requires authentication` | No session | 401 Unauthorized |
| **POST /api/notifications/[id]/read** |||
| `marks notification as read` | Unread notification | read=true, returns updated |
| `rejects if not owner` | Other user's notification | 403 Forbidden |
| **POST /api/notifications/read-all** |||
| `marks all as read` | 5 unread notifications | All marked read |
| `returns count` | 5 marked | `{ success: true, count: 5 }` |

### 9. API: Push Subscription Endpoints

Create: `tests/api/push.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **POST /api/push/subscribe** |||
| `stores push subscription` | Valid PushSubscription | Subscription saved |
| `requires authentication` | No session | 401 Unauthorized |
| `requires subscription in body` | Missing subscription | 400 Bad Request |
| **POST /api/push/unsubscribe** |||
| `revokes subscription (soft delete)` | Valid endpoint | revokedAt set |
| `handles missing subscription` | Unknown endpoint | 404 or silent success |

### 10. API: Email Preferences

Create: `tests/api/email.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **POST /api/email/unsubscribe** |||
| `sets reminderEmailsEnabled to false` | Valid token | Preference updated |
| `handles already unsubscribed` | Already false | No error |

---

## Edge Case & Error Handling Tests

Create: `tests/reminders/edge-cases.test.ts`

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| **Data Integrity** |||
| `handles tab with no expenses` | Empty tab | No reminders sent |
| `handles deleted user gracefully` | Participant user deleted | Skip that participant |
| `handles tab closed before reminder` | Tab closed status | Still processes |
| **Concurrent Operations** |||
| `prevents duplicate reminders` | Two requests simultaneously | Only one reminder logged |
| **Missing Configuration** |||
| `handles missing VAPID keys` | No push keys configured | Falls back to email |
| `handles missing Postmark key` | No email configured | In-app only |
| **Email Edge Cases** |||
| `handles user with no email` | User has null email | Uses in-app only |
| `handles Postmark errors` | Postmark returns 500 | Logged as failed |
| **Balance Edge Cases** |||
| `handles fractional cents` | Amount: 1234 cents | Shows "$12.34" |
| `handles large amounts` | Amount: 1000000 cents | Shows "$10,000.00" |

---

## Manual/E2E Testing Checklist

### Settlement Page UI (`/tabs/[tabId]/settlement`)

| Test | Steps | Expected |
|------|-------|----------|
| **"Send reminder" button visibility** |||
| Creditor sees button | Login as Pro creditor, view settlement | Button visible |
| Debtor doesn't see button | Login as debtor, view settlement | Button hidden |
| Non-Pro doesn't see button | Login as free creditor | Button hidden or disabled |
| **Button functionality** |||
| Sends reminder successfully | Click "Send reminder" | Toast: "Reminder sent!", button disables |
| Shows rate limit error | Click again within 24 hours | Toast: "Already sent reminder..." |
| Shows loading state | Click button | Button shows "Sending..." |
| **Error handling** |||
| Network error | Simulate offline | Toast: error message |
| Session expired | Expired auth | Redirects to login |

### Notification Bell (`NotificationBell.tsx`)

| Test | Steps | Expected |
|------|-------|----------|
| **Badge display** |||
| Shows unread count | Have 3 unread notifications | Badge shows "3" |
| Hides badge when zero | Mark all as read | Badge disappears |
| **Dropdown** |||
| Lists notifications | Click bell icon | Shows up to 50 notifications |
| Shows relative time | Notification from 5 min ago | Shows "5m ago" |
| Empty state | No notifications | Shows "No notifications yet" |
| **Interactions** |||
| Click notification | Click on notification | Marks as read, navigates to URL |
| Mark all as read | Click "Mark all as read" | All notifications marked read |

### Email Content Testing

| Test | Method | Expected |
|------|--------|----------|
| Creditor reminder email | Check Postmark logs/inbox | Correct template, amount, names |
| Unsubscribe link works | Click unsubscribe in email | Redirects to /unsubscribe, prefs updated |
| Payment pending email | Mark payment as sent | Payee receives notification |

### Push Notification Testing

| Test | Method | Expected |
|------|--------|----------|
| Subscribe to push | Enable browser notifications | Subscription stored in DB |
| Receive push | Trigger reminder to self | Browser notification appears |
| Unsubscribe | Disable notifications | Subscription marked revoked |

---

## Test Data Fixtures

Create: `tests/fixtures/reminders.ts`

```typescript
export const createTestTab = async (prisma: PrismaClient) => {
  // Create users: 1 Pro creditor, 1 debtor
  // Create tab with both as participants
  // Create expense that makes creditor owed money
  // Enable reminders on tab
  // Return all IDs needed for tests
};

export const createReminderLog = async (prisma: PrismaClient, opts: {
  tabId: string;
  recipientUserId: string;
  sentAt: Date;
  manual?: boolean;
}) => {
  // Create a reminder log entry for testing cooldowns
};
```

---

## Environment Setup

### Required Environment Variables for Tests

```bash
# Database
DATABASE_URL_LOCAL="postgresql://..."
RUN_DB_TESTS=1

# Push Notifications (can be test keys)
PUSH_VAPID_PUBLIC_KEY="..."
PUSH_VAPID_PRIVATE_KEY="..."

# Email (use Postmark sandbox or mock)
POSTMARK_SERVER_TOKEN="..."

# Cron Auth
CRON_SECRET="test-secret"
```

### Running Tests

```bash
# Run all tests
npm test

# Run with database tests enabled
RUN_DB_TESTS=1 npm test

# Run specific test file
npm test -- tests/reminders/runner.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Implementation Priority

### Phase 1: Core Functionality (High Priority)
1. `runner.test.ts` - Schedule calculation, debtor/creditor identification
2. `reminders-send.test.ts` - Manual reminder API
3. `notifications.test.ts` - In-app notifications API

### Phase 2: Channels & Delivery (Medium Priority)
4. `client.test.ts` - Email delivery
5. `push.test.ts` - Push notifications
6. `edge-cases.test.ts` - Error handling

### Phase 3: Automation & UI (Lower Priority)
7. `reminders-run.test.ts` - Cron endpoint
8. `remind-now.test.ts` - Bulk manual trigger
9. Manual E2E testing for UI components

---

## Mocking Strategy

### External Services to Mock

| Service | Mock Library | Notes |
|---------|--------------|-------|
| Postmark | `vitest.mock` | Mock `postmark` module |
| web-push | `vitest.mock` | Mock `sendPushNotification` |
| Prisma | Real DB or `vitest-mock-extended` | Prefer real DB for integration |

### Example Mock Setup

```typescript
// tests/setup.ts
import { vi } from 'vitest';

vi.mock('postmark', () => ({
  ServerClient: vi.fn(() => ({
    sendEmail: vi.fn(() => Promise.resolve({ MessageID: 'test-id' })),
  })),
}));

vi.mock('@/lib/push/server', () => ({
  sendPushNotification: vi.fn(() => Promise.resolve({ success: true })),
}));
```

---

## Success Criteria

- [ ] 80%+ code coverage on `lib/reminders/runner.ts`
- [ ] 80%+ code coverage on reminder API endpoints
- [ ] All edge cases documented and tested
- [ ] E2E manual testing completed for UI flows
- [ ] No regressions in existing acknowledgement tests
