import { describe, it, expect } from "vitest";
import { allocateProportionally, allocateReceiptProportionally } from "../lib/money/allocation";

describe("allocateProportionally", () => {
  it("distributes cents proportionally to subtotals", () => {
    const items = [
      { id: "item1", subtotalCents: 1000 }, // 1/3
      { id: "item2", subtotalCents: 2000 }, // 2/3
    ];
    const totalToDistribute = 100; // 1 dollar

    const result = allocateProportionally(items, totalToDistribute);

    // item1: 33.333... -> 33
    // item2: 66.666... -> 67 (larger remainder)
    expect(result["item1"]).toBe(33);
    expect(result["item2"]).toBe(67);
    expect(result["item1"] + result["item2"]).toBe(100);
  });

  it("handles exact division", () => {
    const items = [
      { id: "item1", subtotalCents: 1000 },
      { id: "item2", subtotalCents: 1000 },
    ];
    const totalToDistribute = 100;

    const result = allocateProportionally(items, totalToDistribute);

    expect(result["item1"]).toBe(50);
    expect(result["item2"]).toBe(50);
  });

  it("is deterministic when remainders are tied (uses ID sorting)", () => {
    const items = [
      { id: "b", subtotalCents: 1000 },
      { id: "a", subtotalCents: 1000 },
    ];
    const totalToDistribute = 1;

    const result = allocateProportionally(items, totalToDistribute);

    // Both have 0.5 remainder. ID "a" comes first alphabetically.
    expect(result["a"]).toBe(1);
    expect(result["b"]).toBe(0);
  });

  it("handles zero sum subtotals by splitting evenly", () => {
    const items = [
      { id: "item1", subtotalCents: 0 },
      { id: "item2", subtotalCents: 0 },
    ];
    const totalToDistribute = 10;

    const result = allocateProportionally(items, totalToDistribute);

    expect(result["item1"]).toBe(5);
    expect(result["item2"]).toBe(5);
  });
});

describe("allocateReceiptProportionally", () => {
  it("correctly aggregates all distributed amounts", () => {
    const items = [
      { id: "item1", subtotalCents: 1000 },
      { id: "item2", subtotalCents: 2000 },
    ];
    
    const result = allocateReceiptProportionally(
      items,
      100, // tax
      200, // tip
      50   // fees
    );

    expect(result).toHaveLength(2);
    
    const i1 = result.find(r => r.itemId === "item1")!;
    const i2 = result.find(r => r.itemId === "item2")!;

    // item1: tax=33, tip=67, fees=17 (theoretical 16.66)
    // item2: tax=67, tip=133, fees=33 (theoretical 33.33)
    
    expect(i1.taxCents + i2.taxCents).toBe(100);
    expect(i1.tipCents + i2.tipCents).toBe(200);
    expect(i1.feesCents + i2.feesCents).toBe(50);

    expect(i1.totalCents).toBe(1000 + i1.taxCents + i1.tipCents + i1.feesCents);
    expect(i2.totalCents).toBe(2000 + i2.taxCents + i2.tipCents + i2.feesCents);
  });
});
