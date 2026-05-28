"use client";

import { useState } from "react";
import type { Filters, Restaurant } from "@/lib/idkyp/types";
import { PhotoGallery } from "./PhotoGallery";

type Props = {
  winner: Restaurant;
  filters: Filters;
  onTryAgain: () => void;
};

export function WinnerScreen({ winner, filters, onTryAgain }: Props) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const hasGallery = winner.photos.length > 1;
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
  const calendarUrl = buildCalendarUrl(winner, filters);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">winner</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
          You&apos;re going to:
        </h2>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-sand-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => hasGallery && setGalleryOpen(true)}
          disabled={!hasGallery}
          aria-label={hasGallery ? `View ${winner.photos.length} photos` : undefined}
          className={`relative block aspect-[16/10] w-full bg-cover bg-center ${
            hasGallery ? "cursor-zoom-in" : "cursor-default"
          }`}
          style={{ backgroundImage: `url('${winner.photo}')` }}
        >
          {hasGallery && (
            <span className="absolute bottom-3 right-3 rounded-full bg-ink-900/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {winner.photos.length} photos
            </span>
          )}
        </button>
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
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-sand-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-ink-900 transition hover:bg-sand-50 sm:col-span-2"
            >
              Add to calendar
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

      {galleryOpen && (
        <PhotoGallery
          title={winner.name}
          photos={winner.photos}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Build a Google Calendar event URL. Universal — works in any browser,
 * prompts the user to add the event to their primary calendar.
 * Start time defaults to next-hour-rounded for "now" mode, or the
 * day-offset + hour selected in the When picker for "custom" mode.
 * Duration is fixed at 90 min.
 */
function buildCalendarUrl(winner: Restaurant, filters: Filters): string {
  const start = new Date();
  if (filters.whenMode === "custom") {
    const dayOffset = Math.max(0, Math.min(30, Number(filters.day) || 0));
    const hour = Math.max(0, Math.min(23, Number(filters.hour) || start.getHours()));
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
  } else {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  }
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Dinner at ${winner.name}`,
    details: "Decided via IDKYP — partytab.app",
    location: winner.address,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
