"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/idkyp/types";
import { PhotoGallery } from "./PhotoGallery";

type Props = {
  finalists: Restaurant[];
  onPick: (winner: Restaurant) => void;
};

export function Final2Screen({ finalists, onPick }: Props) {
  const [galleryFor, setGalleryFor] = useState<Restaurant | null>(null);

  if (finalists.length < 2) {
    if (finalists.length === 1) onPick(finalists[0]);
    return null;
  }

  const [a, b] = finalists;
  const badges = computeBadges(a, b);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">final two</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
          You&apos;re going to one of these.
        </h2>
        <p className="mt-1 text-sm text-ink-500">Tap the winner.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FinalCard
          restaurant={a}
          badges={badges.a}
          onClick={() => onPick(a)}
          onShowPhotos={() => setGalleryFor(a)}
        />
        <FinalCard
          restaurant={b}
          badges={badges.b}
          onClick={() => onPick(b)}
          onShowPhotos={() => setGalleryFor(b)}
        />
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

function FinalCard({
  restaurant,
  badges,
  onClick,
  onShowPhotos,
}: {
  restaurant: Restaurant;
  badges: string[];
  onClick: () => void;
  onShowPhotos: () => void;
}) {
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
      aria-label={`Pick ${restaurant.name}`}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
    >
      <div
        className="aspect-[4/3] w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${restaurant.photo}')` }}
      />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-ink-500">{restaurant.cuisine}</p>
        <p className="text-lg font-semibold text-ink-900">{restaurant.name}</p>
        <p className="text-xs text-ink-500">
          ★ {restaurant.rating.toFixed(1)} · {"$".repeat(restaurant.price)} ·{" "}
          {restaurant.distance.toFixed(1)} mi
        </p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
              >
                {b}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {restaurant.photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowPhotos();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="inline-block rounded-full border border-sand-200 px-3 py-1 text-xs font-medium text-ink-700 transition hover:bg-sand-50"
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
              className="inline-block rounded-full border border-sand-200 px-3 py-1 text-xs font-medium text-ink-700 transition hover:bg-sand-50"
              aria-label={`Open ${restaurant.name} website`}
            >
              Visit website ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function computeBadges(a: Restaurant, b: Restaurant): { a: string[]; b: string[] } {
  const result = { a: [] as string[], b: [] as string[] };
  if (a.distance < b.distance) result.a.push("Closer");
  else if (b.distance < a.distance) result.b.push("Closer");

  if (a.price < b.price) result.a.push("Cheaper");
  else if (b.price < a.price) result.b.push("Cheaper");

  if (a.rating > b.rating) result.a.push("Higher rated");
  else if (b.rating > a.rating) result.b.push("Higher rated");

  if (a.reviews > b.reviews * 1.5) result.a.push("More popular");
  else if (b.reviews > a.reviews * 1.5) result.b.push("More popular");

  return result;
}
