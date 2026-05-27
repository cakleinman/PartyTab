import type { Filters, Restaurant } from "./types";

export function matchesFilters(restaurant: Restaurant, filters: Filters): boolean {
  if (restaurant.distanceMiles > filters.radiusMiles) return false;
  if (restaurant.rating < filters.minRating) return false;
  if (filters.priceLevels.length > 0 && !filters.priceLevels.includes(restaurant.priceLevel)) {
    return false;
  }
  if (filters.excludeCuisines.includes(restaurant.cuisine)) return false;
  return true;
}

export function applyFilters(restaurants: Restaurant[], filters: Filters): Restaurant[] {
  return restaurants.filter((r) => matchesFilters(r, filters));
}
