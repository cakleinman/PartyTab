"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng, Restaurant } from "@/lib/idkyp/types";
import { distanceMiles } from "@/lib/idkyp/geo";

type Props = {
  userPin: LatLng;
  restaurants: Restaurant[];
  radius: number;
  onPinChange: (pin: LatLng) => void;
};

const MILE_IN_METERS = 1609.344;

export function LeafletMap({ userPin, restaurants, radius, onPinChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const radiusCircleRef = useRef<Leaflet.Circle | null>(null);
  const restaurantLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  // Distinguishes "user dragged the map" from "we programmatically panned the
  // map in response to userPin changing from outside (Recenter on me)". Without
  // this guard, panTo → moveend → onPinChange → state update → effect re-fires
  // → panTo again, causing a feedback loop.
  const programmaticPanRef = useRef(false);
  const onPinChangeRef = useRef(onPinChange);
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [userPin.lat, userPin.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap · CartoDB",
          maxZoom: 19,
        },
      ).addTo(map);

      // Pin = map center, so the radius circle anchors there too. It moves
      // automatically every time we re-center the map.
      const radiusCircle = L.circle([userPin.lat, userPin.lng], {
        radius: radius * MILE_IN_METERS,
        color: "#0a776a",
        weight: 1,
        opacity: 0.5,
        fillColor: "#0a776a",
        fillOpacity: 0.08,
      }).addTo(map);

      const restaurantLayer = L.layerGroup().addTo(map);

      // Frame the whole radius circle on first paint instead of a fixed zoom.
      programmaticPanRef.current = true;
      map.fitBounds(radiusCircle.getBounds(), { padding: [24, 24], maxZoom: 16, animate: false });

      map.on("move", () => {
        const c = map.getCenter();
        radiusCircle.setLatLng([c.lat, c.lng]);
      });

      map.on("moveend", () => {
        if (programmaticPanRef.current) {
          programmaticPanRef.current = false;
          return;
        }
        const c = map.getCenter();
        onPinChangeRef.current({ lat: c.lat, lng: c.lng });
      });

      mapRef.current = map;
      radiusCircleRef.current = radiusCircle;
      restaurantLayerRef.current = restaurantLayer;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      radiusCircleRef.current = null;
      restaurantLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External userPin updates (Recenter on me, geolocation grant) pan the map.
  // Skip if the map is already centered there — that's the round-trip from our
  // own moveend handler and panning again would loop.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (Math.abs(c.lat - userPin.lat) < 1e-6 && Math.abs(c.lng - userPin.lng) < 1e-6) {
      return;
    }
    programmaticPanRef.current = true;
    map.setView([userPin.lat, userPin.lng], map.getZoom(), { animate: true });
  }, [userPin]);

  // Resize the radius circle and reframe the map so the whole circle stays in
  // view — widening the radius zooms out, narrowing zooms back in. Guard the
  // programmatic move so the resulting moveend isn't echoed back as a pin drag.
  useEffect(() => {
    const map = mapRef.current;
    const circle = radiusCircleRef.current;
    if (!map || !circle) return;
    circle.setRadius(radius * MILE_IN_METERS);
    programmaticPanRef.current = true;
    map.fitBounds(circle.getBounds(), { padding: [24, 24], maxZoom: 16, animate: true });
  }, [radius]);

  // Redraw restaurant markers when restaurants or radius/pin changes
  useEffect(() => {
    const layer = restaurantLayerRef.current;
    if (!layer) return;

    void import("leaflet").then((L) => {
      if (!restaurantLayerRef.current) return;
      restaurantLayerRef.current.clearLayers();
      for (const r of restaurants) {
        const inRange =
          distanceMiles(userPin, { lat: r.lat, lng: r.lng }) <= radius;
        const icon = L.divIcon({
          className: "",
          html: `<div class="idkyp-pin-restaurant ${inRange ? "is-in-range" : "is-out-of-range"}"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([r.lat, r.lng], { icon }).bindTooltip(r.name).addTo(restaurantLayerRef.current!);
      }
    });
  }, [restaurants, userPin, radius]);

  return (
    <div className="relative h-[55vh] w-full">
      <div ref={containerRef} className="h-full w-full" />
      {/* User pin = map center. Rendered as a fixed overlay rather than a
          Leaflet marker so it can never drift from center; pointer-events-none
          so map drag still works underneath it. z-[1000] sits above Leaflet's
          popup pane (700). */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="idkyp-pin-user-wrap">
          <div className="idkyp-pin-user" />
        </div>
      </div>
    </div>
  );
}
