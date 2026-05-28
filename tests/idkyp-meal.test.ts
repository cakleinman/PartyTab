import { describe, it, expect } from "vitest";
import { getMealCopy } from "../lib/idkyp/meal";
import type { Filters } from "../lib/idkyp/types";

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

describe("getMealCopy.winnerEyebrow", () => {
  it("returns 'Right now you're going to' in now mode", () => {
    const r = getMealCopy(baseFilters, new Date(2026, 4, 28, 13, 0, 0));
    expect(r.winnerEyebrow).toBe("Right now you're going to");
  });

  it("returns 'Tonight at X PM' for today + evening (>=17)", () => {
    const f: Filters = { ...baseFilters, whenMode: "custom", day: "0", hour: "19" };
    const r = getMealCopy(f, new Date(2026, 4, 28, 10, 0, 0));
    expect(r.winnerEyebrow).toBe("Tonight at 7 PM, you're going to");
  });

  it("returns 'Today at X' for today + daytime", () => {
    const f: Filters = { ...baseFilters, whenMode: "custom", day: "0", hour: "13" };
    const r = getMealCopy(f, new Date(2026, 4, 28, 10, 0, 0));
    expect(r.winnerEyebrow).toBe("Today at 1 PM, you're going to");
  });

  it("returns 'Tomorrow at X PM' for dayOffset=1", () => {
    const f: Filters = { ...baseFilters, whenMode: "custom", day: "1", hour: "18" };
    const r = getMealCopy(f, new Date(2026, 4, 28, 10, 0, 0));
    expect(r.winnerEyebrow).toBe("Tomorrow at 6 PM, you're going to");
  });

  it("uses weekday name for dayOffset >= 2", () => {
    // 2026-05-28 is Thursday; +3 = Sunday
    const f: Filters = { ...baseFilters, whenMode: "custom", day: "3", hour: "12" };
    const r = getMealCopy(f, new Date(2026, 4, 28, 10, 0, 0));
    expect(r.winnerEyebrow).toBe("Sunday at 12 PM, you're going to");
  });
});

describe("getMealCopy.calendarLabel", () => {
  it.each([
    [8, "Breakfast"],
    [12, "Lunch"],
    [16, "Outing"],
    [19, "Dinner"],
    [22, "Night out"],
    [3, "Night out"],
  ])("hour %i → %s", (hour, expected) => {
    const f: Filters = { ...baseFilters, whenMode: "custom", day: "0", hour: String(hour) };
    const r = getMealCopy(f, new Date(2026, 4, 28, hour, 0, 0));
    expect(r.calendarLabel).toBe(expected);
  });
});
