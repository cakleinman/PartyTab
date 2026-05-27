"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/idkyp/types";

type Props = {
  trio: Restaurant[];
  eliminatedCount: number;
  poolSize: number;
  onEliminate: (idx: number) => void;
  onRestart: () => void;
};

export function EliminateScreen({
  trio,
  eliminatedCount,
  poolSize,
  onEliminate,
  onRestart,
}: Props) {
  const [eliminatingIdx, setEliminatingIdx] = useState<number | null>(null);

  const total = trio.length + eliminatedCount + poolSize;
  const progress = total > 0 ? Math.min(100, ((eliminatedCount / total) * 100) | 0) : 0;

  const handleClick = (idx: number) => {
    if (eliminatingIdx !== null) return;
    setEliminatingIdx(idx);
    window.setTimeout(() => {
      onEliminate(idx);
      setEliminatingIdx(null);
    }, 380);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Filters
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">
          eliminate · {eliminatedCount}/{total - 2}
        </p>
        <span className="w-12" />
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-100">
        <div
          className="h-full bg-teal-600 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="text-lg font-medium text-ink-900">
        Which one are you <em className="font-semibold text-teal-700">least</em> in the mood
        for?
      </h2>

      <div className="space-y-3">
        {trio.map((r, idx) => (
          <EliminateCard
            key={`${r.placeId}-${idx}`}
            restaurant={r}
            eliminating={eliminatingIdx === idx}
            onClick={() => handleClick(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function EliminateCard({
  restaurant,
  eliminating,
  onClick,
}: {
  restaurant: Restaurant;
  eliminating: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition ${
        eliminating
          ? "translate-x-12 rotate-1 scale-95 opacity-0"
          : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
      style={{ transitionDuration: eliminating ? "380ms" : "200ms" }}
    >
      <div className="flex h-32 items-stretch">
        <div
          className="relative w-2/5 bg-cover bg-center"
          style={{ backgroundImage: `url('${restaurant.photo}')` }}
        >
          <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-900 backdrop-blur">
            {restaurant.cuisine}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <p className="text-base font-semibold leading-tight text-ink-900">
              {restaurant.name}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              ★ {restaurant.rating.toFixed(1)} · {restaurant.reviews} reviews
            </p>
          </div>
          <p className="text-xs text-ink-500">
            {"$".repeat(restaurant.price)} · {restaurant.distance.toFixed(1)} mi ·{" "}
            {restaurant.drive} min
          </p>
        </div>
      </div>
    </button>
  );
}
