"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Filters, Restaurant } from "@/lib/idkyp/types";
import type { Quota } from "../IdkypClient";

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
  const allCuisines = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRestaurants) set.add(r.cuisine);
    return Array.from(set).sort();
  }, [allRestaurants]);

  const tooFew = matchCount < 6;
  const quotaExhausted =
    quota !== null && !quota.unlimited && (quota.remaining ?? 0) <= 0;
  const canStart = matchCount >= 3 && !quotaExhausted;

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
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

      <div className="rounded-2xl border border-sand-200 bg-white p-6 text-center">
        <p
          className={`text-5xl font-semibold tracking-tight ${
            tooFew ? "text-orange-600" : "text-ink-900"
          }`}
        >
          {matchCount}
        </p>
        <p className="mt-1 text-sm text-ink-500">
          {matchCount === 1 ? "place" : "places"} match your filters
        </p>
      </div>

      {quota && !quota.unlimited && (
        <QuotaBanner quota={quota} />
      )}

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
          {allCuisines.map((c) => {
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
            Start eliminating →
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
