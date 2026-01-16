"use client";

export type SplitMode = "split" | "claim" | "custom";

interface SplitModeSelectorProps {
  mode: SplitMode;
  onChange: (mode: SplitMode) => void;
  hasReceiptItems: boolean;
  hasProFeatures: boolean;
  onProPreview?: () => void;
  disabled?: boolean;
}

export function SplitModeSelector({
  mode,
  onChange,
  hasProFeatures,
  onProPreview,
  disabled,
}: SplitModeSelectorProps) {
  const handleClaimClick = () => {
    if (!hasProFeatures) {
      onProPreview?.();
      return;
    }
    onChange("claim");
  };

  const claimDisabled = disabled;
  const claimTitle = !hasProFeatures
    ? "Pro feature - click to learn more"
    : undefined;

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
        onClick={handleClaimClick}
        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition relative ${
          mode === "claim"
            ? "bg-ink-900 text-white"
            : "text-ink-500 hover:bg-sand-100"
        } ${claimDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
        disabled={claimDisabled}
        title={claimTitle}
      >
        Claim
        {!hasProFeatures && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
            </svg>
          </span>
        )}
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
