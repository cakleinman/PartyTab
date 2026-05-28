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

  // Snap-to-viewport: the elimination flow shouldn't scroll. The cards grid
  // takes the remaining height after the small top chrome, splitting into
  // three equal rows. Outer min-h keeps things readable on tall viewports;
  // on very short viewports (landscape phones, etc.) the page can still
  // scroll as a fallback rather than squeezing cards below legibility.
  return (
    <div
      className="animate-fade-in-up flex flex-col gap-3"
      style={{ height: "calc(100dvh - 180px)", minHeight: "560px" }}
    >
      <div className="flex shrink-0 items-center justify-between">
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

      <div className="h-1 w-full shrink-0 overflow-hidden rounded-full bg-sand-100">
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

      <h2 className="shrink-0 text-base font-medium text-ink-900">
        Which one are you <em className="font-semibold text-teal-700">least</em> in the mood
        for?
      </h2>

      <div className="grid min-h-0 flex-1 grid-rows-3 gap-3" aria-live="polite">
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
  // role="button" on a div (rather than <button>) so the inline Website link
  // and Photos button can be real interactive children without nested-
  // interactive HTML.
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
      className={`group relative block h-full min-h-0 w-full cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-ink-900 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
        eliminating ? "animate-idkyp-card-eliminate" : "animate-idkyp-card-enter"
      }`}
      style={{ animationDelay: eliminating ? "0ms" : `${staggerMs}ms`, opacity: 0 }}
    >
      {/* Full-bleed photo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url('${restaurant.photo}')` }}
        aria-hidden="true"
      />
      {/* Bottom-to-top gradient so the overlaid text stays legible regardless of photo */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
        aria-hidden="true"
      />

      {/* Cuisine pill — top-right corner */}
      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-900 shadow-sm backdrop-blur">
        {restaurant.cuisine}
      </span>

      {/* Open / Closed badge — top-left */}
      {restaurant.openNow === true && (
        <span className="absolute left-3 top-3 rounded-full bg-green-600/95 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur">
          Open now
        </span>
      )}
      {restaurant.openNow === false && (
        <span className="absolute left-3 top-3 rounded-full bg-ink-900/85 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur">
          Closed
        </span>
      )}

      {/* Content — overlaid at bottom over the gradient */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 text-white">
        <h3 className="text-2xl font-semibold leading-tight drop-shadow-sm">
          {restaurant.name}
        </h3>
        <p className="text-sm opacity-90 drop-shadow-sm">
          ★ {restaurant.rating.toFixed(1)}{" "}
          <span className="opacity-75">({restaurant.reviews})</span> ·{" "}
          {"$".repeat(restaurant.price)} · {restaurant.distance.toFixed(1)} mi ·{" "}
          {restaurant.drive} min
        </p>
        {(restaurant.photos.length > 1 || restaurant.websiteUrl) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {restaurant.photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowPhotos();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur transition hover:bg-white/25"
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
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur transition hover:bg-white/25"
                aria-label={`Open ${restaurant.name} website`}
              >
                Site ↗
              </a>
            )}
          </div>
        )}
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
