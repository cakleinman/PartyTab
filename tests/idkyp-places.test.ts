import { describe, it, expect } from "vitest";
import {
  adaptPlace,
  backoffDelayMs,
  isTransientPlacesStatus,
  parseRetryAfterMs,
} from "../lib/idkyp/places";
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

describe("isTransientPlacesStatus", () => {
  it("treats 429 and 5xx as transient (retryable)", () => {
    for (const s of [429, 500, 502, 503, 504]) {
      expect(isTransientPlacesStatus(s)).toBe(true);
    }
  });

  it("treats client/auth errors as permanent (not retried)", () => {
    for (const s of [400, 401, 403, 404, 200]) {
      expect(isTransientPlacesStatus(s)).toBe(false);
    }
  });
});

describe("parseRetryAfterMs", () => {
  const now = 1_000_000_000_000;

  it("returns null when the header is absent", () => {
    expect(parseRetryAfterMs(null, now)).toBeNull();
  });

  it("parses delta-seconds form", () => {
    expect(parseRetryAfterMs("2", now)).toBe(2000);
  });

  it("parses HTTP-date form relative to now", () => {
    const header = new Date(now + 3000).toUTCString();
    expect(parseRetryAfterMs(header, now)).toBe(3000);
  });

  it("clamps absurdly large waits to the cap", () => {
    expect(parseRetryAfterMs("9999", now)).toBe(4000);
  });

  it("never returns negative for a past HTTP-date", () => {
    const header = new Date(now - 5000).toUTCString();
    expect(parseRetryAfterMs(header, now)).toBe(0);
  });

  it("returns null for unparseable values", () => {
    expect(parseRetryAfterMs("soon", now)).toBeNull();
  });
});

describe("backoffDelayMs", () => {
  it("grows exponentially across attempts (jitter pinned to max)", () => {
    expect(backoffDelayMs(0, 1)).toBe(400);
    expect(backoffDelayMs(1, 1)).toBe(800);
    expect(backoffDelayMs(2, 1)).toBe(1600);
  });

  it("applies at least 50% of the window (jitter pinned to min)", () => {
    expect(backoffDelayMs(0, 0)).toBe(200);
    expect(backoffDelayMs(1, 0)).toBe(400);
  });

  it("caps the exponential growth", () => {
    expect(backoffDelayMs(10, 1)).toBe(4000);
  });
});
