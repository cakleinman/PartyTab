# Morning Checklist (10-minute Demo)

Purpose: quick daily sanity pass for the core flow. Use before demos or when you
haven't touched the project in a while.

1) Start local DB

```bash
npm run db:up
npm run db:reset
```

2) Start dev server

```bash
npm run dev
```

3) Demo flow

- Open http://localhost:3000
- Visit `/demo` and click “Reset demo data”
- Open the active demo tab
- Add an expense (even split)
- Add an expense (custom split)
- Open Participants and check “You” badge
- Close tab (if creator)
- View settlement and acknowledgements

4) Optional API checks

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke
npm run test
```

5) Optional receipt flow (requires Supabase Storage + Anthropic key)

- Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  and `ANTHROPIC_API_KEY` are set.
- Open an expense detail page and upload a receipt image.
- Click "Parse receipt items" and confirm items appear.
- Claim one item and verify the claim shows your name.
- Delete the receipt and confirm items are removed.
