import { describe, it, expect } from "vitest";
import { distributeCustomExtras } from "../lib/money/allocation";
import { parseCents, formatCents, formatCentsPlain } from "../lib/money/cents";

describe("distributeCustomExtras", () => {
  it("distributes tax and tip proportionally to base amounts", () => {
    const splits = [
      { participantId: "alice", baseCents: 4500 },  // $45
      { participantId: "bob", baseCents: 3000 },    // $30
      { participantId: "carol", baseCents: 2500 },  // $25
    ];
    const result = distributeCustomExtras(splits, 1000, 2000); // $10 tax, $20 tip

    // Total base = 10000, tax = 1000, tip = 2000
    // Alice: 45% → tax 450, tip 900 → 4500 + 450 + 900 = 5850
    // Bob:   30% → tax 300, tip 600 → 3000 + 300 + 600 = 3900
    // Carol: 25% → tax 250, tip 500 → 2500 + 250 + 500 = 3250
    const alice = result.find((r) => r.participantId === "alice")!;
    const bob = result.find((r) => r.participantId === "bob")!;
    const carol = result.find((r) => r.participantId === "carol")!;

    expect(alice.amountCents).toBe(5850);
    expect(bob.amountCents).toBe(3900);
    expect(carol.amountCents).toBe(3250);
  });

  it("total of distributed amounts equals base + tax + tip exactly", () => {
    const splits = [
      { participantId: "a", baseCents: 3333 },
      { participantId: "b", baseCents: 3333 },
      { participantId: "c", baseCents: 3334 },
    ];
    const taxCents = 847;
    const tipCents = 1999;
    const result = distributeCustomExtras(splits, taxCents, tipCents);

    const totalBase = 3333 + 3333 + 3334;
    const totalResult = result.reduce((sum, r) => sum + r.amountCents, 0);
    expect(totalResult).toBe(totalBase + taxCents + tipCents);
  });

  it("handles tax only (zero tip)", () => {
    const splits = [
      { participantId: "a", baseCents: 5000 },
      { participantId: "b", baseCents: 5000 },
    ];
    const result = distributeCustomExtras(splits, 312, 0);

    const a = result.find((r) => r.participantId === "a")!;
    const b = result.find((r) => r.participantId === "b")!;
    expect(a.amountCents).toBe(5156);
    expect(b.amountCents).toBe(5156);
    expect(a.amountCents + b.amountCents).toBe(10000 + 312);
  });

  it("handles tip only (zero tax)", () => {
    const splits = [
      { participantId: "a", baseCents: 7000 },
      { participantId: "b", baseCents: 3000 },
    ];
    const result = distributeCustomExtras(splits, 0, 2000);

    const a = result.find((r) => r.participantId === "a")!;
    const b = result.find((r) => r.participantId === "b")!;
    expect(a.amountCents).toBe(7000 + 1400); // 70% of $20
    expect(b.amountCents).toBe(3000 + 600);  // 30% of $20
  });

  it("handles both zero tax and tip (returns base amounts unchanged)", () => {
    const splits = [
      { participantId: "a", baseCents: 5000 },
      { participantId: "b", baseCents: 3000 },
    ];
    const result = distributeCustomExtras(splits, 0, 0);

    expect(result[0].amountCents).toBe(5000);
    expect(result[1].amountCents).toBe(3000);
  });

  it("handles single participant (gets 100% of tax and tip)", () => {
    const splits = [{ participantId: "solo", baseCents: 4200 }];
    const result = distributeCustomExtras(splits, 350, 840);

    expect(result).toHaveLength(1);
    expect(result[0].amountCents).toBe(4200 + 350 + 840);
  });

  it("handles empty splits array", () => {
    const result = distributeCustomExtras([], 500, 500);
    expect(result).toEqual([]);
  });

  it("handles rounding correctly with uneven three-way split", () => {
    // $100 split three ways: 33.33, 33.33, 33.34
    // Tax: $1.00 (100 cents) — 33 + 33 + 34 = 100 ✓
    const splits = [
      { participantId: "a", baseCents: 3333 },
      { participantId: "b", baseCents: 3333 },
      { participantId: "c", baseCents: 3334 },
    ];
    const result = distributeCustomExtras(splits, 100, 0);
    const total = result.reduce((sum, r) => sum + r.amountCents, 0);

    // Must sum exactly to base + tax
    expect(total).toBe(10000 + 100);
    // Each person gets their base plus proportional share
    result.forEach((r) => {
      expect(r.amountCents).toBeGreaterThan(r.participantId === "c" ? 3334 : 3333);
    });
  });

  it("handles zero base amounts gracefully (even distribution)", () => {
    const splits = [
      { participantId: "a", baseCents: 0 },
      { participantId: "b", baseCents: 0 },
    ];
    const result = distributeCustomExtras(splits, 100, 200);
    const total = result.reduce((sum, r) => sum + r.amountCents, 0);

    // allocateProportionally splits evenly when all subtotals are 0
    expect(total).toBe(300);
  });

  it("preserves participant order", () => {
    const splits = [
      { participantId: "z-last", baseCents: 2000 },
      { participantId: "a-first", baseCents: 8000 },
    ];
    const result = distributeCustomExtras(splits, 100, 0);

    expect(result[0].participantId).toBe("z-last");
    expect(result[1].participantId).toBe("a-first");
  });
});

describe("parseCents edge cases for custom tax/tip inputs", () => {
  it("parses whole dollar amounts", () => {
    expect(parseCents("5")).toBe(500);
    expect(parseCents("100")).toBe(10000);
  });

  it("parses dollar and cents", () => {
    expect(parseCents("3.12")).toBe(312);
    expect(parseCents("0.99")).toBe(99);
  });

  it("parses single decimal digit (pads to cents)", () => {
    expect(parseCents("5.5")).toBe(550);
  });

  it("rejects more than 2 decimal places", () => {
    expect(() => parseCents("5.123")).toThrow();
  });

  it("rejects empty string when allowZero is false", () => {
    expect(() => parseCents("")).toThrow();
  });

  it("allows zero with allowZero flag", () => {
    expect(parseCents("0", true)).toBe(0);
    expect(parseCents("0.00", true)).toBe(0);
  });

  it("rejects zero without allowZero flag", () => {
    expect(() => parseCents("0")).toThrow();
  });

  it("rejects negative amounts", () => {
    expect(() => parseCents("-5.00")).toThrow();
  });

  it("rejects non-numeric input", () => {
    expect(() => parseCents("abc")).toThrow();
    expect(() => parseCents("$5.00")).toThrow();
  });
});

describe("formatCents and formatCentsPlain", () => {
  it("formats cents to dollar string with $", () => {
    expect(formatCents(1234)).toBe("$12.34");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(100)).toBe("$1.00");
    expect(formatCents(5)).toBe("$0.05");
  });

  it("formats cents to plain decimal string", () => {
    expect(formatCentsPlain(1234)).toBe("12.34");
    expect(formatCentsPlain(0)).toBe("0.00");
    expect(formatCentsPlain(100)).toBe("1.00");
  });
});
