"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { LatLng, Restaurant } from "@/lib/idkyp/types";
import { distanceMiles } from "@/lib/idkyp/geo";

const LeafletMap = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[55vh] items-center justify-center bg-sand-50 text-ink-500">
      Loading map…
    </div>
  ),
});

type Props = {
  userPin: LatLng;
  restaurants: Restaurant[];
  radius: number;
  mode: "live" | "demo" | null;
  loading: boolean;
  errorMessage: string | null;
  onPinChange: (pin: LatLng) => void;
  onRadiusChange: (radius: number) => void;
  onSearchHere: () => void;
  onContinue: () => void;
};

export function MapScreen({
  userPin,
  restaurants,
  radius,
  mode,
  loading,
  errorMessage,
  onPinChange,
  onRadiusChange,
  onSearchHere,
  onContinue,
}: Props) {
  const [geoState, setGeoState] = useState<"idle" | "locating" | "denied" | "unavailable">("idle");

  const inRangeCount = useMemo(
    () =>
      restaurants.filter((r) => distanceMiles(userPin, { lat: r.lat, lng: r.lng }) <= radius).length,
    [restaurants, userPin, radius],
  );

  const tooFew = inRangeCount < 3 && !loading;
  const canContinue = inRangeCount >= 3;

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unavailable");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState("idle");
        onPinChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // User taps "Search this area" next — avoids stale-closure race
      },
      (err) => {
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-400">map</p>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoState === "locating"}
            className="rounded-full border border-sand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-500 transition hover:bg-sand-50 disabled:opacity-50"
            aria-label="Use my current location"
          >
            {geoState === "locating" ? "Locating…" : "📍 Use my location"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {mode === "demo" && (
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
              Demo data
            </span>
          )}
          <p
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tooFew ? "bg-orange-50 text-orange-700" : "bg-teal-50 text-teal-700"
            }`}
          >
            {loading ? "Searching…" : `${inRangeCount} ${inRangeCount === 1 ? "place" : "places"} in range`}
          </p>
        </div>
      </div>

      {geoState === "denied" && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          Location access denied — drag the pin manually instead.
        </div>
      )}
      {geoState === "unavailable" && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          Location unavailable — drag the pin manually instead.
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          Restaurant search failed: {errorMessage}.{" "}
          <button type="button" onClick={onSearchHere} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !errorMessage && restaurants.length === 0 && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          No restaurants found here. Try moving the pin or widening the radius, then{" "}
          <button type="button" onClick={onSearchHere} className="font-medium text-teal-700 underline">
            Search this area
          </button>
          .
        </div>
      )}

      {!loading && !errorMessage && restaurants.length > 0 && tooFew && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          Only {inRangeCount} {inRangeCount === 1 ? "place" : "places"} in this radius —
          IDKYP needs at least 3 to start eliminating. Widen the radius or move the pin.
        </div>
      )}

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
          <span className="text-sm font-medium text-ink-900">{radius.toFixed(1)} mi</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={20}
          step={0.5}
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          aria-label="Search radius"
          aria-valuetext={`${radius.toFixed(1)} miles`}
          className="w-full accent-teal-600"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={onSearchHere}
          disabled={loading}
          className="rounded-full border border-sand-200 bg-white px-5 py-3 text-sm font-medium text-ink-900 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search this area"}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={`rounded-full px-5 py-3 text-sm font-medium transition ${
            canContinue
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "cursor-not-allowed bg-sand-100 text-ink-400"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
