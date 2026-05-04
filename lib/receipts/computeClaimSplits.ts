import { distributeEvenSplit } from "@/lib/money/cents";
import { allocateProportionally } from "@/lib/money/allocation";

export interface ClaimableItem {
  priceCents: number;
  claimedBy: { participantId: string }[];
}

export interface ClaimSplit {
  participantId: string;
  amountCents: number;
}

export interface ComputeClaimSplitsArgs {
  items: ClaimableItem[];
  taxCents?: number;
  feeCents?: number;
  tipCents?: number;
}

/**
 * Compute per-participant splits for a receipt-based expense, derived from
 * item claims plus proportional tax/fee/tip allocation.
 *
 * Each item's price is distributed across its claimers using the largest-
 * remainder method, so per-item totals match priceCents exactly. Tax, fees,
 * and tip are then distributed across participants proportionally to their
 * subtotal share, again using largest-remainder. The returned splits sum
 * exactly to (sum of claimed item prices) + taxCents + feeCents + tipCents.
 *
 * Items with no claimers are excluded — their cost is dropped from the total.
 * Callers should ensure either all items are claimed or that the dropped
 * subtotal is acceptable.
 */
export function computeClaimSplits({
  items,
  taxCents = 0,
  feeCents = 0,
  tipCents = 0,
}: ComputeClaimSplitsArgs): ClaimSplit[] {
  const subtotalByParticipant: Record<string, number> = {};

  for (const item of items) {
    if (item.claimedBy.length === 0) continue;
    const ids = item.claimedBy.map((c) => c.participantId);
    const perItemSplit = distributeEvenSplit(item.priceCents, ids);
    for (const { participantId, amountCents } of perItemSplit) {
      subtotalByParticipant[participantId] =
        (subtotalByParticipant[participantId] || 0) + amountCents;
    }
  }

  const participantIds = Object.keys(subtotalByParticipant);
  if (participantIds.length === 0) return [];

  const extras = taxCents + feeCents + tipCents;
  const subtotalItems = participantIds.map((id) => ({
    id,
    subtotalCents: subtotalByParticipant[id],
  }));
  const extrasAlloc =
    extras > 0 ? allocateProportionally(subtotalItems, extras) : {};

  return participantIds.map((id) => ({
    participantId: id,
    amountCents: subtotalByParticipant[id] + (extrasAlloc[id] || 0),
  }));
}
