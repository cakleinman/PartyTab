import type { Filters, Restaurant } from "./types";
import { isOpenAt } from "./geo";

export function matchesFilters(r: Restaurant, f: Filters, now: Date = new Date()): boolean {
  if (r.distance > f.radius) return false;
  if (r.rating < f.minRating) return false;
  if (f.priceLevels.length > 0 && !f.priceLevels.includes(r.price)) return false;
  if (f.excludeCuisines.includes(r.cuisine)) return false;
  if (f.dietary.length > 0) {
    const has = f.dietary.every((tag) => r.tags.includes(tag));
    if (!has) return false;
  }

  if (f.whenMode === "now") {
    // Trust Places' live signal first. If it's null (Places didn't return it),
    // fall back to computing from structured periods. Only drop the place if
    // we have a definitive "closed" answer — unknowns pass through so we
    // don't over-filter in areas where Google's hours data is sparse.
    if (r.openNow === false) return false;
    if (r.openNow === null) {
      const computed = isOpenAt(r.periods, now);
      if (computed === false) return false;
    }
  } else if (f.whenMode === "custom") {
    const target = targetDateFromCustom(Number(f.day), Number(f.hour), now);
    const computed = isOpenAt(r.periods, target);
    // Periods missing → unknown; keep place rather than drop (same rationale
    // as the now-mode null fallthrough).
    if (computed === false) return false;
  }

  return true;
}

export function applyFilters(list: Restaurant[], f: Filters, now: Date = new Date()): Restaurant[] {
  return list.filter((r) => matchesFilters(r, f, now));
}

function targetDateFromCustom(dayOffset: number, hour: number, now: Date): Date {
  const safeOffset = Number.isFinite(dayOffset) ? Math.max(0, Math.min(6, Math.trunc(dayOffset))) : 0;
  const safeHour = Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.trunc(hour))) : now.getHours();
  const d = new Date(now);
  d.setDate(d.getDate() + safeOffset);
  d.setHours(safeHour, 0, 0, 0);
  return d;
}
