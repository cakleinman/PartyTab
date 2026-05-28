import type { Filters } from "./types";

export type MealCopy = {
  /** Lead-in line above the winner name, e.g. "Tonight at 7 PM, you're going to" */
  winnerEyebrow: string;
  /** Calendar event prefix, e.g. "Dinner" / "Lunch" / "Night out" */
  calendarLabel: string;
};

/**
 * Time-of-day-aware copy for the winner screen + calendar event.
 * "Now" mode uses the current hour; "custom" mode uses the picked day/hour.
 */
export function getMealCopy(filters: Filters, now: Date = new Date()): MealCopy {
  const isNow = filters.whenMode === "now";
  const dayOffset = Number(filters.day) || 0;
  const hour = isNow
    ? now.getHours()
    : Number.isFinite(Number(filters.hour))
      ? Number(filters.hour)
      : now.getHours();

  const hourLabel = formatHour(hour);

  let winnerEyebrow: string;
  if (isNow) {
    winnerEyebrow = "Right now you're going to";
  } else if (dayOffset === 0) {
    winnerEyebrow =
      hour >= 17 || hour < 5
        ? `Tonight at ${hourLabel}, you're going to`
        : `Today at ${hourLabel}, you're going to`;
  } else if (dayOffset === 1) {
    winnerEyebrow = `Tomorrow at ${hourLabel}, you're going to`;
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: "long" });
    winnerEyebrow = `${dayLabel} at ${hourLabel}, you're going to`;
  }

  let calendarLabel: string;
  if (hour >= 6 && hour < 11) calendarLabel = "Breakfast";
  else if (hour >= 11 && hour < 15) calendarLabel = "Lunch";
  else if (hour >= 15 && hour < 17) calendarLabel = "Outing";
  else if (hour >= 17 && hour < 22) calendarLabel = "Dinner";
  else calendarLabel = "Night out";

  return { winnerEyebrow, calendarLabel };
}

function formatHour(h: number): string {
  const safe = Number.isFinite(h) ? Math.max(0, Math.min(23, Math.round(h))) : 12;
  if (safe === 0) return "12 AM";
  if (safe === 12) return "12 PM";
  if (safe < 12) return `${safe} AM`;
  return `${safe - 12} PM`;
}
