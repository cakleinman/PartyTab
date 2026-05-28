"use client";

import type { Filters } from "@/lib/idkyp/types";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function WhenPicker({ filters, onChange }: Props) {
  return (
    <div className="space-y-3">
      <ChipRow>
        <Chip
          selected={filters.whenMode === "now"}
          onClick={() => onChange({ ...filters, whenMode: "now" })}
        >
          Now
        </Chip>
        <Chip
          selected={filters.whenMode === "custom"}
          onClick={() => onChange({ ...filters, whenMode: "custom" })}
        >
          Custom
        </Chip>
      </ChipRow>
      {filters.whenMode === "custom" && (
        <div className="space-y-3 rounded-2xl border border-sand-200 bg-sand-50 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Day</p>
            <ChipRow>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => (
                <Chip
                  key={offset}
                  selected={filters.day === String(offset)}
                  onClick={() => onChange({ ...filters, day: String(offset) })}
                >
                  {formatDayOffset(offset)}
                </Chip>
              ))}
            </ChipRow>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Time</p>
              <span className="text-sm font-medium text-ink-900">
                {formatHour(Number(filters.hour))}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              step={1}
              value={Number(filters.hour)}
              onChange={(e) => onChange({ ...filters, hour: e.target.value })}
              aria-label="Hour of day"
              aria-valuetext={formatHour(Number(filters.hour))}
              className="w-full accent-teal-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact label for the collapsed map chip: "Right now" / "Today, 7 PM" / "Sat Apr 4, 7 PM" */
export function formatWhenLabel(filters: Filters): string {
  if (filters.whenMode === "now") return "Right now";
  const dayOffset = Number(filters.day) || 0;
  const hour = Number(filters.hour);
  const hourLabel = formatHour(hour);
  if (dayOffset === 0) return `Today, ${hourLabel}`;
  if (dayOffset === 1) return `Tomorrow, ${hourLabel}`;
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return `${d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}, ${hourLabel}`;
}

function formatDayOffset(offset: number): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatHour(h: number): string {
  const safe = Number.isFinite(h) ? Math.max(0, Math.min(23, Math.round(h))) : 12;
  if (safe === 0) return "12 AM";
  if (safe === 12) return "12 PM";
  if (safe < 12) return `${safe} AM`;
  return `${safe - 12} PM`;
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        selected
          ? "border-teal-600 bg-teal-50 text-teal-700"
          : "border-sand-200 bg-white text-ink-900 hover:bg-sand-50"
      }`}
    >
      {children}
    </button>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
