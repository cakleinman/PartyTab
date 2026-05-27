export type Screen = "start" | "map" | "filters" | "eliminate" | "final2" | "winner";

export type WhenMode = "now" | "custom";

export type Filters = {
  whenMode: WhenMode;
  day: string;
  hour: string;
  radiusMiles: number;
  priceLevels: number[];
  minRating: number;
  dietary: string[];
  excludeCuisines: string[];
};

export type Restaurant = {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number;
  types: string[];
  cuisine: string;
  distanceMiles: number;
  driveMinutes: number;
  photo?: string;
  reviews?: { author: string; text: string }[];
  website?: string;
  hours?: Record<string, string>;
  openNow?: boolean;
};

export type LatLng = { lat: number; lng: number };

export type IdkypState = {
  screen: Screen;
  filters: Filters;
  userPin: LatLng | null;
  pool: Restaurant[];
  trio: Restaurant[];
  eliminated: Restaurant[];
  finalists: Restaurant[];
  winner: Restaurant | null;
};

export type IdkypUsageInfo = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
};
