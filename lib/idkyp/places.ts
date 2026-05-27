import type { Filters, LatLng, Restaurant } from "./types";

export type PlacesQuery = {
  center: LatLng;
  radiusMiles: number;
  filters: Filters;
};

export function isPlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

/**
 * Phase 2 — fetch nearby restaurants from Google Places via server-side proxy.
 * Never call directly from the client; the API key is server-only.
 */
export async function fetchNearbyRestaurants(_query: PlacesQuery): Promise<Restaurant[]> {
  throw new Error("not_implemented: Google Places integration lands in Phase 2");
}
