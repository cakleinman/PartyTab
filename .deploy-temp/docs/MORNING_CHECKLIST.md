# Morning Checklist (10-minute Demo)

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
