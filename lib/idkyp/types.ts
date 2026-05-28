export type Screen = "start" | "map" | "filters" | "eliminate" | "final2" | "winner";

export type WhenMode = "now" | "custom";

export type Filters = {
  whenMode: WhenMode;
  day: string;
  hour: string;
  radius: number;
  priceLevels: number[];
  minRating: number;
  dietary: string[];
  excludeCuisines: string[];
};

export type LatLng = { lat: number; lng: number };

export type RestaurantReview = { text: string; author: string };

/** A single open→close interval from Places `regularOpeningHours.periods`.
 *  `day` is 0 (Sunday) – 6 (Saturday). `close` omitted for 24-hour places. */
export type OpeningPoint = { day: number; hour: number; minute: number };
export type OpeningPeriod = { open: OpeningPoint; close?: OpeningPoint };

export type Restaurant = {
  id: number;
  placeId: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  reviews: number;
  price: number;
  distance: number;
  drive: number;
  tags: string[];
  lat: number;
  lng: number;
  photo: string;
  /** Up to 3 resolved photo URLs (primary first, gallery uses this array). */
  photos: string[];
  /** Per-weekday descriptions from Places API (e.g. "Monday: 9:00 AM – 10:00 PM") */
  hours: string[] | null;
  /** Live open/closed status from Places currentOpeningHours; null if unknown */
  openNow: boolean | null;
  /** Structured weekly schedule for `isOpenAt` checks; null if Places omitted it */
  periods: OpeningPeriod[] | null;
  realReviews: RestaurantReview[] | null;
  website: boolean;
  websiteUrl: string | null;
};

export type IdkypState = {
  screen: Screen;
  filters: Filters;
  userPin: LatLng;
  pool: Restaurant[];
  trio: Restaurant[];
  eliminated: Restaurant[];
  finalists: Restaurant[];
  winner: Restaurant | null;
  isAnimating: boolean;
  justReplacedIdx: number | null;
};

export type IdkypUsageInfo = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
};

export const MAP_CENTER: LatLng = { lat: 39.5994, lng: -110.8107 };

export function defaultFilters(): Filters {
  const now = new Date();
  return {
    whenMode: "now",
    day: "0",
    hour: String(now.getHours()),
    radius: 3,
    priceLevels: [1, 2, 3, 4],
    minRating: 3.5,
    dietary: [],
    excludeCuisines: [],
  };
}
