"use client";

import { formatCents } from "@/lib/money/cents";

export interface ReceiptItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  claimedBy: { participantId: string; displayName: string }[];
}

interface Participant {
  id: string;
  displayName: string;
}

interface ClaimPanelProps {
  items: ReceiptItem[];
  participants: Participant[];
  currentParticipantId: string;
  onClaimToggle: (itemId: string, participantId: string) => void;
  disabled?: boolean;
}

export function ClaimPanel({
  items,
  participants,
  currentParticipantId,
  onClaimToggle,
  disabled,
}: ClaimPanelProps) {
  // Calculate each participant's total based on claims
  const calculateTotals = (): Record<string, number> => {
    const totals: Record<string, number> = {};
    items.forEach((item) => {
      if (item.claimedBy.length > 0) {
        const splitAmount = Math.floor(item.priceCents / item.claimedBy.length);
        item.claimedBy.forEach((claim) => {
          totals[claim.participantId] =
            (totals[claim.participantId] || 0) + splitAmount;
        });
      }
    });
    return totals;
  };

  const totals = calculateTotals();
  const unclaimedItems = items.filter((item) => item.claimedBy.length === 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-ink-500">
        <p>No receipt items to claim.</p>
        <p className="text-xs mt-1">Upload a receipt to extract items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Tap items you consumed. Shared items split among claimers.
      </p>

      <div className="space-y-2">
        {items.map((item) => {
          const isClaimed = item.claimedBy.some(
            (c) => c.participantId === currentParticipantId
          );
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                isClaimed
                  ? "border-ink-300 bg-ink-50"
                  : "border-sand-200 bg-white"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{formatCents(item.priceCents)}</span>
                  {item.quantity > 1 && <span>× {item.quantity}</span>}
                </div>
                {item.claimedBy.length > 0 && (
                  <p className="text-xs text-ink-400 mt-1 truncate">
                    {item.claimedBy.map((c) => c.displayName).join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onClaimToggle(item.id, currentParticipantId)}
                disabled={disabled}
                className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                  isClaimed
                    ? "bg-ink-900 text-white"
                    : "border border-ink-200 text-ink-500 hover:bg-sand-100"
                }`}
              >
                {isClaimed ? "Claimed" : "Claim"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Unclaimed warning */}
      {unclaimedItems.length > 0 && (
        <p className="text-xs text-amber-600">
          {unclaimedItems.length} item{unclaimedItems.length > 1 ? "s" : ""}{" "}
          unclaimed
        </p>
      )}

      {/* Split summary */}
      {Object.keys(totals).length > 0 && (
        <div className="rounded-xl bg-sand-100 p-3 space-y-1">
          <p className="text-xs font-medium text-ink-700">Split Summary</p>
          {participants
            .filter((p) => totals[p.id])
            .map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between text-xs text-ink-600"
              >
                <span>{participant.displayName}</span>
                <span>{formatCents(totals[participant.id])}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
