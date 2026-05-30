"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Filters, LatLng, Restaurant } from "@/lib/idkyp/types";
import { applyMapFilters } from "@/lib/idkyp/filters";
import type { GeoStatus } from "../IdkypClient";
import { WhenPicker, formatWhenLabel } from "./WhenPicker";

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
  filters: Filters;
  mode: "live" | "demo" | null;
  loading: boolean;
  errorMessage: string | null;
  geoStatus: GeoStatus;
  onPinChange: (pin: LatLng) => void;
  onFiltersChange: (filters: Filters) => void;
  onSearchHere: () => void;
  onRequestLocation: () => void;
  onContinue: () => void;
};

export function MapScreen({
  userPin,
  restaurants,
  filters,
  mode,
  loading,
  errorMessage,
  geoStatus,
  onPinChange,
  onFiltersChange,
  onSearchHere,
  onRequestLocation,
  onContinue,
}: Props) {
  const radius = filters.radius;
  // Reachable + open at the chosen time. Excludes preference filters; those
  // apply on the next screen. Matches the prototype's map-count semantic.
  const matchingCount = useMemo(
    () => applyMapFilters(restaurants, filters).length,
    [restaurants, filters],
  );

  const tooFew = matchingCount < 3 && !loading;
  const canContinue = matchingCount >= 3;
  const locating = geoStatus === "requesting";
  const whenLabel = formatWhenLabel(filters);
  const countLabelSuffix =
    filters.whenMode === "now" ? "open now" : `open ${whenLabel.toLowerCase()}`;

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
            title={`${matchingCount} ${countLabelSuffix}`}
          >
            {loading
              ? "Searching…"
              : locating
                ? "Locating…"
                : `${matchingCount} ${matchingCount === 1 ? "place" : "places"} ${countLabelSuffix}`}
          </p>
        </div>
      </div>

      {(geoStatus === "denied" || geoStatus === "unavailable") && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          <p>
            {geoStatus === "denied"
              ? "Location access denied"
              : "Couldn’t get your location"}{" "}
            — drag the pin to your area and results refresh automatically.
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
          No restaurants found here. Try moving the pin or widening the radius, or{" "}
          <button type="button" onClick={onSearchHere} className="font-medium text-teal-700 underline">
            search again
          </button>
          .
        </div>
      )}

      {!loading && !errorMessage && restaurants.length > 0 && tooFew && (
        <div className="rounded-2xl border border-sand-200 bg-sand-50 p-3 text-sm text-ink-500">
          Only {matchingCount} {matchingCount === 1 ? "place" : "places"} {countLabelSuffix}{" "}
          in this radius — IDKYP needs at least 3 to start eliminating. Widen the radius,
          change the time, or move the pin.
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

      <details className="group rounded-2xl border border-sand-200 bg-white">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-ink-900 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                filters.whenMode === "now" ? "bg-teal-600" : "bg-ink-400"
              }`}
              aria-hidden="true"
            />
            <span className="text-xs uppercase tracking-wide text-ink-500">When</span>
            <span>{whenLabel}</span>
          </span>
          <span className="text-ink-400 transition group-open:rotate-180" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="border-t border-sand-200 p-4">
          <WhenPicker filters={filters} onChange={onFiltersChange} />
        </div>
      </details>

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
          onChange={(e) => onFiltersChange({ ...filters, radius: Number(e.target.value) })}
          aria-label="Search radius"
          aria-valuetext={`${radius.toFixed(1)} miles`}
          className="w-full accent-teal-600"
        />
      </div>

      {/* Sticky action bar keeps the live place count on screen no matter how
          far the form is scrolled, right next to the Continue CTA. Results
          refresh automatically when the pin or radius changes, so there's no
          separate "Search this area" button — failures retry via the banners. */}
      <div className="sticky bottom-0 -mx-6 border-t border-sand-200 bg-sand-50/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-sm font-medium ${tooFew ? "text-orange-700" : "text-ink-700"}`}
            aria-live="polite"
          >
            {loading
              ? "Searching…"
              : locating
                ? "Locating…"
                : `${matchingCount} ${matchingCount === 1 ? "place" : "places"} ${countLabelSuffix}`}
          </p>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className={`rounded-full px-6 py-3 text-sm font-medium transition ${
              canContinue
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "cursor-not-allowed bg-sand-100 text-ink-400"
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
