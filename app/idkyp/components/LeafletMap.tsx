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
  const userMarkerRef = useRef<Leaflet.Marker | null>(null);
  const radiusCircleRef = useRef<Leaflet.Circle | null>(null);
  const restaurantLayerRef = useRef<Leaflet.LayerGroup | null>(null);

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

      const userIcon = L.divIcon({
        className: "idkyp-user-pin",
        html:
          '<div style="width:18px;height:18px;border-radius:9999px;background:#0a776a;border:3px solid white;box-shadow:0 0 0 2px rgba(10,119,106,0.25);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const userMarker = L.marker([userPin.lat, userPin.lng], {
        icon: userIcon,
        draggable: true,
      })
        .addTo(map)
        .on("dragend", () => {
          const pos = userMarker.getLatLng();
          onPinChange({ lat: pos.lat, lng: pos.lng });
        });

      const radiusCircle = L.circle([userPin.lat, userPin.lng], {
        radius: radius * MILE_IN_METERS,
        color: "#0a776a",
        weight: 1,
        opacity: 0.5,
        fillColor: "#0a776a",
        fillOpacity: 0.08,
      }).addTo(map);

      const restaurantLayer = L.layerGroup().addTo(map);

      mapRef.current = map;
      userMarkerRef.current = userMarker;
      radiusCircleRef.current = radiusCircle;
      restaurantLayerRef.current = restaurantLayer;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      radiusCircleRef.current = null;
      restaurantLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the user marker + circle in sync with state
  useEffect(() => {
    userMarkerRef.current?.setLatLng([userPin.lat, userPin.lng]);
    radiusCircleRef.current?.setLatLng([userPin.lat, userPin.lng]);
  }, [userPin]);

  useEffect(() => {
    radiusCircleRef.current?.setRadius(radius * MILE_IN_METERS);
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
          className: "idkyp-restaurant-pin",
          html: `<div style="width:10px;height:10px;border-radius:9999px;background:${
            inRange ? "#1b1a18" : "#bab9b5"
          };border:2px solid white;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([r.lat, r.lng], { icon }).bindTooltip(r.name).addTo(restaurantLayerRef.current!);
      }
    });
  }, [restaurants, userPin, radius]);

  return <div ref={containerRef} className="h-[55vh] w-full" />;
}
