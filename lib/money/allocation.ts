/**
 * Proportional Allocation Algorithm
 *
 * Distributes a total amount (tax, tip, fees) across items based on their subtotal share.
 * Uses the Largest Remainder Method (Hamilton method) to ensure exact cent distribution.
 */

export interface ItemSubtotal {
  id: string;
  subtotalCents: number;
}

export interface ItemAllocation {
  itemId: string;
  taxCents: number;
  tipCents: number;
  feesCents: number;
  totalCents: number;
}

/**
 * Distributes a total amount of cents across items proportionally to their subtotals.
 *
 * @param items Items with their individual subtotals
 * @param totalToDistribute Total cents (tax, tip, or fee) to be shared
 * @returns A map of itemId to allocated cents
 */
export function allocateProportionally(
  items: ItemSubtotal[],
  totalToDistribute: number
): Record<string, number> {
  if (items.length === 0 || totalToDistribute === 0) {
    return items.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {});
  }

  const sumSubtotals = items.reduce((sum, item) => sum + item.subtotalCents, 0);

  if (sumSubtotals === 0) {
    // If all items are 0, split evenly
    const base = Math.floor(totalToDistribute / items.length);
    const remainder = totalToDistribute % items.length;
    return items.reduce((acc, item, index) => {
      acc[item.id] = base + (index < remainder ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
  }

  // 1. Calculate theoretical shares and floor them
  const allocations = items.map((item) => {
    const theoretical = (item.subtotalCents * totalToDistribute) / sumSubtotals;
    return {
      id: item.id,
      floor: Math.floor(theoretical),
      remainder: theoretical - Math.floor(theoretical),
    };
  });

  const distributedSoFar = allocations.reduce((sum, a) => sum + a.floor, 0);
  const centsRemaining = totalToDistribute - distributedSoFar;

  // 2. Distribute remaining cents to items with the largest remainders
  // Sort by remainder descending, then by ID for deterministic behavior on ties
  const sortedByRemainder = [...allocations].sort((a, b) => {
    if (b.remainder !== a.remainder) {
      return b.remainder - a.remainder;
    }
    return a.id.localeCompare(b.id);
  });

  const finalAllocations: Record<string, number> = {};
  allocations.forEach((a) => {
    finalAllocations[a.id] = a.floor;
  });

  for (let i = 0; i < centsRemaining; i++) {
    const item = sortedByRemainder[i];
    finalAllocations[item.id]++;
  }

  return finalAllocations;
}

/**
 * Distributes tax and tip across custom per-person splits.
 *
 * Each person's share of tax and tip is proportional to their base amount.
 * Uses allocateProportionally (Hamilton method) for exact cent distribution.
 *
 * @param splits Array of { participantId, baseCents } — the base custom amounts
 * @param taxCents Total tax to distribute
 * @param tipCents Total tip to distribute
 * @returns Array of { participantId, amountCents } — base + proportional tax + tip
 */
export function distributeCustomExtras(
  splits: { participantId: string; baseCents: number }[],
  taxCents: number,
  tipCents: number,
): { participantId: string; amountCents: number }[] {
  if (splits.length === 0) return [];

  const items: ItemSubtotal[] = splits.map((s) => ({
    id: s.participantId,
    subtotalCents: s.baseCents,
  }));

  const taxAlloc = taxCents > 0 ? allocateProportionally(items, taxCents) : {};
  const tipAlloc = tipCents > 0 ? allocateProportionally(items, tipCents) : {};

  return splits.map((s) => ({
    participantId: s.participantId,
    amountCents: s.baseCents + (taxAlloc[s.participantId] || 0) + (tipAlloc[s.participantId] || 0),
  }));
}

/**
 * Full allocation for a receipt, distributing tax, tip, and fees.
 */
export function allocateReceiptProportionally(
  items: ItemSubtotal[],
  taxTotalCents: number,
  tipTotalCents: number,
  feesTotalCents: number
): ItemAllocation[] {
  const taxAllocations = allocateProportionally(items, taxTotalCents);
  const tipAllocations = allocateProportionally(items, tipTotalCents);
  const feesAllocations = allocateProportionally(items, feesTotalCents);

  return items.map((item) => {
    const tax = taxAllocations[item.id] || 0;
    const tip = tipAllocations[item.id] || 0;
    const fees = feesAllocations[item.id] || 0;

    return {
      itemId: item.id,
      taxCents: tax,
      tipCents: tip,
      feesCents: fees,
      totalCents: item.subtotalCents + tax + tip + fees,
    };
  });
}
