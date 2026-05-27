# IDKYP — MVP Plan

**Name:** IDKYP (pronounced *"id-kip"*)
**Tagline:** *"I don't know, you pick."*
**Origin:** the universal phrase that ends every "where should we eat?" conversation. The app answers the question for you.
**Domain:** IDKYP.com (to be registered)
**Bundle ID:** `com.<yourhandle>.idkyp` (final handle TBD — anything stable, e.g. your initials or a personal namespace)
**Wordmark:** `IDKYP` (uppercase, letterspaced) or `idkyp` (lowercase) — pick one and use consistently.
**App Store name:** `IDKYP — Where to Eat` (subtitle gives both store search and humans the use-case clue).

## Context

**The problem.** "Where should we eat?" is one of the most frequent decisions people make and one of the worst-suited to traditional ranking. Choosing your *favorite* of N options is high-effort; choosing your *least favorite* of 3 is low-effort. The app turns the dinner question into a series of trivial micro-decisions.

**The idea.** Detect the user's location, accept a max-driving-radius, fetch nearby restaurants from Google Places, and present them three at a time. The user eliminates one — a new one slides in to keep the count at three — and they keep eliminating until they tap "Final 2," at which point the app surfaces the two strongest survivors as a head-to-head and the user picks the winner.

**Decisions locked in (from clarifying questions):**
- **Audience:** Solo decider for v1. Group voting deferred to v2.
- **Bracket:** Rolling 3, eliminate-and-replace. User-controlled stop.
- **Data API:** Google Places (New) — Nearby Search.
- **Stack:** React Native + Expo, single codebase to App Store + Google Play.

**Intended outcome.** A shippable v1 that a single user can install, grant location, set a radius, and reach a single restaurant choice in under a minute, with low enough API cost that the free tier covers early users.

---

## Architecture

```
┌─────────────────────────┐        ┌──────────────────────┐        ┌────────────────┐
│  React Native (Expo)    │        │  Backend proxy       │        │ Google Places  │
│  - Location             │  HTTPS │  (Cloud Functions or │  HTTPS │   (New) API    │
│  - Bracket UI/state     ├───────►│   Vercel serverless) ├───────►│ Nearby Search  │
│  - AsyncStorage         │        │  - Hides API key     │        │ Place Photos   │
└─────────────────────────┘        │  - Caches by geohash │        └────────────────┘
                                   └──────────────────────┘
```

**Why the proxy:** Embedding the Google API key in the client is a security and cost risk (the key is extractable from the bundle and could be abused, blowing through your billing). A 50-line serverless function holds the key, applies a per-IP rate limit, and caches results — typically cuts API spend 5–10× because nearby radii overlap heavily across users.

---

## Tech stack (concrete)

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo (managed workflow)** | Builds for both stores from one config; handles location, maps, EAS builds. |
| Language | TypeScript | Catches the 30% of bugs that come from API response shape mismatches. |
| State | **Zustand** | One small store for `{ location, radius, pool, visibleTrio, eliminated, finalists }`. Redux is overkill. |
| Navigation | `expo-router` | File-based routing, less ceremony than React Navigation config. |
| Location | `expo-location` | Foreground only — no background tracking. |
| Maps (first screen + winner) | `react-native-maps` + Stadia Maps tile overlay (Stamen Terrain) | Powers the map-first location/radius screen with custom paper-map tiles, custom ink-stamp restaurant markers, and a hand-drawn-style radius polyline. Reused on the winner screen for the directions hand-off. |
| Local storage | `@react-native-async-storage/async-storage` | Remember last radius and any saved favorites. |
| Backend proxy | **Vercel serverless functions** | Free tier covers MVP, deploys in one command, easy to swap later. |
| Analytics | PostHog or Amplitude (free tier) | Need to know completion rate and average eliminations to tune the UX. |

---

## Core flow

1. **Cold start** → request location permission inline (no separate intro screen). If denied, the map opens on a default region (last used, or a sensible city default) and the user can drag the center pin to wherever they want.
2. **Map screen (location + radius)** — *the first thing the user sees, and the heart of the pre-game UX:*
   - Full-screen map centered on the user's GPS location.
   - A translucent **radius circle** overlaid on the map. Pinch-zoom or use a thin slider on a bottom sheet to expand/contract; the circle resizes live.
   - A **draggable center pin** so the user can plan dinner somewhere they aren't yet ("I'll be in Brooklyn tonight"). A small "Reset to my location" button in the corner snaps back if they wander.
   - Restaurant **pins** rendered for every place inside the current circle (visual density cue — sparse vs. dense at a glance).
   - A prominent **live counter chip** ("**14 restaurants**" / "**20+ restaurants**" / "**3 restaurants — try a bigger radius**") that updates as the user moves the pin or changes the radius. The counter is the user's signal that they're set up for a good session before they start eliminating.
   - Bottom sheet has the radius slider and a single CTA: **"Filters →"** (or "Skip & start" if they want to bypass filters).
