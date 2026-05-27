"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLng, Restaurant } from "@/lib/idkyp/types";
import { distanceMiles } from "@/lib/idkyp/geo";

const LeafletMap = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-sand-200 bg-sand-50 text-ink-500">
      Loading map…
    </div>
  ),
});

type Props = {
  userPin: LatLng;
  restaurants: Restaurant[];
  radius: number;
  onPinChange: (pin: LatLng) => void;
  onRadiusChange: (radius: number) => void;
  onContinue: () => void;
};

export function MapScreen({
  userPin,
  restaurants,
  radius,
  onPinChange,
  onRadiusChange,
  onContinue,
}: Props) {
  const inRangeCount = useMemo(
    () => restaurants.filter((r) => distanceMiles(userPin, { lat: r.lat, lng: r.lng }) <= radius)
      .length,
    [restaurants, userPin, radius],
  );

  const tooFew = inRangeCount < 6;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">map</p>
        <p
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tooFew ? "bg-orange-100 text-orange-700" : "bg-teal-50 text-teal-700"
          }`}
        >
          {inRangeCount} {inRangeCount === 1 ? "place" : "places"} in range
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200">
        <LeafletMap
          userPin={userPin}
          restaurants={restaurants}
          radius={radius}
          onPinChange={onPinChange}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink-500">Radius</label>
          <span className="text-sm font-medium text-ink-900">
            {radius.toFixed(1)} mi
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={20}
          step={0.5}
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full accent-teal-600"
        />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-700"
      >
        Continue →
      </button>
    </div>
  );
}
