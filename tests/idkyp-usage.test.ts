import { describe, it, expect } from "vitest";
import { IDKYP_FREE_MONTHLY_LIMIT } from "../lib/idkyp/usage";

describe("IDKYP usage constants", () => {
  it("exposes the free monthly limit of 4", () => {
    expect(IDKYP_FREE_MONTHLY_LIMIT).toBe(4);
  });
});
