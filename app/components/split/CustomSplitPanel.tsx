"use client";

import { formatCents, formatCentsPlain, parseCents } from "@/lib/money/cents";

interface Participant {
  id: string;
  displayName: string;
}

interface CustomSplitPanelProps {
  participants: Participant[];
  splitAmounts: Record<string, string>;
  onSplitAmountsChange: (amounts: Record<string, string>) => void;
  totalCents: number;
  disabled?: boolean;
}

export function CustomSplitPanel({
  participants,
  splitAmounts,
  onSplitAmountsChange,
  totalCents,
  disabled,
}: CustomSplitPanelProps) {
  const splitSumCents = participants.reduce((sum, participant) => {
    try {
      return sum + parseCents(splitAmounts[participant.id] || "0", true);
    } catch {
      return sum;
    }
  }, 0);

  const remaining = totalCents - splitSumCents;

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-500">Enter custom amounts for each person</p>

      <div className="grid gap-3">
        {participants.map((participant) => (
          <label
            key={participant.id}
            className="grid gap-1 text-xs text-ink-500"
          >
            {participant.displayName}
            <input
              value={splitAmounts[participant.id] ?? ""}
              onChange={(e) =>
                onSplitAmountsChange({
                  ...splitAmounts,
                  [participant.id]: e.target.value,
                })
              }
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (!value) return;
                try {
                  const cents = parseCents(value, true);
                  onSplitAmountsChange({
                    ...splitAmounts,
                    [participant.id]: formatCentsPlain(cents),
                  });
                } catch {
                  // Invalid input, leave as-is
                }
              }}
              inputMode="decimal"
              disabled={disabled}
              className="rounded-xl border border-sand-200 px-3 py-2 text-sm text-ink-700"
              placeholder="0.00"
            />
          </label>
        ))}
      </div>

      <div className="space-y-1 text-xs text-ink-500">
        <p>Split total: {formatCents(splitSumCents)}</p>
        {totalCents > 0 && (
          <p className={remaining !== 0 ? "text-amber-600" : "text-green-600"}>
            {remaining === 0
              ? "✓ Amounts match"
              : remaining > 0
                ? `${formatCents(remaining)} remaining`
                : `${formatCents(Math.abs(remaining))} over`}
          </p>
        )}
      </div>
    </div>
  );
}
