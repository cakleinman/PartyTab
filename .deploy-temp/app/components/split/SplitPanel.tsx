"use client";

import { formatCents } from "@/lib/money/cents";

interface Participant {
  id: string;
  displayName: string;
}

interface SplitPanelProps {
  participants: Participant[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  totalCents: number;
  disabled?: boolean;
}

export function SplitPanel({
  participants,
  selectedIds,
  onSelectionChange,
  totalCents,
  disabled,
}: SplitPanelProps) {
  const selectAll = () => onSelectionChange(participants.map((p) => p.id));
  const clearAll = () => onSelectionChange([]);

  const perPersonCents =
    selectedIds.length > 0 ? Math.floor(totalCents / selectedIds.length) : 0;
  const remainder = selectedIds.length > 0 ? totalCents % selectedIds.length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Select who to split with</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-xs text-ink-500 hover:text-ink-700 disabled:opacity-50"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            className="text-xs text-ink-500 hover:text-ink-700 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {participants.map((participant) => {
          const selected = selectedIds.includes(participant.id);
          return (
            <label
              key={participant.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  onSelectionChange(
                    selected
                      ? selectedIds.filter((id) => id !== participant.id)
                      : [...selectedIds, participant.id]
                  )
                }
                disabled={disabled}
              />
              {participant.displayName}
            </label>
          );
        })}
      </div>

      {selectedIds.length > 0 && totalCents > 0 && (
        <p className="text-xs text-ink-500">
          {formatCents(perPersonCents)} each
          {remainder > 0 && " (remainder to last alphabetically)"}
        </p>
      )}

      {selectedIds.length === 0 && (
        <p className="text-xs text-ink-400">
          Select at least one person to split with
        </p>
      )}
    </div>
  );
}
