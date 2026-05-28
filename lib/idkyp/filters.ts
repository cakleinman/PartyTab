import type { Filters, Restaurant } from "./types";

export function matchesFilters(r: Restaurant, f: Filters): boolean {
  if (r.distance > f.radius) return false;
  if (r.rating < f.minRating) return false;
  if (f.priceLevels.length > 0 && !f.priceLevels.includes(r.price)) return false;
  if (f.excludeCuisines.includes(r.cuisine)) return false;
  if (f.dietary.length > 0) {
    const has = f.dietary.every((tag) => r.tags.includes(tag));
    if (!has) return false;
  }
  // When the user picked "Now", hide places that Places explicitly reported
  // as closed. openNow === null means "unknown" (Places didn't return current
  // hours for this place) — we keep those so we don't drop too many. Custom
  // mode is unfiltered because we'd need structured periods to evaluate it.
  if (f.whenMode === "now" && r.openNow === false) return false;
  return true;
}

export function applyFilters(list: Restaurant[], f: Filters): Restaurant[] {
  return list.filter((r) => matchesFilters(r, f));
}
