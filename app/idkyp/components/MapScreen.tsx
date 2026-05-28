"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLng, Restaurant } from "@/lib/idkyp/types";
import { distanceMiles } from "@/lib/idkyp/geo";
import type { GeoStatus } from "../IdkypClient";

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
  geoStatus: GeoStatus;
  onPinChange: (pin: LatLng) => void;
  onRadiusChange: (radius: number) => void;
  onSearchHere: () => void;
  onRequestLocation: () => void;
  onContinue: () => void;
};

export function MapScreen({
  userPin,
  restaurants,
  radius,
  mode,
  loading,
  errorMessage,
  geoStatus,
  onPinChange,
  onRadiusChange,
  onSearchHere,
  onRequestLocation,
  onContinue,
}: Props) {
  const inRangeCount = useMemo(
    () =>
      restaurants.filter((r) => distanceMiles(userPin, { lat: r.lat, lng: r.lng }) <= radius).length,
    [restaurants, userPin, radius],
  );

  const tooFew = inRangeCount < 3 && !loading;
  const canContinue = inRangeCount >= 3;
  const locating = geoStatus === "requesting";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-400">map</p>
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={locating || geoStatus === "denied"}
            className="rounded-full border border-sand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-500 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Use my current location"
            title={
              geoStatus === "denied"
                ? "Location is blocked in this browser. Click the padlock icon next to the URL → Site settings → Location → Allow."
                : undefined
            }
          >
            {locating
              ? "Locating…"
              : geoStatus === "denied"
                ? "📍 Location blocked"
                : geoStatus === "granted"
                  ? "📍 Recenter on me"
                  : "📍 Use my location"}
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
            {loading
              ? "Searching…"
              : locating
                ? "Locating…"
                : `${inRangeCount} ${inRangeCount === 1 ? "place" : "places"} in range`}
          </p>
        </div>
      </div>

      {(geoStatus === "denied" || geoStatus === "unavailable") && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          <p>
            {geoStatus === "denied"
              ? "Location access denied"
              : "Couldn’t get your location"}{" "}
            — drag the pin to your area, then tap{" "}
            <em className="font-medium text-ink-900">Search this area</em>.
          </p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer font-medium text-teal-700">
              How to enable location
            </summary>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-ink-500">
              <li>
                <strong className="text-ink-900">Browser site setting:</strong> click the
                padlock icon in the URL bar (left of partytab.app) → <em>Site settings</em>{" "}
                → <em>Location</em> → choose <em>Allow</em>.
              </li>
              <li>
                <strong className="text-ink-900">macOS system setting:</strong> Apple
                menu → <em>System Settings</em> → <em>Privacy &amp; Security</em> →{" "}
                <em>Location Services</em> → make sure your browser (Chrome/Safari/Firefox)
                is toggled on. If you&apos;ve never been prompted, this is usually the cause.
              </li>
              <li>
                Refresh this page. The browser will re-request permission.
              </li>
            </ol>
          </details>
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

      {!loading && !errorMessage && !locating && restaurants.length === 0 && geoStatus !== "unknown" && (
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
          disabled={loading || locating}
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
