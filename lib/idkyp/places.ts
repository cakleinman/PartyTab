import type { LatLng, OpeningPeriod, Restaurant } from "./types";
import {
  distanceMiles,
  estDriveMinutes,
  inferCuisine,
  PHOTO_BY_CUISINE,
  TAGS_BY_CUISINE,
} from "./geo";
import { getRedis } from "@/lib/upstash/client";

export type PlacesQuery = {
  center: LatLng;
  radiusMiles: number;
};

export type PlacesResult = {
  restaurants: Restaurant[];
  mode: "live" | "demo";
};

const MILE_IN_METERS = 1609.344;
const MAX_RESULTS_PER_PAGE = 20;
const MAX_PAGES = 3; // Places Text Search caps at 60 results across 3 pages
const PHOTO_MAX_HEIGHT_PX = 800;
const MAX_PHOTOS_PER_PLACE = 3;

// The New Places API emits transient 429 RESOURCE_EXHAUSTED / 5xx UNAVAILABLE
// and recommends exponential backoff. Without it, a single hiccup turns the
// whole search into a user-facing "HTTP 503" (see app/api/idkyp/places/route.ts).
const TRANSIENT_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const PLACES_MAX_ATTEMPTS = 3; // 1 initial + 2 retries
const PLACES_BASE_BACKOFF_MS = 400;
const PLACES_MAX_BACKOFF_MS = 4000;

export function isTransientPlacesStatus(status: number): boolean {
  return TRANSIENT_HTTP_STATUSES.has(status);
}

/**
 * Parse a `Retry-After` header (delta-seconds or HTTP-date) into milliseconds,
 * clamped to [0, PLACES_MAX_BACKOFF_MS]. Returns null when absent/unparseable
 * so the caller falls back to computed backoff.
 */
export function parseRetryAfterMs(header: string | null, nowMs: number): number | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (/^\d+$/.test(trimmed)) {
    return Math.min(Number(trimmed) * 1000, PLACES_MAX_BACKOFF_MS);
  }
  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    return Math.max(0, Math.min(dateMs - nowMs, PLACES_MAX_BACKOFF_MS));
  }
  return null;
}

