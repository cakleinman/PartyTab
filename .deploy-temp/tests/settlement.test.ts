import { describe, expect, it } from "vitest";
import { distributeEvenSplit } from "@/lib/money/cents";
import { computeSettlement } from "@/lib/settlement/computeSettlement";

const ids = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
};

describe("settlement engine", () => {
  it("handles multi-creditor and multi-debtor", () => {
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 500 },
      { participantId: ids.b, netCents: 300 },
      { participantId: ids.c, netCents: -400 },
      { participantId: ids.d, netCents: -400 },
    ]);

    expect(transfers).toEqual([
      { fromParticipantId: ids.c, toParticipantId: ids.a, amountCents: 400 },
      { fromParticipantId: ids.d, toParticipantId: ids.a, amountCents: 100 },
      { fromParticipantId: ids.d, toParticipantId: ids.b, amountCents: 300 },
    ]);
  });

  it("skips zero nets and is deterministic", () => {
    const transfers = computeSettlement([
      { participantId: ids.c, netCents: -200 },
      { participantId: ids.b, netCents: 0 },
      { participantId: ids.a, netCents: 200 },
    ]);

    expect(transfers).toEqual([
      { fromParticipantId: ids.c, toParticipantId: ids.a, amountCents: 200 },
    ]);
  });

  it("throws if nets do not balance", () => {
    expect(() => {
      computeSettlement([
        { participantId: ids.a, netCents: 100 },
        { participantId: ids.b, netCents: -90 },
      ]);
    }).toThrow();
  });

  it("even split remainder is deterministic by participant id", () => {
    const splits = distributeEvenSplit(1001, [ids.b, ids.a, ids.c]);
    expect(splits).toEqual([
      { participantId: ids.a, amountCents: 333 },
      { participantId: ids.b, amountCents: 334 },
      { participantId: ids.c, amountCents: 334 },
    ]);
  });

  it("sum of nets must equal zero", () => {
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 250 },
      { participantId: ids.b, netCents: -150 },
      { participantId: ids.c, netCents: -100 },
    ]);
    expect(transfers.reduce((sum, t) => sum + t.amountCents, 0)).toBe(250);
  });

  it("two-person simple case", () => {
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 1200 },
      { participantId: ids.b, netCents: -1200 },
    ]);
    expect(transfers).toEqual([
      { fromParticipantId: ids.b, toParticipantId: ids.a, amountCents: 1200 },
    ]);
  });

  it("three-person deterministic ordering", () => {
    // Debtors sorted by amount (most negative first): c (-300), then b (-200)
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 500 },
      { participantId: ids.b, netCents: -200 },
      { participantId: ids.c, netCents: -300 },
    ]);
    expect(transfers).toEqual([
      { fromParticipantId: ids.c, toParticipantId: ids.a, amountCents: 300 },
      { fromParticipantId: ids.b, toParticipantId: ids.a, amountCents: 200 },
    ]);
  });

  it("circular cancellation yields no transfers", () => {
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 0 },
      { participantId: ids.b, netCents: 0 },
      { participantId: ids.c, netCents: 0 },
    ]);
    expect(transfers).toEqual([]);
  });

  it("edge cent case stays in integers", () => {
    const transfers = computeSettlement([
      { participantId: ids.a, netCents: 1 },
      { participantId: ids.b, netCents: -1 },
    ]);
    expect(transfers).toEqual([
      { fromParticipantId: ids.b, toParticipantId: ids.a, amountCents: 1 },
    ]);
  });

  it("randomized invariants: no negatives, no self transfers, nets settle", () => {
    const participants = ["a", "b", "c", "d", "e"];
    for (let i = 0; i < 20; i += 1) {
      const raw = participants.map((id) => ({
        participantId: id,
        netCents: Math.floor(Math.random() * 2000) - 1000,
      }));
      const sum = raw.reduce((total, entry) => total + entry.netCents, 0);
      raw[0].netCents -= sum;
      const transfers = computeSettlement(raw.map((entry) => ({ ...entry })));
      transfers.forEach((transfer) => {
        expect(transfer.amountCents).toBeGreaterThan(0);
        expect(transfer.fromParticipantId).not.toBe(transfer.toParticipantId);
      });
      const netMap = new Map(raw.map((entry) => [entry.participantId, entry.netCents]));
      transfers.forEach((transfer) => {
        netMap.set(transfer.fromParticipantId, (netMap.get(transfer.fromParticipantId) ?? 0) + transfer.amountCents);
        netMap.set(transfer.toParticipantId, (netMap.get(transfer.toParticipantId) ?? 0) - transfer.amountCents);
      });
      netMap.forEach((value) => {
        expect(value).toBe(0);
      });
    }
  });
});
