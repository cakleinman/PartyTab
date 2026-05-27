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

  it("falls back to cuisine photo", () => {
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
});
