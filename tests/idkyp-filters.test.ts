import { describe, it, expect } from "vitest";
import { applyFilters, applyMapFilters, matchesFilters } from "../lib/idkyp/filters";
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
  photos: [],
  hours: null,
  periods: null,
  openNow: null,
  realReviews: null,
  website: true,
  websiteUrl: null,
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

  it("excludes openNow=false places when whenMode='now'", () => {
    expect(matchesFilters(restaurant({ openNow: false }), baseFilters)).toBe(false);
  });

  it("keeps openNow=null places when whenMode='now' (unknown hours)", () => {
    expect(matchesFilters(restaurant({ openNow: null }), baseFilters)).toBe(true);
  });

  it("does NOT apply openNow filter when whenMode='custom'", () => {
    expect(
      matchesFilters(restaurant({ openNow: false }), { ...baseFilters, whenMode: "custom" }),
    ).toBe(true);
  });

  it("falls back to periods when openNow is null in 'now' mode (open case)", () => {
    // Wed 19:00 (target weekday=3, hour=19)
    const wedEvening = new Date(2026, 4, 27, 19, 0, 0);
    const r = restaurant({
      openNow: null,
      periods: [
        { open: { day: 3, hour: 9, minute: 0 }, close: { day: 3, hour: 22, minute: 0 } },
      ],
    });
    expect(matchesFilters(r, baseFilters, wedEvening)).toBe(true);
  });

  it("drops closed places when openNow is null and periods say closed (now mode)", () => {
    // Wed 04:00 — outside the 9-22 window
    const wedDawn = new Date(2026, 4, 27, 4, 0, 0);
    const r = restaurant({
      openNow: null,
      periods: [
        { open: { day: 3, hour: 9, minute: 0 }, close: { day: 3, hour: 22, minute: 0 } },
      ],
    });
    expect(matchesFilters(r, baseFilters, wedDawn)).toBe(false);
  });

  it("keeps openNow=null + periods=null in 'now' mode (unknown stays in pool)", () => {
    expect(matchesFilters(restaurant({ openNow: null, periods: null }), baseFilters)).toBe(true);
  });

  it("applies isOpenAt at the custom day+hour when whenMode='custom'", () => {
    // "Today" = Wed (weekday=3). dayOffset=2 → Fri. Period says Fri 11-14.
    const today = new Date(2026, 4, 27, 10, 0, 0); // Wed 10am
    const customFilters: Filters = {
      ...baseFilters,
      whenMode: "custom",
      day: "2",
      hour: "12",
    };
    const r = restaurant({
      periods: [
        { open: { day: 5, hour: 11, minute: 0 }, close: { day: 5, hour: 14, minute: 0 } },
      ],
    });
    expect(matchesFilters(r, customFilters, today)).toBe(true);

    const closedAtThat = restaurant({
      periods: [
        { open: { day: 5, hour: 17, minute: 0 }, close: { day: 5, hour: 22, minute: 0 } },
      ],
    });
    expect(matchesFilters(closedAtThat, customFilters, today)).toBe(false);
  });

  it("keeps places with null periods when whenMode='custom' (unknown passes through)", () => {
    const today = new Date(2026, 4, 27, 10, 0, 0);
    const customFilters: Filters = { ...baseFilters, whenMode: "custom", day: "0", hour: "12" };
    expect(matchesFilters(restaurant({ periods: null }), customFilters, today)).toBe(true);
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

describe("applyMapFilters (radius + when only, no preferences)", () => {
  it("excludes places outside the radius", () => {
    const list = [
      restaurant({ placeId: "near", distance: 1 }),
      restaurant({ placeId: "far", distance: 99 }),
    ];
    const result = applyMapFilters(list, baseFilters);
    expect(result.map((r) => r.placeId)).toEqual(["near"]);
  });

  it("ignores preference filters (rating, price, cuisine, dietary)", () => {
    // A restaurant that would FAIL matchesFilters because of preferences
    // should still pass matchesMapFilters — preferences apply on next screen.
    const r = restaurant({
      rating: 1.0, // below baseFilters.minRating=3.5
      price: 4,
      cuisine: "Italian",
      tags: [],
    });
    const preferenceHeavy = {
      ...baseFilters,
      priceLevels: [1],
      excludeCuisines: ["Italian"],
      dietary: ["vegan"],
    };
    expect(applyFilters([r], preferenceHeavy)).toEqual([]);
    expect(applyMapFilters([r], preferenceHeavy)).toEqual([r]);
  });

  it("excludes openNow=false places in now mode", () => {
    expect(applyMapFilters([restaurant({ openNow: false })], baseFilters)).toEqual([]);
  });

  it("keeps openNow=null + periods=null places (unknown passes through)", () => {
    const r = restaurant({ openNow: null, periods: null });
    expect(applyMapFilters([r], baseFilters)).toEqual([r]);
  });
});
