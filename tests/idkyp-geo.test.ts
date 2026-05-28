import { describe, it, expect } from "vitest";
import { isOpenAt } from "../lib/idkyp/geo";
import type { OpeningPeriod } from "../lib/idkyp/types";

describe("isOpenAt", () => {
  it("returns null when periods are missing", () => {
    expect(isOpenAt(null, new Date(2026, 4, 27, 12, 0, 0))).toBeNull();
    expect(isOpenAt([], new Date(2026, 4, 27, 12, 0, 0))).toBeNull();
  });

  it("returns true for 24-hour places (single period with no close)", () => {
    const periods: OpeningPeriod[] = [{ open: { day: 0, hour: 0, minute: 0 } }];
    expect(isOpenAt(periods, new Date(2026, 4, 27, 3, 30, 0))).toBe(true);
  });

  it("matches a normal same-day window", () => {
    // Mon (day=1) 09:00 - 22:00
    const periods: OpeningPeriod[] = [
      { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 22, minute: 0 } },
    ];
    // 2026-05-25 is a Monday
    expect(isOpenAt(periods, new Date(2026, 4, 25, 12, 0, 0))).toBe(true);
    expect(isOpenAt(periods, new Date(2026, 4, 25, 8, 59, 0))).toBe(false);
    expect(isOpenAt(periods, new Date(2026, 4, 25, 22, 0, 0))).toBe(false);
  });

  it("matches a Sat→Sun overnight window", () => {
    // Sat (6) 22:00 → Sun (0) 02:00
    const periods: OpeningPeriod[] = [
      { open: { day: 6, hour: 22, minute: 0 }, close: { day: 0, hour: 2, minute: 0 } },
    ];
    // 2026-05-30 is a Saturday
    expect(isOpenAt(periods, new Date(2026, 4, 30, 23, 0, 0))).toBe(true);
    // 2026-05-31 is a Sunday
    expect(isOpenAt(periods, new Date(2026, 4, 31, 1, 0, 0))).toBe(true);
    expect(isOpenAt(periods, new Date(2026, 4, 31, 3, 0, 0))).toBe(false);
  });

  it("respects minute precision at the open boundary", () => {
    const periods: OpeningPeriod[] = [
      { open: { day: 3, hour: 11, minute: 30 }, close: { day: 3, hour: 14, minute: 0 } },
    ];
    // 2026-05-27 is a Wednesday
    expect(isOpenAt(periods, new Date(2026, 4, 27, 11, 29, 0))).toBe(false);
    expect(isOpenAt(periods, new Date(2026, 4, 27, 11, 30, 0))).toBe(true);
  });

  it("returns false when no period covers the target", () => {
    const periods: OpeningPeriod[] = [
      { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 17, minute: 0 } },
      { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 17, minute: 0 } },
    ];
    // Sunday afternoon — neither period covers
    expect(isOpenAt(periods, new Date(2026, 4, 31, 14, 0, 0))).toBe(false);
  });
});
