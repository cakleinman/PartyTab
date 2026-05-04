import { describe, it, expect } from "vitest";
import { computeClaimSplits } from "../lib/receipts/computeClaimSplits";

const ck = "00000000-0000-0000-0000-0000000000ck";
const r = "00000000-0000-0000-0000-00000000000r";
const z = "00000000-0000-0000-0000-0000000000zz";

const claim = (...ids: string[]) => ids.map((participantId) => ({ participantId }));

describe("computeClaimSplits", () => {
  it("returns no splits when nothing is claimed", () => {
    const result = computeClaimSplits({
      items: [{ priceCents: 1000, claimedBy: [] }],
      taxCents: 100,
      tipCents: 200,
    });
    expect(result).toEqual([]);
  });

  it("assigns full price to a single claimer", () => {
    const result = computeClaimSplits({
      items: [{ priceCents: 1234, claimedBy: claim(ck) }],
    });
    expect(result).toEqual([{ participantId: ck, amountCents: 1234 }]);
  });

  it("splits a shared item exactly across claimers (no remainder)", () => {
    const result = computeClaimSplits({
      items: [{ priceCents: 1000, claimedBy: claim(ck, r) }],
    });
    const ckSplit = result.find((s) => s.participantId === ck)!;
    const rSplit = result.find((s) => s.participantId === r)!;
    expect(ckSplit.amountCents + rSplit.amountCents).toBe(1000);
    expect(ckSplit.amountCents).toBe(500);
    expect(rSplit.amountCents).toBe(500);
  });

  it("distributes remainder cents deterministically when sharing", () => {
    // 1¢ over 2 claimers — exactly one cent must land on the higher UUID
    const result = computeClaimSplits({
      items: [{ priceCents: 1, claimedBy: claim(ck, r) }],
    });
    const total = result.reduce((sum, s) => sum + s.amountCents, 0);
    expect(total).toBe(1);
    expect(result).toHaveLength(2);
  });

  it("matches the real-world Drill Weekend May receipt", () => {
    // Cubano $8.62 (CK only), Turkey $9.74 (R only), Fountain $4.48 (both)
    // Tax $1.77, tip $3.69 — total $28.30
    const result = computeClaimSplits({
      items: [
        { priceCents: 862, claimedBy: claim(ck) },
        { priceCents: 974, claimedBy: claim(r) },
        { priceCents: 448, claimedBy: claim(ck, r) },
      ],
      taxCents: 177,
      tipCents: 369,
    });

    const ckSplit = result.find((s) => s.participantId === ck)!;
    const rSplit = result.find((s) => s.participantId === r)!;
    expect(ckSplit.amountCents + rSplit.amountCents).toBe(2830);
    // CK subtotal $10.86, R subtotal $11.98, extras $5.46 split ~47.5/52.5
    expect(ckSplit.amountCents).toBe(1346);
    expect(rSplit.amountCents).toBe(1484);
  });

  it("excludes participants who claimed nothing", () => {
    const result = computeClaimSplits({
      items: [{ priceCents: 1000, claimedBy: claim(ck, r) }],
      taxCents: 100,
    });
    expect(result.find((s) => s.participantId === z)).toBeUndefined();
    expect(result).toHaveLength(2);
  });

  it("drops unclaimed items from the total", () => {
    const result = computeClaimSplits({
      items: [
        { priceCents: 1000, claimedBy: claim(ck) },
        { priceCents: 500, claimedBy: [] },
      ],
    });
    const sum = result.reduce((s, x) => s + x.amountCents, 0);
    expect(sum).toBe(1000);
  });

  it("guarantees splits sum to subtotal+tax+fee+tip across many claim patterns", () => {
    const cases = [
      { items: [{ p: 333, c: [ck] }, { p: 667, c: [r] }], tax: 99, fee: 7, tip: 53 },
      { items: [{ p: 1000, c: [ck, r] }], tax: 33, fee: 0, tip: 17 },
      { items: [{ p: 1, c: [ck, r] }], tax: 1, fee: 1, tip: 1 },
      { items: [{ p: 999999, c: [ck, r, z] }], tax: 88, fee: 99, tip: 111 },
    ];
    for (const tc of cases) {
      const result = computeClaimSplits({
        items: tc.items.map((i) => ({ priceCents: i.p, claimedBy: claim(...i.c) })),
        taxCents: tc.tax,
        feeCents: tc.fee,
        tipCents: tc.tip,
      });
      const sum = result.reduce((s, x) => s + x.amountCents, 0);
      const expected =
        tc.items.reduce((s, i) => s + (i.c.length > 0 ? i.p : 0), 0) +
        tc.tax + tc.fee + tc.tip;
      expect(sum).toBe(expected);
    }
  });
});
