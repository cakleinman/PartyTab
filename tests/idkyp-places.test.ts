import { describe, it, expect } from "vitest";
import { adaptPlace } from "../lib/idkyp/places";
import type { LatLng } from "../lib/idkyp/types";

const center: LatLng = { lat: 40.7128, lng: -74.006 };

describe("adaptPlace", () => {
  it("maps PRICE_LEVEL_MODERATE to 2", () => {
    const r = adaptPlace(
      {
        id: "pl_001",
        displayName: { text: "Joe's Pizza" },
        formattedAddress: "7 Carmine St, New York, NY",
        location: { latitude: 40.7307, longitude: -74.0023 },
        types: ["pizza_restaurant"],
        rating: 4.5,
        userRatingCount: 1200,
        priceLevel: "PRICE_LEVEL_MODERATE",
      },
      center,
      1,
    );
    expect(r.price).toBe(2);
    expect(r.cuisine).toBe("Pizza");
    expect(r.name).toBe("Joe's Pizza");
    expect(r.placeId).toBe("pl_001");
  });

  it("defaults price to 2 when unspecified", () => {
    const r = adaptPlace(
      {
        id: "pl_002",
        displayName: { text: "Anon" },
        location: { latitude: 40.7, longitude: -74.0 },
        types: ["restaurant"],
      },
      center,
      2,
    );
    expect(r.price).toBe(2);
  });

  it("computes distance from center", () => {
    const r = adaptPlace(
      {
        id: "pl_003",
        displayName: { text: "Far" },
        location: { latitude: 40.7128, longitude: -74.006 },
        types: ["restaurant"],
      },
      center,
      3,
    );
    expect(r.distance).toBe(0);
    expect(r.drive).toBe(1);
  });

  it("falls back to cuisine photo when no photos field present", () => {
    const r = adaptPlace(
      {
        id: "pl_004",
        displayName: { text: "Sushi Place" },
        location: { latitude: 40.71, longitude: -74.0 },
        types: ["japanese_restaurant", "sushi_restaurant"],
      },
      center,
      4,
    );
    expect(r.cuisine).toBe("Japanese");
    expect(r.photo).toContain("unsplash.com");
  });

  it("populates openNow + hours from Places fields", () => {
    const r = adaptPlace(
      {
        id: "pl_005",
        displayName: { text: "Open Diner" },
        location: { latitude: 40.7, longitude: -74.0 },
        types: ["diner"],
        currentOpeningHours: { openNow: true },
        regularOpeningHours: {
          weekdayDescriptions: ["Monday: 7:00 AM – 10:00 PM", "Tuesday: 7:00 AM – 10:00 PM"],
        },
        websiteUri: "https://opendiner.example",
      },
      center,
      5,
    );
    expect(r.openNow).toBe(true);
    expect(r.hours).toEqual([
      "Monday: 7:00 AM – 10:00 PM",
      "Tuesday: 7:00 AM – 10:00 PM",
    ]);
    expect(r.websiteUrl).toBe("https://opendiner.example");
    expect(r.website).toBe(true);
  });

  it("leaves openNow null when Places didn't return it", () => {
    const r = adaptPlace(
      {
        id: "pl_006",
        displayName: { text: "Mystery" },
        location: { latitude: 40.7, longitude: -74.0 },
        types: ["restaurant"],
      },
      center,
      6,
    );
    expect(r.openNow).toBeNull();
    expect(r.hours).toBeNull();
    expect(r.periods).toBeNull();
    expect(r.websiteUrl).toBeNull();
    expect(r.website).toBe(false);
  });

  it("adapts Places regularOpeningHours.periods into structured intervals", () => {
    const r = adaptPlace(
      {
        id: "pl_007",
        displayName: { text: "Hours Place" },
        location: { latitude: 40.7, longitude: -74.0 },
        types: ["restaurant"],
        regularOpeningHours: {
          periods: [
            { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 22, minute: 30 } },
            { open: { day: 6, hour: 22, minute: 0 }, close: { day: 0, hour: 2, minute: 0 } },
          ],
        },
      },
      center,
      7,
    );
    expect(r.periods).toEqual([
      { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 22, minute: 30 } },
      { open: { day: 6, hour: 22, minute: 0 }, close: { day: 0, hour: 2, minute: 0 } },
    ]);
  });

  it("preserves 24-hour periods (single open with no close)", () => {
    const r = adaptPlace(
      {
        id: "pl_008",
        displayName: { text: "24-Hour Diner" },
        location: { latitude: 40.7, longitude: -74.0 },
        types: ["diner"],
        regularOpeningHours: {
          periods: [{ open: { day: 0, hour: 0, minute: 0 } }],
        },
      },
      center,
      8,
    );
    expect(r.periods).toEqual([{ open: { day: 0, hour: 0, minute: 0 } }]);
  });
});