3. **Filters sheet** (optional, skippable) → see **Pre-elimination filters** section. The same live counter remains visible at the top of the sheet so the user can see how each filter trims the candidate pool in real time. CTA: **"Start"**. Tapping Start locks in the center/radius/filters combination — the backend proxy returns the final pool of up to 20 restaurants, sorted by a randomized seed.
4. **Elimination loop** → show top 3 of pool. User taps one to eliminate. That card animates out, the next pool item slides into its slot. Repeat.
5. **Final 2** → "Final 2" button is disabled until ≥3 eliminations have happened, then enabled. Tapping it ends the elimination phase and presents the two strongest survivors as a **side-by-side comparison view** (see below). *Strongest* = the two highest-rated of the not-yet-eliminated set (current trio plus anything still in the pool).
6. **Winner screen** → name, rating, price, photo, distance, and a tight set of actions: **Directions** (hands off to Apple Maps / Google Maps), **Add to Calendar** (creates an event at the user's `openAt` time, location pre-filled), **Reserve** (OpenTable affiliate — only shown when the place is on OpenTable; see Monetization section), and **Call** (tertiary, only shown if the place has a phone number). That's it. No sharing flow, no "did you go?" follow-up. The decision is the product; everything after is handoff.

If the pool exhausts before the user taps Final 2, auto-trigger Final 2 with whatever's left.

### Saved favorites (parallel flow, v1)

A separate path for users who already know what they want, kept cleanly isolated from the elimination flow.

- **Saving:** Heart icon on the **winner screen**. One tap saves the place. *No* save action on elimination cards — that flow stays pure.
- **Accessing:** A heart/bookmark icon in the map-screen header (top corner). Opens the saved-list screen.
- **Saved list screen:** Each saved place shows name, current distance, last-decided date. Tap → goes directly to that place's winner screen, bypassing elimination entirely. Swipe-to-delete to remove.
- **Storage:** AsyncStorage. Persisted shape: `Array<{ placeId, name, photoRef, savedAt, lastDecidedAt }>`. No backend, no accounts.
- **Refresh on access:** When a saved place is opened, hit Place Details once to refresh hours / openNow / current distance. Small API cost (~$0.005/access) — covered by existing cost controls.
- **No cross-contamination:** Saved places do **not** appear in the elimination pool, do **not** get rating-boosted, do **not** influence randomization. The two flows are cleanly separate. Elimination = "help me decide tonight." Saved list = "I already know."

### Final 2 comparison view

The 1v1 isn't a tie-breaker — it's a richer screen than the elimination cards because the user is now choosing the winner, not eliminating a loser. Two cards side-by-side, each annotated with **"why this one wins"** badges across the dimensions where they differ:

- **Better price** (cheaper of the two, if price levels differ)
- **Closer** (shorter drive)
- **Better-reviewed** (higher rating)
- **More popular** (more reviews — useful when ratings are tied)
- **Open longer** (later closing time, given the user's `openAt`)

The badges are awarded only on the dimension a place actually wins on, so neither card is a clean sweep — the user sees the real tradeoffs (e.g., "cheaper but farther" vs. "closer but pricier") and makes the call with full info. This reframes the final pick from "which do I prefer?" to "which tradeoff do I want?"

**Edge cases to handle in v1:**
- Sparse area (fewer restaurants than the user might want) → no modal, no interrupting prompt. The **live count chip** on the map screen and filters sheet is the sole communication — when count is low it shifts color and copy ("3 nearby — try a larger radius") but the user remains in control. They can proceed if they want; the count is information, not an obstacle. Same applies when filters reduce the pool to near-zero — the chip reflects it, no modal pops up.
- All restaurants same chain → de-dupe by name within the pool.
- User has no GPS signal or denies permission → map opens on a default region; user drags the center pin or uses a search field (Places Autocomplete) to set location manually.

**By design — things we deliberately don't do:**
- **No "shuffle this trio" / "I hate all 3" escape hatch.** The user picks the one they hate *most*. Even when no option appeals, the worst-of-3 is still a meaningful signal and keeps the mechanic clean. Adding an escape would dilute the core insight (it's easier to choose what you don't want than what you do).
- **No recency-based filtering or downranking of recent winners.** The app is about *where you want to eat tonight*, not your lifetime preference graph. If you went somewhere yesterday and don't feel like it again, that makes it *easy to eliminate* — that's the mechanic working as intended. We don't track or hide history.
- **No "I've been there a lot" personalization in v1.** Same reasoning — the elimination already surfaces today's mood.
- **No heavy post-decision experience.** Once a winner is picked, we hand off — Directions, Add to Calendar, Reserve (when applicable), Call. No sharing/group-chat flow, no follow-up "did you actually go?" survey. The app's job ends when the decision is made.
- **No group-mode scaffolding in v1.** Group voting is a possible v2 — but we are *not* paying any upfront design cost for it now. No room IDs in the schema, no "userId" stub on votes, no abstraction layers anticipating multi-user. If group mode happens later, we'll refactor when we actually know what it should look like. Premature plumbing is just dead weight.

**Guiding principle: lightweight.** This is a focused utility, not a platform. When weighing whether to add a feature, default to *no* unless it directly speeds up reaching a dinner choice. Reviews/photo carousels, social features, account systems, gamification — all out of scope.

---

## UI/UX specification

The bar: feels like a sharp, native, indie-but-professional app — comparable in polish to Things 3, Cash App, Linear iOS. Not enterprise-bland, not playful-kid. **Calm confidence.** The app is making a decision *for* you — the tone is assured and friendly.

### Design principles

1. **Snappy beats pretty.** Every tap feels instant (<100ms response). Animations are short (≤300ms) and serve a purpose — never decorative. Lag in the elimination loop kills the magic.
2. **One thing per screen.** Map screen sets context. Eliminate screen does one job. Final 2 compares two things. Winner hands off. No nested modals, no buried settings.
3. **Native, not webview-y.** Platform gestures (swipe-back on iOS, material transitions on Android), platform haptics, platform fonts where appropriate.
4. **Photography is non-negotiable.** Every elimination card has a photo. Restaurants without photos use a curated illustrated fallback (one per cuisine type), never a gray placeholder.
5. **Dark mode is parity, not stretch.** Designed at the same time as light, not retrofitted.

### Layout & component design (per screen)

**Map screen (the entry point)**
- Full-bleed map. No top nav bar — controls float over the map.
- Top corners: small icon-only buttons. Top-left = "Reset to my location" (compass icon). Top-right = "Saved places" (heart/bookmark icon).
- Bottom: a sticky **bottom sheet** (~30% of screen height) containing, top-to-bottom: live count chip, radius slider, single primary CTA ("Filters →" or "Skip & start").
- Radius circle: translucent fill (~15% accent color), 2pt accent stroke, animates smoothly on radius change.
- Restaurant pins: small filled dot (4pt) in accent color. Cluster when zoomed out.
- Center pin: the system map pin, draggable. "I'm here" indicator (pulsing blue dot) shows actual GPS even when pin is moved.

**Eliminate screen (the core)**
- Three full-width cards stacked vertically, each ~30% of screen height. No horizontal scroll.
- Card: photo as left third (or top half on smaller screens), text content fills the rest. Restaurant name in display type, second-line metadata row (rating ★ • $$ • 0.6 mi • 8 min).
- Tap *anywhere* on a card to eliminate it. Generous hit target — the whole card.
- **Tap feedback (every card, every time):**
  - On press: card scales to 0.97, soft haptic.
  - On release/eliminate: card flashes a subtle red-tint overlay (~150ms), then animates out (slide-right + fade, ~200ms).
  - Replacement slides in from below (~200ms, slight overshoot ease). Total transition: ~350ms, feels instant.
- Top of screen: count of remaining candidates, an "Undo" button (long-press the eliminated card alternatively), and the "Final 2" button (disabled→enabled state shift after 3 eliminations is itself animated — subtle pulse + color fill).
- Bottom: active filter chips (compact, tappable to remove a filter mid-session).

**Final 2 screen**
- Split-screen, two cards side-by-side, each filling exactly half the height (mobile portrait).
- Each card: large hero photo (top half), name + metadata + "why this one wins" badges (bottom half).
- Badges: small pills overlaid on the bottom of each photo, accent-color filled. "Closer" / "Cheaper" / "Better-rated" / "More popular" / "Open longer." Each badge appears only on the card that wins that dimension.
- Tap a card → card expands to fill screen, transitions to winner screen.
- Subtle visual cue this is *the* moment: slightly more vibrant accent color than other screens, tagline at top ("Pick your dinner.").

**Winner screen**
- Hero photo, full-bleed, top 50% of screen.
- Restaurant name in display type, metadata row beneath.
- 3–4 action buttons stacked, full-width:
  1. **Directions** (primary, accent color, prominent)
  2. **Add to Calendar** (secondary, outlined)
  3. **Reserve** (secondary, only when on OpenTable — affiliate)
  4. **Call** (tertiary, smaller, only when phone exists)
- Top-right: heart toggle to save (filled = saved, outlined = not).
- Subtle celebration: when the winner screen first appears, the hero photo zooms in slightly (~600ms) to feel like a reveal, not a navigation.

**Saved places screen**
- Standard list, each row: thumbnail, name, "last decided" date, distance now.
- Swipe-left to delete. Tap to open winner screen for that place.
- Empty state: friendly illustration + "Tap the heart on a winner to save it for later."

### Motion & haptics

| Interaction | Animation | Haptic |
|---|---|---|
| Tap any card (press) | scale to 0.97 | soft impact |
| Eliminate card | red-tint flash → slide-out + fade-in replacement | medium impact |
| Reach Final 2 (auto or button) | screen transition + slight delay | success notification haptic |
| Pick winner | card expands to fill screen | strong impact |
| Adjust radius slider | live circle resize | selection-change haptic |
| Save (heart tap) | heart fills + small bounce | light impact |
| Drag map pin | pin lifts (subtle scale) | continuous selection haptic on move |

**Reduce-motion mode:** all slide/scale/zoom animations replaced with cross-fades. All haptics still fire. Critical timing preserved.

### Empty & error states (designed, not afterthought)

- **Location permission denied:** Map opens centered on a sensible default (last-used or major city). Gentle banner: "Set your location to find nearby spots." Tapping the banner triggers re-prompt or opens manual search field.
- **Sparse area (low count):** Live count chip shifts to a warning tone with hint copy ("3 nearby — try a larger radius"). No modal, no blocking — the chip *is* the communication. Trust the user to read it and decide.
- **Filters too restrictive:** Same rule — count chip on the filters sheet shows the impact in real time, including dropping to "0 nearby." No modal. The user adjusts a filter or backs out; both are visible at all times.
- **No saved places yet:** Illustration + tagline (above).
- **Network failure / API down:** Offline indicator at top, "Showing cached results" if any, otherwise a friendly retry screen. Never a raw error toast.
- **GCP hard cap tripped:** App shows a single full-screen "We're temporarily out of fresh data. Try again tomorrow." with a Saved Places shortcut. (Should be vanishingly rare with caching, but designed for.)

### Dark mode

Use semantic color tokens (`background`, `surface`, `accent`, `text-primary`, `text-secondary`, `border`, `success`, `warning`, `destructive`). Light and dark palettes defined together. Map style switches to a dark map variant. All photos/illustrations keep their natural colors (no inversion).

Follows OS setting by default. No in-app toggle in v1 (keep it lightweight).

### Onboarding (first launch)

Three screens maximum, every screen has Skip:

1. **Brand splash** (1.5s, auto-advance): IDKYP wordmark + tagline *"I don't know, you pick."*
2. **Location permission ask:** map illustration + one-sentence rationale ("We use your location to find nearby spots — never stored or shared."). System permission dialog triggers on tap.
3. **Dietary needs (optional):** "Anything we should always exclude?" with a compact selector (vegetarian/vegan/gluten-free/halal/kosher) + Skip. Persisted forever — never asked again.

After onboarding, users land on the map screen. No tutorial overlay on the elimination screen — three cards, tap one, the mechanic is self-evident.

### Accessibility

- **Dynamic Type:** all text scales with the system text-size setting. Layouts use flexible spacing, never fixed-height text containers.
- **VoiceOver:** every interactive element has a semantic label ("Eliminate Joe's Pizza", "Save winner", "Adjust radius"). The eliminate action is announced clearly.
- **Reduced motion:** OS setting respected (see Motion section).
- **Color is not the only signal:** elimination state, filter active state, etc. always paired with an icon or text label, not color-only.
- **Hit targets:** minimum 44×44 pt on all tappable elements. Card hit targets are far larger.
- **Contrast:** all text-on-background meets WCAG AA (4.5:1 normal, 3:1 large). Verified in both light and dark.

### Visual identity — direction locked: **understated, paper / pencil / ink**

The aesthetic is **tactile, literary, analog-feeling.** Lowercase wordmark, paper textures, pencil-and-ink restraint. Stands deliberately apart from the gradient-heavy gloss of the food-app category. Every visual choice should flow from the premise: *this app feels like notes scribbled in a leather notebook, not a screen.*

**Locked decisions:**

- **Wordmark:** `idkyp` (lowercase, italic serif). Specific face TBD in design phase from this shortlist: **EB Garamond Italic** (free, classical), **PP Editorial New Italic** (paid, modern editorial), **Cooper Italic** (quirky personality).
- **Body type:** slab serif for paper-y feel — recommended **iA Writer Quattro** (free, designed to feel like typed paper). Fallback: **Bricolage Grotesque** for legibility at small sizes.
- **Palette:**
  - Background: warm off-white `#F5EFE3` / `#EFE8DC`. Never pure white.
  - Ink (text/UI): warm near-black `#1F1A14`. Never pure black.
  - Single accent (TBD in design phase from): **classic blue ink** `#1A3A6B` (fountain pen feel), **oxblood** `#7A2F2F` (rubber-stamp feel), or **graphite mono** `#3A3733` (most understated).
  - Dark mode: deep ink background `#1A1612`, warm cream text. No pure black.
- **Paper-texture overlay:** subtle SVG noise pattern, ~8% opacity, applied to all background surfaces (map included) for continuity.
- **Iconography:** single-weight line icons with slight imperfection (hand-drawn feel, not perfectly geometric). Phosphor Icons as starting library; the heavy-use icons (heart, compass, bookmark) get hand-redrawn for character.
- **Photography treatment:** Polaroid-frame each restaurant photo (~6pt warm-white border) plus a light grain/warm-tone filter. Integrates harsh stock photos with the paper feel without making food look unappetizing.
- **App icon:** italic "k" wordmark fragment on a paper-textured square. K is the visual center of "idkyp" and survives the 24px size constraint where text otherwise can't.

**Map style — paper map, not tinted Google Map:**

- **Approach:** keep `react-native-maps`, override base tiles with **Stadia Maps's Stamen Terrain** style (paper-map aesthetic, sepia roads, cream land, faint contour lines). Stadia's free tier (~200k loads/month) covers MVP. Stamen Terrain is the chosen style — Stamen Watercolor fights with photos, Stamen Toner is too cold.
- **Custom markers:** restaurants render as **small ink-stamp circles with numbers**, like reference points on a hand-drawn tourism map. Numbers cross-reference the elimination cards (subtle but reinforces the "designed" feel).
- **Radius circle:** drawn as a custom `Polyline` with slightly randomized vertex offsets so it reads compass-and-pencil drawn, not geometric. Single accent-ink stroke, no fill.
- **Paper-grain overlay:** same ~8% noise texture used elsewhere, layered over the tile view — makes the map feel continuous with the rest of the UI rather than a window cut into it.
- **Hide the underlying base map (critical, both platforms):** when overlaying Stamen tiles via `UrlTile`, `react-native-maps` is still rendering its native base map underneath (Google Maps on Android, Google or Apple on iOS). Google's road/place labels will bleed through and clash with the paper tiles. **Fix:** also pass a `customMapStyle` JSON with every feature type's visibility set to `off`, so only the Stamen tiles render. One-time setup. Both Android and iOS (when using `PROVIDER_GOOGLE`) need this.
- **Why not Mapbox/custom style:** parking that as a possible v2 polish pass. Stadia tiles get ~80% of the ceiling for ~20% of the work, no SDK migration, no second vendor.

**Animations re-tuned for paper:**
- No bouncy springs anywhere — they feel digital. Use soft cubic eases.
- Eliminate: card slides off slightly with a brief blur (paper-shuffle feel), replacement slides in flat. ~250ms total.
- Winner reveal: slow fade-in over ~600ms — like ink soaking through paper. Photo *settles*, doesn't zoom.
- Optional sound design: a single soft paper-rustle on elimination, **off by default**, opt-in in settings.

**Illustrations (custom commissioned):**

A small set of three pencil-sketch illustrations carries the aesthetic across empty states. Budget ~$200–500 for a freelance illustrator (Working Not Working, Are.na, Fiverr Pro). Pieces needed:
1. Welcome / brand splash — sketched fork-and-knife crossed, or open notebook with `idkyp` written on it
2. No saved places yet — empty bookmarked notebook page
3. Location denied / no GPS — sketched compass with question mark

A custom commission is the difference between "paper-themed" and "made by a human." Library art is allowed as a fallback if budget doesn't permit, but custom is strongly preferred.

**Final design-phase decisions** (to settle once the actual design work begins, not blockers for plan approval):

- Accent ink color (classic blue / oxblood / graphite mono)
- Wordmark serif face (EB Garamond / PP Editorial New / Cooper Italic)
- Whether to commission illustrations or use a curated library set
- Whether to build a custom Phosphor-based icon set or hand-redraw a small custom set

---

## Pre-elimination filters (hard constraints)

Things the user *can't reasonably eliminate their way around* — allergies, dietary restrictions, hard "I don't want X tonight" preferences. These are applied to the API query and to the pool *before* the elimination loop ever starts. The principle: **the elimination mechanic is for choosing between options the user could plausibly enjoy. Anything that disqualifies a place outright belongs here.**

**Filter taxonomy for v1:**

| Filter | Type | How it's enforced |
|---|---|---|
| Open at | time selector: *Now*, *In 1 hour*, *In 2 hours*, *Tonight at…*, *Custom time* (today or tomorrow) | Places `regularOpeningHours.periods` — for each candidate, parse the day-of-week schedule and check that the user's chosen time falls inside an open window. Default is *Now*. |
| Max price | $ / $$ / $$$ / $$$$ | Places `priceLevels` array in request |
| Min rating | slider, default 3.5★ | Client-side filter on pool |
| Dietary needs | multi-select: *Vegetarian options*, *Vegan options*, *Gluten-free options*, *Halal*, *Kosher* | Places attributes (`servesVegetarianFood` etc.) where available; cuisine-type heuristic fallback |
| Cuisine excludes | multi-select: "Not tonight: sushi, Indian, fast food, …" | Places `excludedPrimaryTypes` (e.g., `sushi_restaurant`, `fast_food_restaurant`) |
| Avoid chains | toggle | Heuristic — flag any name appearing >3× in a 50-mile radius reference list, or use a curated chain list |

**UX:**
- Filters live on the same screen as the radius, collapsed by default behind a "Filters" expand. Most users will skip them most of the time. Power users (allergies, vegetarians) set once and the choice persists in AsyncStorage.
- Make dietary needs **sticky and prominent** — someone with a peanut allergy should not have to set it every session. On first run, ask once: "Any dietary needs we should always respect?" and store the answer.
- Show an active-filter chip row at the top of the elimination screen so users remember what's filtered out (and can tap to remove a filter mid-session if the pool is too thin).

**Important caveat to surface in-app:** Google Places' dietary attributes are self-reported by businesses and incomplete. For *severe allergies*, the app should show a one-time disclaimer: "We filter based on restaurant-provided info — always confirm with the restaurant for serious allergies." This is both an honesty and liability concern.

**Filter data model addition:**

```ts
type Filters = {
  openAt: Date;               // default: now. Anything in the next ~24h.
  priceMax: 1 | 2 | 3 | 4;
  minRating: number;          // default 3.5
  dietary: Array<'vegetarian' | 'vegan' | 'glutenFree' | 'halal' | 'kosher'>;
  excludeCuisines: string[];  // Places primary types
  avoidChains: boolean;
};
```

Persisted to AsyncStorage so dietary needs survive app restarts.

---

## Data model (Zustand store)

```ts
type Restaurant = {
  placeId: string;
  name: string;
  rating: number;
  userRatingCount: number;    // for "more popular" badge in Final 2
  priceLevel: 1 | 2 | 3 | 4 | null;
  photoRef: string | null;
  distanceMeters: number;
  lat: number;
  lng: number;
  hours: OpeningPeriod[];     // raw periods, evaluated against filters.openAt
};

type SavedPlace = {
  placeId: string;
  name: string;
  photoRef: string | null;
  savedAt: number;             // unix ms
  lastDecidedAt: number | null;
};

type AppState = {
  deviceLocation: { lat: number; lng: number } | null;  // raw GPS, used by "Reset to my location"
  searchCenter: { lat: number; lng: number } | null;    // where the radius is currently centered
  radiusMiles: number;
  liveCount: number | null;    // populated from preview queries on the map screen
  filters: Filters;            // see Pre-elimination filters section
  saved: SavedPlace[];         // persisted to AsyncStorage; parallel-flow only
  pool: Restaurant[];          // remaining candidates (already filtered)
  visibleTrio: Restaurant[];   // currently on screen
  eliminated: Restaurant[];    // history (for "undo last")
  finalists: Restaurant[];     // populated when user taps Decide
  winner: Restaurant | null;
};
```

---

## Project structure

```
idkyp/
├── app/                          # expo-router screens
│   ├── index.tsx                 # map screen: location + radius + live count
│   ├── filters.tsx               # filters sheet (or modal route)
│   ├── eliminate.tsx             # the trio screen (core UX)
│   ├── final-two.tsx             # head-to-head 1v1 with "why this wins" badges
│   ├── winner.tsx
│   └── saved.tsx                 # saved-favorites list (parallel flow)
├── components/
│   ├── MapWithRadius.tsx         # map + draggable pin + radius circle + restaurant pins
│   ├── CountChip.tsx             # live "14 restaurants" / "20+" / "3 — try larger radius"
│   ├── RadiusSlider.tsx
│   ├── ResetLocationButton.tsx
│   ├── PlacesSearchField.tsx     # autocomplete for manual location entry
│   ├── RestaurantCard.tsx        # tap-to-eliminate card
│   ├── ComparisonCard.tsx        # Final 2 card with "why this wins" badges
│   ├── FilterSheet.tsx
│   └── ActiveFilterChips.tsx     # shows active filters during elimination
├── lib/
│   ├── places.ts                 # client → backend proxy calls
│   ├── location.ts               # expo-location wrapper
│   ├── store.ts                  # Zustand store
│   └── bracket.ts                # eliminate/replace logic, decide trigger
├── api/                          # Vercel serverless functions
│   ├── nearby.ts                 # proxies Google Places Nearby Search
│   └── photo.ts                  # proxies Place Photo (signed URL)
├── app.json                      # Expo config
├── eas.json                      # build profiles for stores
└── package.json
```

---

## Key implementation notes

- **Map screen live count:** As the user drags the pin or adjusts the radius, debounce ~400ms and re-query the proxy. Render returned places as map pins *and* feed the count chip from the same response — one query, two uses. Google Places Nearby Search caps at 20 results per call, so the chip displays the literal number when count <20 and "20+" when count =20. The "20+" cap is fine — it just means "plenty," which is all the user needs to know.
- **Proxy caching is doubly important here.** The map screen will fire many overlapping queries as the user fiddles with center/radius. Geohash + radius-bucket caching in the proxy means repeated/near-duplicate queries hit cache instead of Places, keeping cost manageable.
- **Sparse-area UX on the map:** When the live count is low, the chip's color shifts and the copy becomes a hint ("3 nearby — try a larger radius"). That's it. No modal, no blocking prompt. The chip is the single source of truth for sparseness — the user reads it and decides. If they want to start an elimination with 4 restaurants, the app lets them.
- **Map ↔ filters sync:** Filters reduce the live count too. When the user opens the filters sheet, the count chip persists at the top so they can see how each filter trims the pool. Same rule applies: if filters drop the count to near-zero, the chip reflects it; no modal interrupts.
- **Pin drag vs. tap-to-place:** Long-press anywhere on the map to relocate the pin (standard mobile pattern), with a draggable marker for fine adjustment. A "Reset to my location" button in the corner snaps back to GPS.

- **Google Places (New) endpoint:** `POST https://places.googleapis.com/v1/places:searchNearby` with a `FieldMask` header limiting response fields to `places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.location,places.photos,places.regularOpeningHours.periods`. Field masks are how you control cost — every extra field can bump the SKU tier. We pull `regularOpeningHours.periods` (the raw weekly schedule) rather than `currentOpeningHours.openNow` so we can evaluate "open at the user's chosen time" client-side. `userRatingCount` powers the "more popular" badge on the Final 2 screen.
- **Open-at evaluation:** `regularOpeningHours.periods` is an array of `{ open: { day, hour, minute }, close: { day, hour, minute } }`. For the user's chosen `openAt` Date, find the matching day-of-week period and check the time falls in `[open, close)`. Cache the parsed schedule on the Restaurant object so each filter re-evaluation is cheap.
- **Caching in the proxy:** Bucket requests by geohash (precision 6, ~1.2 km cells) + radius bucket + filters. Cache TTL ~10 min. Cuts cost dramatically when multiple users in the same area try the app.
- **Photo handling:** Don't fetch all photos upfront — that's expensive. Lazy-load when a restaurant enters the visible trio. Pre-fetch the next pool item's photo so the slide-in is smooth.
- **Randomization:** Sort the pool by `rating * priceMatchBonus + Math.random() * 0.5` so high-rated places dominate but the same trio doesn't appear every run.
- **Undo:** Keep an `eliminated[]` stack and offer a single-step undo on long-press. Cheap to add, big UX win for misclicks.

---

## App store prep

- **Bundle/package IDs:** `com.<yourhandle>.idkyp` — pick the handle once and don't change it. Changing later means re-publishing as a new app, losing reviews and downloads.
- **Privacy policy:** Mandatory for both stores because of location. Decision: generate with a free tool (Termly or App Privacy Policy Generator), host on **GitHub Pages or Vercel** (free static hosting). ~30 min of work, gets reviewed once and updated on changes. Skip the paid SaaS tier (Termly Pro / iubenda) — overkill until we hit scale or face GDPR audit risk.
- **Apple App Privacy:** Declare *Precise Location*, used for *App Functionality*, not linked to identity, not used for tracking. (Assuming you don't add ad SDKs.)
- **Google Data Safety form:** Same disclosure — collected, not shared, ephemeral.
- **Permission strings (`app.json` `ios.infoPlist`):** `NSLocationWhenInUseUsageDescription` = "We use your location to find restaurants nearby." Keep it one sentence, no jargon — Apple rejects vague strings.
- **EAS Build + EAS Submit:** Expo's pipeline produces signed `.ipa`/`.aab` and uploads them to TestFlight / Play Console internal testing. ~30 min from `eas build` to "installable on a tester's phone."
- **Required assets:** 1024×1024 icon, 5 screenshots per device class, a 30-second preview video helps approval. Apple review usually 24–48h; Google ~hours.

---

## Monetization & API cost controls

**Stance:**
- **v1 (launch):** OpenTable affiliate "Reserve" button on the winner screen, shown only when the restaurant is on OpenTable. Pays ~$1 per confirmed reservation. Fits the existing handoff philosophy — it's a useful CTA, not an ad.
- **v1.5:** DoorDash / Uber Eats affiliate buttons on the winner screen for the delivery-curious. Same pattern: optional, only shown when relevant.
- **Never:** display ads, promoted/sponsored placements in the elimination flow, paywalls on filters or radius. The integrity of the core mechanic is non-negotiable.

**Why this works.** The user just made a "going to eat here" decision — that is the moment of highest commercial intent in the entire app. A "Reserve" button placed there is genuinely useful, not interruptive. It also aligns directly with the "decide now, eat at 7pm" use case the app already encourages.

**API cost realities (Google Places New, late-2025 pricing).**
| Operation | Cost |
|---|---|
| `searchNearby` | ~$0.032/call |
| `Place Photos` | ~$0.007/call |
| GCP Maps Platform free credit | $200/month |

Per-session cost with caching working: ~$0.05–$0.10. The free credit covers ~600–2,000 sessions/month. The pain point is roughly 500 DAU; below that, the free tier covers everything. At scale, OpenTable affiliate revenue should approximately keep pace if conversion to bookings is ≥5% of winner screens.

**Required cost controls** (these are not optional — they're plan-level requirements):

1. **Aggressive proxy caching.** Bucket queries by `(geohash[6], radiusBucket, filterHash)` with 30-min TTL. In dense urban areas, cache hit rate hits 70–90%, cutting API spend 5–10×.
2. **Photo CDN caching.** Run Place Photo URLs through a CDN (Cloudflare in front of Vercel — free tier is enough) with 24h TTL. Photos are stable; re-fetching is wasteful.
3. **Smart map-screen throttling.** Only re-query Places when the user *releases* the radius slider or *finishes* dragging the pin (not during the drag). Add a minimum-change threshold: re-fetch only on >20% radius change or >0.5mi pin move. Prevents panicky exploratory queries.
4. **GCP billing alarm + hard cap.** Configure a $50/month budget alert and a $100 hard cap in the GCP console. If the hard cap trips, the proxy serves cached data only and the app shows a "we're temporarily out of fresh data — try again tomorrow" notice rather than racking up charges.
5. **Per-IP rate limit in the proxy.** ~30 queries/IP/day. Bounds abuse from a single client.

## Open decisions to nail down before/during build

1. **Bundle ID handle:** what reverse-domain prefix to use (e.g. `com.cklein.idkyp`, `io.github.<handle>.idkyp`). Decide before EAS build setup.

---

## Verification

End-to-end test plan once built:

1. **Local dev:** `npx expo start`, run on iOS simulator and Android emulator. Note: because `react-native-maps` is a native module not bundled in Expo Go, do early prototyping in Expo Go for non-map screens, then create an **EAS development build** (`eas build --profile development --platform android`) once maps are added — installs an `.apk` on your real Android phone with full native support and ongoing JS hot-reload. Use Expo's location simulation to test (a) dense city center, (b) rural area with <5 restaurants, (c) location permission denied.
2. **Backend proxy:** `curl` the deployed Vercel function with sample lat/lng; verify response shape and that the API key never appears in client bundle (`grep` the production build).
3. **Cost smoke test:** Open Google Cloud billing dashboard. Run 50 cold sessions; confirm spend stays inside $200 free credit. If a single test session costs >$0.10, the field mask is wrong.
4. **TestFlight + Play Internal Testing:** Install on at least one real iOS and one real Android device. Walk through the full flow at a real address. Things that only break on device: GPS accuracy, photo loading over cellular, cold-start permission UX.
5. **Edge cases:** airplane mode mid-session, radius=0.5mi in a strip mall (sparse), radius=10mi in Manhattan (dense, dedupe matters), rapid-tap to eliminate (race conditions in the slide-in animation).

A v1 is "done" when a friend can install from TestFlight, get to a winner in <60 seconds, and say "yeah, we're going there."
