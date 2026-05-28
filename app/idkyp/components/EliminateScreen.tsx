"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/idkyp/types";
import { PhotoGallery } from "./PhotoGallery";

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
  const [galleryFor, setGalleryFor] = useState<Restaurant | null>(null);

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
    <div className="animate-fade-in-up space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Filters
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">
          eliminate · {eliminatedCount}/{Math.max(0, total - 2)}
        </p>
        <span className="w-12" />
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-100">
        <div
          className="h-full bg-teal-600 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Elimination progress"
        />
      </div>

      <h2 className="text-lg font-medium text-ink-900">
        Which one are you <em className="font-semibold text-teal-700">least</em> in the mood
        for?
      </h2>

      <div className="space-y-3" aria-live="polite">
        {trio.map((r, idx) => (
          <EliminateCard
            key={`${r.placeId}-${eliminatedCount}-${idx}`}
            restaurant={r}
            staggerMs={idx * 70}
            eliminating={eliminatingIdx === idx}
            onClick={() => handleClick(idx)}
            onShowPhotos={() => setGalleryFor(r)}
          />
        ))}
      </div>

      {galleryFor && (
        <PhotoGallery
          title={galleryFor.name}
          photos={galleryFor.photos.length > 0 ? galleryFor.photos : [galleryFor.photo]}
          onClose={() => setGalleryFor(null)}
        />
      )}
    </div>
  );
}

function EliminateCard({
  restaurant,
  staggerMs,
  eliminating,
  onClick,
  onShowPhotos,
}: {
  restaurant: Restaurant;
  staggerMs: number;
  eliminating: boolean;
  onClick: () => void;
  onShowPhotos: () => void;
}) {
  // We use role="button" on a div (rather than <button>) so the inline
  // Website link can be a real <a> without nested-interactive HTML.
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey}
      aria-label={`Eliminate ${restaurant.name}`}
      className={`group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
        eliminating ? "animate-idkyp-card-eliminate" : "animate-idkyp-card-enter"
      }`}
      style={{ animationDelay: eliminating ? "0ms" : `${staggerMs}ms`, opacity: 0 }}
    >
      <div className="flex h-32 items-stretch">
        <div
          className="relative w-2/5 bg-cover bg-center"
          style={{ backgroundImage: `url('${restaurant.photo}')` }}
        >
          <span className="absolute left-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-900 backdrop-blur">
            {restaurant.cuisine}
          </span>
          {restaurant.openNow === false && (
            <span className="absolute bottom-2 left-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
              Closed
            </span>
          )}
          {restaurant.openNow === true && (
            <span className="absolute bottom-2 left-2 rounded-full bg-green-600/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
              Open now
            </span>
          )}
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-ink-500">
              {"$".repeat(restaurant.price)} · {restaurant.distance.toFixed(1)} mi ·{" "}
              {restaurant.drive} min
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {restaurant.photos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowPhotos();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="rounded-full border border-sand-200 px-2 py-0.5 text-[11px] font-medium text-ink-500 transition hover:bg-sand-50"
                  aria-label={`View ${restaurant.photos.length} photos of ${restaurant.name}`}
                >
                  {restaurant.photos.length} photos
                </button>
              )}
              {restaurant.websiteUrl && (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="rounded-full border border-sand-200 px-2 py-0.5 text-[11px] font-medium text-ink-500 transition hover:bg-sand-50"
                  aria-label={`Open ${restaurant.name} website`}
                >
                  Site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {eliminating && (
        <span
          className="pointer-events-none absolute inset-0 animate-idkyp-flash bg-teal-500"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
