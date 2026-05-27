import { describe, it, expect } from "vitest";
import { applyFilters, matchesFilters } from "../lib/idkyp/filters";
import type { Filters, Restaurant } from "../lib/idkyp/types";

const baseFilters: Filters = {
  whenMode: "now",
  day: "0",
  hour: "19",
  radiusMiles: 5,
  priceLevels: [1, 2, 3, 4],
  minRating: 3.5,
  dietary: [],
  excludeCuisines: [],
};

const restaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  placeId: "p1",
  name: "Test",
  formattedAddress: "1 Main St",
  lat: 0,
  lng: 0,
  rating: 4.2,
  userRatingsTotal: 100,
  priceLevel: 2,
  types: ["restaurant"],
  cuisine: "American",
  distanceMiles: 1,
  driveMinutes: 5,
  ...overrides,
});

describe("matchesFilters", () => {
  it("excludes restaurants outside the radius", () => {
    expect(matchesFilters(restaurant({ distanceMiles: 10 }), baseFilters)).toBe(false);
  });

  it("excludes restaurants below the rating threshold", () => {
    expect(matchesFilters(restaurant({ rating: 3.0 }), baseFilters)).toBe(false);
  });

  it("excludes cuisines listed in excludeCuisines", () => {
    expect(
      matchesFilters(restaurant({ cuisine: "Italian" }), {
        ...baseFilters,
        excludeCuisines: ["Italian"],
      }),
    ).toBe(false);
  });
});

describe("applyFilters", () => {
  it("returns only matching restaurants", () => {
    const list = [
      restaurant({ placeId: "a", distanceMiles: 1 }),
      restaurant({ placeId: "b", distanceMiles: 99 }),
    ];
    const result = applyFilters(list, baseFilters);
    expect(result.map((r) => r.placeId)).toEqual(["a"]);
  });
});
