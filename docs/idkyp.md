# IDKYP — Google Places API setup

IDKYP runs in two modes:

- **Live mode** — real nearby restaurants from Google Places (New). Requires `GOOGLE_PLACES_API_KEY`.
- **Demo mode** — the bundled 52 Carbon County, UT restaurants. Renders a "Demo data" badge in the map header. Used automatically when the key is missing.

## Get a Places API key (~5 minutes)

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one). Top bar → project dropdown → **New Project**.
3. **APIs & Services → Library**. Search for **"Places API (New)"** and click **Enable**. Note: this is the *New* one (`places.googleapis.com`), not the legacy "Places API".
4. **APIs & Services → Credentials → Create Credentials → API key**. Copy the key.
5. **Restrict it** (don't skip — unrestricted keys get abused):
   - **Application restrictions:** "None" for server-side use (we proxy through `/api/idkyp/places`, so HTTP-referrer restrictions don't apply). Optionally restrict by IP if you have static Vercel egress.
   - **API restrictions:** "Restrict key" → select **Places API (New)** only.
6. **Billing:** Places API requires a billing account. Google gives a $200/month free credit. Our `/api/idkyp/places` route caches results for 30 minutes (`IDKYP_PLACES_CACHE_TTL_SECONDS`), so a healthy user base costs very little.

## Wire it into Vercel (production)

1. Vercel dashboard → **partytab** project → **Settings → Environment Variables**.
2. Add `GOOGLE_PLACES_API_KEY` = `<key>`. Environment: **Production** (and Preview if you want previews to use real data).
3. Redeploy (any push to `main` triggers it; or **Deployments → … → Redeploy**).

Verify after deploy: `curl -X POST https://partytab.app/api/idkyp/places -H 'Content-Type: application/json' -d '{"lat":40.7,"lng":-74.0,"radiusMiles":2}'` should return `mode: "live"`.

## Wire it into `.env.local` (local dev)

```bash
echo 'GOOGLE_PLACES_API_KEY=<key>' >> .env.local
```

Then restart `npm run dev`.

Heads up: this project's `.env.local` has been observed with shell-paste damage on other secrets (quote-wrapped values). If `/api/idkyp/places` returns a 503 after adding the key, double-check the line is `KEY=value` with no surrounding quotes.

## Optional: tune the cache

`IDKYP_PLACES_CACHE_TTL_SECONDS` controls how long the Places result is cached (Upstash if configured, in-memory `Map` otherwise). Default 1800 (30 min). Lower it if you want fresher openNow data; raise it to reduce API spend.

## What the integration does

- **Nearby Search** (`places:searchNearby`) — up to 20 restaurants per call, field-masked to id/name/address/location/types/rating/userRatingCount/priceLevel/photos/regularOpeningHours/currentOpeningHours/websiteUri.
- **Photo URLs** — resolved via `places/.../photos/{id}/media?skipHttpRedirect=true`, which returns the Google CDN URL as JSON. That URL is short-lived but loadable by the browser without exposing our API key.
- **Cuisine inference** — runtime regex against Google's `types[]` (e.g. `pizza_restaurant` → "Pizza"). Falls back to "Restaurant".

## What it deliberately doesn't do (yet)

- Place Details / reviews — would require a second API call per result. Phase 6.
- Pagination beyond 20 results — Places New supports up to 60 via `pageToken`. Skipped for v1.
- Real `lib/idkyp/data.ts` photo URLs — the demo dataset still uses Unsplash-by-cuisine fallbacks.
