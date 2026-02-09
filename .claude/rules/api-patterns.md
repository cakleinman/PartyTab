# API Route Patterns

## Pattern 1 — Manual try/catch (most existing routes)

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

## Pattern 2 — `withApiHandler` wrapper (prefer for new routes)

```typescript
export const POST = withApiHandler<{ token: string }>(async (request, { params }) => {
  const { token } = await params;
  // Just throw errors — wrapper handles conversion
  return ok({ success: true });
});
```

For simple GET endpoints with no params:

```typescript
export const GET = withSimpleApiHandler(async () => {
  return ok({ data });
});
```

## Guards (lib/api/guards.ts)

All throw `ApiError` on failure:

- `getUserFromSession()` — Returns `User | null` (checks NextAuth then guest cookie)
- `requireUser(displayName?, pin?)` — Requires auth OR creates guest user (optional params for guest creation)
- `requireTab(tabId)` — Throws 404 if not found
- `requireOpenTab(tabId)` — Throws 404 if not found, 409 if closed
- `requireParticipant(tabId, userId)` — Throws 403 if not a participant

## Response Helpers (lib/api/response.ts)

- `ok(payload)` — 200
- `created(payload)` — 201
- `noContent()` — 204
- `error(status, code, message, details?)` — Error JSON
- `validationError(err, status?)` — 400

## Error Codes

- `validation_error`, `not_found`, `forbidden`, `unauthorized`
- `tab_closed`, `not_participant`, `already_claimed`
- `tab_limit_reached`, `pro_required`, `limit_exceeded`
- `internal_error`, `email_exists`, `upgrade_required`, `rate_limited`
