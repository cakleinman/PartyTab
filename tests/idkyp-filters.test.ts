import { describe, it, expect } from "vitest";
import { applyFilters, matchesFilters } from "../lib/idkyp/filters";
import type { Filters, Restaurant } from "../lib/idkyp/types";

const baseFilters: Filters = {
  whenMode: "now",
  day: "0",
  hour: "19",
  radius: 5,
  priceLevels: [1, 2, 3, 4],
  minRating: 3.5,
  dietary: [],
  excludeCuisines: [],
};

const restaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  id: 1,
  placeId: "p1",
  name: "Test",
  address: "1 Main St",
  cuisine: "American",
  rating: 4.2,
  reviews: 100,
  price: 2,
  distance: 1,
  drive: 5,
  tags: [],
  lat: 0,
  lng: 0,
  photo: "",
  hours: null,
  realReviews: null,
  website: true,
  ...overrides,
});

describe("matchesFilters", () => {
  it("excludes restaurants outside the radius", () => {
    expect(matchesFilters(restaurant({ distance: 10 }), baseFilters)).toBe(false);
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

  it("requires all selected dietary tags", () => {
    expect(
      matchesFilters(restaurant({ tags: ["vegetarian"] }), {
        ...baseFilters,
        dietary: ["vegetarian", "vegan"],
      }),
    ).toBe(false);
  });
});

describe("applyFilters", () => {
  it("returns only matching restaurants", () => {
    const list = [
      restaurant({ placeId: "a", distance: 1 }),
      restaurant({ placeId: "b", distance: 99 }),
    ];
    const result = applyFilters(list, baseFilters);
    expect(result.map((r) => r.placeId)).toEqual(["a"]);
  });
});
