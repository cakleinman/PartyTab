"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Filters, Restaurant } from "@/lib/idkyp/types";
import { defaultFilters } from "@/lib/idkyp/types";
import { applyMapFilters } from "@/lib/idkyp/filters";
import type { Quota } from "../IdkypClient";
import { WhenPicker } from "./WhenPicker";

const DIETARY = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "glutenFree", label: "Gluten-free" },
  { key: "halal", label: "Halal" },
  { key: "kosher", label: "Kosher" },
];

const PRICES = [1, 2, 3, 4];

function priceLabel(level: number) {
  return "$".repeat(level);
}

type Props = {
  filters: Filters;
  allRestaurants: Restaurant[];
  matchCount: number;
  quota: Quota | null;
  onChange: (filters: Filters) => void;
  onBack: () => void;
  onStart: () => void;
};

export function FiltersScreen({
  filters,
  allRestaurants,
  matchCount,
  quota,
  onChange,
  onBack,
  onStart,
}: Props) {
  // Cuisine chips reflect what's reachable AND open at the picked time —
  // anything currently filtered out by the map-level gates (radius + when)
  // shouldn't pollute the chip list. Already-excluded cuisines stay visible
  // so the user can un-exclude them without the chip vanishing.
  const availableCuisines = useMemo(() => {
    const reachableOpen = applyMapFilters(allRestaurants, filters);
    const set = new Set<string>();
    for (const r of reachableOpen) set.add(r.cuisine);
    for (const c of filters.excludeCuisines) set.add(c);
    return Array.from(set).sort();
  }, [allRestaurants, filters]);

  const warn = matchCount < 6 || matchCount > 20;
  const hint = countHint(matchCount);
  const quotaExhausted =
    quota !== null && !quota.unlimited && (quota.remaining ?? 0) <= 0;
  const canStart = matchCount >= 3 && !quotaExhausted;

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    // No animate-fade-in-up wrapper here: that animation ends on
    // transform: translateY(0) (fill-mode forwards), and a lingering transform
    // on an ancestor breaks position: sticky for the count header below.
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Map
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">filters</p>
        <span className="w-12" />
      </div>

      {/* Compact count pinned to the top of the viewport so the live match
          total stays visible while the user scrolls the filter sections —
          no more scrolling back up to check it. */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-sand-200 bg-sand-50/95 px-6 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-center">
          <span
            className={`text-2xl font-semibold leading-none ${
              warn ? "text-orange-600" : "text-ink-900"
            }`}
          >
            {matchCount}
          </span>
          <span className="text-sm text-ink-500">
            {matchCount === 1 ? "place" : "places"} match your filters
          </span>
          {hint && (
            <span className={`text-xs ${warn ? "text-orange-600" : "text-ink-400"}`}>
              · {hint}
            </span>
          )}
          {matchCount < 3 && (
            <button
              type="button"
              onClick={() => onChange(defaultFilters())}
              className="text-xs font-medium text-teal-700 underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {quota && !quota.unlimited && (
        <QuotaBanner quota={quota} />
      )}

      <Section title="When?">
        <WhenPicker filters={filters} onChange={onChange} />
      </Section>

      <Section title="Dietary">
        <ChipRow>
          {DIETARY.map((d) => (
            <Chip
              key={d.key}
              selected={filters.dietary.includes(d.key)}
              onClick={() =>
                onChange({ ...filters, dietary: toggle(filters.dietary, d.key) })
              }
            >
              {d.label}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Price">
        <ChipRow>
          {PRICES.map((p) => (
            <Chip
              key={p}
              selected={filters.priceLevels.includes(p)}
              onClick={() =>
                onChange({
                  ...filters,
                  priceLevels: toggle(filters.priceLevels, p),
                })
              }
            >
              {priceLabel(p)}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Not right now">
        <ChipRow>
          {availableCuisines.map((c) => {
            const excluded = filters.excludeCuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    excludeCuisines: toggle(filters.excludeCuisines, c),
                  })
                }
                aria-pressed={excluded}
                aria-label={excluded ? `Re-include ${c}` : `Exclude ${c}`}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  excluded
                    ? "border-sand-200 bg-sand-100 text-ink-400 line-through"
                    : "border-sand-200 bg-white text-ink-900 hover:bg-sand-50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </ChipRow>
      </Section>

      <Section title={`Minimum rating · ${filters.minRating.toFixed(1)}★`}>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={filters.minRating}
          onChange={(e) =>
            onChange({ ...filters, minRating: Number(e.target.value) })
          }
          aria-label="Minimum rating"
          aria-valuetext={`${filters.minRating.toFixed(1)} stars`}
          className="w-full accent-teal-600"
        />
      </Section>

      <div className="flex items-center gap-3 pt-2">
        {quotaExhausted ? (
          <Link
            href="/upgrade"
            className="flex-1 rounded-full bg-teal-600 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-teal-700"
          >
            Upgrade to Pro for unlimited →
          </Link>
        ) : (
          <button
            type="button"
            disabled={!canStart}
            onClick={onStart}
            className={`flex-1 rounded-full px-5 py-3 text-sm font-medium transition ${
              canStart
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "cursor-not-allowed bg-sand-100 text-ink-400"
            }`}
          >
            {canStart
              ? "Start eliminating →"
              : matchCount === 0
                ? "No matches"
                : `Need 3, have ${matchCount}`}
          </button>
        )}
      </div>
    </div>
  );
}

function QuotaBanner({ quota }: { quota: Quota }) {
  const remaining = quota.remaining ?? 0;
  const limit = quota.limit ?? 0;
  const exhausted = remaining <= 0;
  return (
    <div
      className={`rounded-2xl border p-3 text-sm ${
        exhausted
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-sand-200 bg-sand-50 text-ink-500"
      }`}
    >
      {exhausted ? (
        <>
          You&apos;ve used all {limit} free decisions this month.{" "}
          <Link href="/upgrade" className="font-medium underline">
            Upgrade to Pro
          </Link>{" "}
          for unlimited.
        </>
      ) : (
        <>
          {remaining} of {limit} free decisions left this month.{" "}
          <Link href="/upgrade" className="font-medium text-teal-700 underline">
            Go Pro
          </Link>{" "}
          for unlimited.
        </>
      )}
    </div>
  );
}

function countHint(count: number): string {
  if (count === 0) return "no matches — loosen a filter";
  if (count < 3) return `need at least 3 (have ${count})`;
  if (count < 6) return "try loosening";
  if (count > 20) return "this could take a while";
  return "";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-ink-500">{title}</h2>
      {children}
    </section>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
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
