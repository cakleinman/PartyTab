"use client";

export type SplitMode = "split" | "claim" | "custom";

interface SplitModeSelectorProps {
  mode: SplitMode;
  onChange: (mode: SplitMode) => void;
  hasReceiptItems: boolean;
  disabled?: boolean;
}

export function SplitModeSelector({
  mode,
  onChange,
  hasReceiptItems,
  disabled,
}: SplitModeSelectorProps) {
  return (
    <div className="flex rounded-xl border border-sand-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("split")}
        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          mode === "split"
            ? "bg-ink-900 text-white"
            : "text-ink-500 hover:bg-sand-100"
        }`}
        disabled={disabled}
      >
        Even
      </button>
      <button
        type="button"
        onClick={() => onChange("claim")}
        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          mode === "claim"
            ? "bg-ink-900 text-white"
            : "text-ink-500 hover:bg-sand-100"
        } ${!hasReceiptItems ? "opacity-40 cursor-not-allowed" : ""}`}
        disabled={disabled || !hasReceiptItems}
        title={!hasReceiptItems ? "Upload a receipt to claim items" : undefined}
      >
        Claim
      </button>
      <button
        type="button"
        onClick={() => onChange("custom")}
        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          mode === "custom"
            ? "bg-ink-900 text-white"
            : "text-ink-500 hover:bg-sand-100"
        }`}
        disabled={disabled}
      >
        Custom
      </button>
    </div>
  );
}
