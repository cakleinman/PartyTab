import type { LatLng, Restaurant } from "./types";
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

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
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
      const photoNames = (allPlaces[i]?.photos ?? [])
        .slice(0, MAX_PHOTOS_PER_PLACE)
        .map((p) => p.name);
      if (photoNames.length === 0) {
        console.warn(`[idkyp] no Places photos for ${r.name} (${r.placeId})`);
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
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  currentOpeningHours?: { openNow?: boolean };
  photos?: { name: string }[];
  websiteUri?: string;
};

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
