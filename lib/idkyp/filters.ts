import type { Filters, Restaurant } from "./types";
import { isOpenAt } from "./geo";

/**
 * Map-screen filter: only radius + when. Preference filters (rating, price,
 * cuisines, dietary) live on the Filters screen, so the count shown over the
 * map reflects "what's physically reachable and open" — the user hasn't
 * expressed preferences yet at that stage.
 */
export function matchesMapFilters(r: Restaurant, f: Filters, now: Date = new Date()): boolean {
  if (r.distance > f.radius) return false;
  return matchesWhen(r, f, now);
}

export function applyMapFilters(
  list: Restaurant[],
  f: Filters,
  now: Date = new Date(),
): Restaurant[] {
  return list.filter((r) => matchesMapFilters(r, f, now));
}

export function matchesFilters(r: Restaurant, f: Filters, now: Date = new Date()): boolean {
  if (!matchesMapFilters(r, f, now)) return false;
  if (r.rating < f.minRating) return false;
  if (f.priceLevels.length > 0 && !f.priceLevels.includes(r.price)) return false;
  if (f.excludeCuisines.includes(r.cuisine)) return false;
  if (f.dietary.length > 0) {
    const has = f.dietary.every((tag) => r.tags.includes(tag));
    if (!has) return false;
  }
  return true;
}

export function applyFilters(list: Restaurant[], f: Filters, now: Date = new Date()): Restaurant[] {
  return list.filter((r) => matchesFilters(r, f, now));
}

function matchesWhen(r: Restaurant, f: Filters, now: Date): boolean {
  if (f.whenMode === "now") {
    // Trust Places' live signal first. If null (Places didn't return it), fall
    // back to computed-from-periods. Unknowns pass through so we don't
    // over-filter in areas with sparse hours data.
    if (r.openNow === false) return false;
    if (r.openNow === null) {
      const computed = isOpenAt(r.periods, now);
      if (computed === false) return false;
    }
    return true;
  }
  if (f.whenMode === "custom") {
    const target = targetDateFromCustom(Number(f.day), Number(f.hour), now);
    const computed = isOpenAt(r.periods, target);
    return computed !== false;
  }
  return true;
}

function targetDateFromCustom(dayOffset: number, hour: number, now: Date): Date {
  const safeOffset = Number.isFinite(dayOffset)
    ? Math.max(0, Math.min(6, Math.trunc(dayOffset)))
    : 0;
  const safeHour = Number.isFinite(hour)
    ? Math.max(0, Math.min(23, Math.trunc(hour)))
    : now.getHours();
  const d = new Date(now);
  d.setDate(d.getDate() + safeOffset);
  d.setHours(safeHour, 0, 0, 0);
  return d;
}