/** Exponential backoff with full jitter, capped. Pure given `rand` (0..1). */
export function backoffDelayMs(attempt: number, rand: number = Math.random()): number {
  const exp = Math.min(PLACES_BASE_BACKOFF_MS * 2 ** attempt, PLACES_MAX_BACKOFF_MS);
  return Math.round(exp * (0.5 + rand * 0.5)); // jitter across 50–100% of the window
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * fetch() wrapper that retries transient upstream failures (network errors and
 * 429/5xx) with exponential backoff, honoring `Retry-After` when present.
 * Non-transient responses (e.g. 400/403) and the final attempt return as-is so
 * the caller's existing error handling reports the real status.
 */
async function fetchPlacesWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < PLACES_MAX_ATTEMPTS; attempt++) {
    const isLast = attempt === PLACES_MAX_ATTEMPTS - 1;
    try {
      const res = await fetch(url, init);
      if (res.ok || !isTransientPlacesStatus(res.status) || isLast) return res;
      const wait =
        parseRetryAfterMs(res.headers.get("retry-after"), Date.now()) ?? backoffDelayMs(attempt);
      console.warn(
        `[idkyp] Places ${res.status}, retrying in ${wait}ms (attempt ${attempt + 1}/${PLACES_MAX_ATTEMPTS})`,
      );
      await sleep(wait);
    } catch (e) {
      // Network/DNS/abort error — retry unless this was the last attempt.
      lastError = e;
      if (isLast) throw e;
      const wait = backoffDelayMs(attempt);
      console.warn(
        `[idkyp] Places fetch error, retrying in ${wait}ms (attempt ${attempt + 1}/${PLACES_MAX_ATTEMPTS}): ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await sleep(wait);
    }
  }
  // Unreachable: the loop either returns or throws on the last attempt.
  throw lastError instanceof Error ? lastError : new Error("Places request failed");
}

const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.regularOpeningHours.periods",
  "places.currentOpeningHours.openNow",
  "places.photos.name",
  "places.websiteUri",
].join(",");

export function isPlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

export async function fetchNearbyRestaurants(query: PlacesQuery): Promise<PlacesResult> {
  if (!isPlacesConfigured()) {
    const { RESTAURANTS } = await import("./data");
    return { restaurants: filterToRadius(RESTAURANTS, query), mode: "demo" };
  }

  const cached = await readCache(query);
  if (cached) return { restaurants: cached, mode: "live" };

  // Places API New: Nearby Search caps at 20 results with no pagination.
  // Text Search supports pagination via pageToken up to 60 results across
  // 3 pages, so we use Text Search with a textQuery + locationBias circle.
  const radiusMeters = Math.min(query.radiusMiles * MILE_IN_METERS, 50_000);
  const allPlaces: PlaceResponse[] = [];
  const seenIds = new Set<string>();
  let pageToken: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const requestBody: Record<string, unknown> = {
      textQuery: "restaurants",
      includedType: "restaurant",
      maxResultCount: MAX_RESULTS_PER_PAGE,
      locationBias: {
        circle: {
          center: { latitude: query.center.lat, longitude: query.center.lng },
          radius: radiusMeters,
        },
      },
    };
    if (pageToken) requestBody.pageToken = pageToken;

    const res = await fetchPlacesWithRetry("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask": `${PLACES_FIELD_MASK},nextPageToken`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (page === 0) {
        throw new Error(`Places API ${res.status}: ${body.slice(0, 200)}`);
      }
      // Pagination failure on page 2/3 — keep what we have
      break;
    }

    const data = (await res.json()) as {
      places?: PlaceResponse[];
      nextPageToken?: string;
    };
    for (const p of data.places ?? []) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        allPlaces.push(p);
      }
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  const draft = allPlaces.map((p, i) => adaptPlace(p, query.center, i + 1));

  // Resolve up to MAX_PHOTOS_PER_PLACE photo URLs per place, in parallel.
  // Best-effort: any failure falls through to the cuisine-keyed Unsplash
  // placeholder already populated by adaptPlace().
  const restaurants = await Promise.all(
    draft.map(async (r, i) => {
      let photoNames = (allPlaces[i]?.photos ?? [])
        .slice(0, MAX_PHOTOS_PER_PLACE)
        .map((p) => p.name);
      // Text Search frequently omits photos that Place Details returns in full.
      // Fall back to a per-place Details lookup before giving up on real photos.
      if (photoNames.length === 0) {
        photoNames = (await fetchPlacePhotoNames(r.placeId)).slice(0, MAX_PHOTOS_PER_PLACE);
      }
      if (photoNames.length === 0) {
        console.warn(`[idkyp] no Places photos for ${r.name} (${r.placeId}) after details fallback`);
        return r;
      }
      const resolved = await Promise.all(
        photoNames.map((n) => resolvePhotoUrl(n).catch(() => null)),
      );
      const urls = resolved.filter((u): u is string => Boolean(u));
      if (urls.length === 0) {
        console.warn(
          `[idkyp] all ${photoNames.length} photo resolutions failed for ${r.name} (${r.placeId})`,
        );
        return r;
      }
      return { ...r, photo: urls[0], photos: urls };
    }),
  );

  await writeCache(query, restaurants);
  return { restaurants, mode: "live" };
}

function filterToRadius(list: Restaurant[], query: PlacesQuery): Restaurant[] {
  return list
    .map((r, i) => {
      const dist = distanceMiles(query.center, { lat: r.lat, lng: r.lng });
      return {
        ...r,
        id: i + 1,
        distance: Math.round(dist * 10) / 10,
        drive: estDriveMinutes(dist),
      };
    })
    .filter((r) => r.distance <= query.radiusMiles);
}

/**
 * Fetch photo resource names for a single place via Place Details. Text Search
 * often returns no `photos` array even when a place has photos; the Details
 * endpoint returns the canonical list. Best-effort — returns [] on any failure.
 */
async function fetchPlacePhotoNames(placeId: string): Promise<string[]> {
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask": "photos.name",
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: { name: string }[] };
    return (data.photos ?? []).map((p) => p.name);
  } catch {
    return [];
  }
}

/**
 * Resolve a Places Photo resource name to a Google CDN URL via
 * `skipHttpRedirect=true` (returns JSON with `photoUri` instead of a 302).
 * That CDN URL is signed/short-lived but loadable from the browser
 * without exposing our API key.
 */
async function resolvePhotoUrl(photoName: string): Promise<string | null> {
  const url = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  url.searchParams.set("maxHeightPx", String(PHOTO_MAX_HEIGHT_PX));
  url.searchParams.set("skipHttpRedirect", "true");
  const res = await fetch(url.toString(), {
    headers: { "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY! },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { photoUri?: string };
  return data.photoUri ?? null;
}

// ----- Places API response adapter -----

type PlaceResponse = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE"
    | "PRICE_LEVEL_UNSPECIFIED";
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    periods?: {
      open?: { day?: number; hour?: number; minute?: number };
      close?: { day?: number; hour?: number; minute?: number };
    }[];
  };
  currentOpeningHours?: { openNow?: boolean };
  photos?: { name: string }[];
  websiteUri?: string;
};

type RawPeriod = NonNullable<NonNullable<PlaceResponse["regularOpeningHours"]>["periods"]>[number];

function adaptPeriods(raw: RawPeriod[] | undefined): OpeningPeriod[] | null {
  if (!raw || raw.length === 0) return null;
  const out: OpeningPeriod[] = [];
  for (const p of raw) {
    if (
      !p.open ||
      typeof p.open.day !== "number" ||
      typeof p.open.hour !== "number"
    ) {
      continue;
    }
    const open = {
      day: p.open.day,
      hour: p.open.hour,
      minute: typeof p.open.minute === "number" ? p.open.minute : 0,
    };
    if (
      !p.close ||
      typeof p.close.day !== "number" ||
      typeof p.close.hour !== "number"
    ) {
      out.push({ open });
      continue;
    }
    out.push({
      open,
      close: {
        day: p.close.day,
        hour: p.close.hour,
        minute: typeof p.close.minute === "number" ? p.close.minute : 0,
      },
    });
  }
  return out.length === 0 ? null : out;
}

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
  PRICE_LEVEL_UNSPECIFIED: 2,
};

export function adaptPlace(p: PlaceResponse, center: LatLng, id: number): Restaurant {
  const lat = p.location?.latitude ?? center.lat;
  const lng = p.location?.longitude ?? center.lng;
  const dist = distanceMiles(center, { lat, lng });
  const cuisine = inferCuisine(p.types ?? []);
  return {
    id,
    placeId: p.id,
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    cuisine,
    rating: p.rating ?? 0,
    reviews: p.userRatingCount ?? 0,
    price: p.priceLevel ? (PRICE_LEVEL_MAP[p.priceLevel] ?? 2) : 2,
    distance: Math.round(dist * 10) / 10,
    drive: estDriveMinutes(dist),
    tags: TAGS_BY_CUISINE[cuisine] ?? [],
    lat,
    lng,
    photo: PHOTO_BY_CUISINE[cuisine] ?? PHOTO_BY_CUISINE.Restaurant,
    photos: [PHOTO_BY_CUISINE[cuisine] ?? PHOTO_BY_CUISINE.Restaurant],
    hours: p.regularOpeningHours?.weekdayDescriptions ?? null,
    periods: adaptPeriods(p.regularOpeningHours?.periods),
    openNow: typeof p.currentOpeningHours?.openNow === "boolean" ? p.currentOpeningHours.openNow : null,
    realReviews: null,
    website: Boolean(p.websiteUri),
    websiteUrl: p.websiteUri ?? null,
  };
}

// ----- Cache (Upstash with in-memory fallback) -----

const memoryCache = new Map<string, { restaurants: Restaurant[]; expiresAt: number }>();

function cacheKey(query: PlacesQuery): string {
  const lat = query.center.lat.toFixed(3);
  const lng = query.center.lng.toFixed(3);
  const radius = (Math.round(query.radiusMiles * 2) / 2).toFixed(1);
  return `idkyp:places:${lat}:${lng}:${radius}`;
}

function cacheTtlSeconds(): number {
  const v = Number(process.env.IDKYP_PLACES_CACHE_TTL_SECONDS);
  // 30 minutes default — Places Photo CDN URLs are short-lived so we keep
  // cached restaurant rows relatively fresh.
  return Number.isFinite(v) && v > 0 ? v : 1800;
}

async function readCache(query: PlacesQuery): Promise<Restaurant[] | null> {
  const key = cacheKey(query);
  const redis = getRedis();
  if (redis) {
    const hit = await redis.get<Restaurant[]>(key);
    return hit ?? null;
  }
  const mem = memoryCache.get(key);
  if (!mem) return null;
  if (mem.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return mem.restaurants;
}

async function writeCache(query: PlacesQuery, restaurants: Restaurant[]): Promise<void> {
  const key = cacheKey(query);
  const ttl = cacheTtlSeconds();
  const redis = getRedis();
  if (redis) {
    await redis.set(key, restaurants, { ex: ttl });
    return;
  }
  memoryCache.set(key, { restaurants, expiresAt: Date.now() + ttl * 1000 });
}
