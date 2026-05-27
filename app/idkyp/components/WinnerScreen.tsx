"use client";

import { useState } from "react";
import type { Restaurant } from "@/lib/idkyp/types";

type Props = {
  winner: Restaurant;
  onTryAgain: () => void;
};

export function WinnerScreen({ winner, onTryAgain }: Props) {
  const [hoursOpen, setHoursOpen] = useState(false);
  // Google Maps Universal URL — opens directly in the route-planning view
  // with destination pre-filled. Origin defaults to the user's current
  // location. Falls back to the Maps web app on desktop and the native
  // Maps app on mobile (Google Maps on Android, system handler on iOS).
  // Passing both destination text and place_id makes the match unambiguous.
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${winner.name} ${winner.address}`,
  )}&destination_place_id=${encodeURIComponent(winner.placeId)}&travelmode=driving`;
  const websiteUrl =
    winner.websiteUrl ??
    `https://www.google.com/search?q=${encodeURIComponent(`${winner.name} ${winner.address}`)}`;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">winner</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
          You&apos;re going to:
        </h2>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white shadow-sm">
        <div
          className="aspect-[16/10] w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${winner.photo}')` }}
        />
        <div className="space-y-3 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-500">{winner.cuisine}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">{winner.name}</h1>
          <p className="text-sm text-ink-500">{winner.address}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span>
              ★ {winner.rating.toFixed(1)}{" "}
              <span className="text-ink-400">({winner.reviews})</span>
            </span>
            <span>{"$".repeat(winner.price)}</span>
            <span>
              {winner.distance.toFixed(1)} mi · {winner.drive} min
            </span>
            {winner.openNow === true && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Open now
              </span>
            )}
            {winner.openNow === false && (
              <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-ink-500">
                Closed
              </span>
            )}
          </div>

          {winner.hours && winner.hours.length > 0 && (
            <details
              open={hoursOpen}
              onToggle={(e) => setHoursOpen((e.target as HTMLDetailsElement).open)}
              className="rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-sm"
            >
              <summary className="cursor-pointer font-medium text-ink-900">
                Hours
              </summary>
              <ul className="mt-2 space-y-0.5 text-xs text-ink-500">
                {winner.hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Route me there →
            </a>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-sand-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-ink-900 transition hover:bg-sand-50"
            >
              Website
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onTryAgain}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          Try again ↺
        </button>
      </div>
    </div>
  );
}
