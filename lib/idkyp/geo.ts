import type { LatLng } from "./types";

const EARTH_RADIUS_MILES = 3958.756;

export function distanceMiles(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export function estDriveMinutes(miles: number): number {
  if (miles < 2) return Math.max(1, Math.ceil(miles * 3));
  if (miles < 5) return Math.ceil(miles * 2);
  return Math.ceil(miles * 1.7);
}

export function inferCuisine(types: string[]): string {
  const t = ` ${types.join(" ")} `;
  if (/japanese|sushi/.test(t)) return "Japanese";
  if (/pizza/.test(t)) return "Pizza";
  if (/mexican/.test(t)) return "Mexican";
  if (/italian/.test(t)) return "Italian";
  if (/greek|mediterranean/.test(t)) return "Greek";
  if (/steak_house/.test(t)) return "Steakhouse";
  if (/barbecue|bbq/.test(t)) return "BBQ";
  if (/brewery|brew_pub/.test(t)) return "Brewpub";
  if (/donut|bakery/.test(t)) return "Bakery";
  if (/coffee_shop/.test(t)) return "Coffee";
  if (/ice_cream|frozen/.test(t)) return "Ice Cream";
  if (/dessert|drink_shop/.test(t)) return "Drinks";
  if (/sandwich|deli/.test(t)) return "Sandwich";
  if (/hamburger|burger|hot_dog/.test(t)) return "Burgers";
  if (/diner/.test(t)) return "Diner";
  if (/sports_bar|bar(?!becue)|pub/.test(t)) return "Bar";
  if (/fast_food/.test(t)) return "Fast Food";
  if (/cafe/.test(t)) return "Cafe";
  if (/american|country_club/.test(t)) return "American";
  return "Restaurant";
}

export const TAGS_BY_CUISINE: Record<string, string[]> = {
  Pizza: ["vegetarian"],
  Italian: ["vegetarian"],
  Mexican: ["vegetarian", "glutenFree"],
  Greek: ["vegetarian", "vegan"],
  Japanese: ["vegetarian", "glutenFree"],
  Steakhouse: ["glutenFree"],
  Bakery: ["vegetarian"],
  Coffee: ["vegetarian", "vegan"],
  Cafe: ["vegetarian"],
  "Ice Cream": ["vegetarian"],
  Drinks: ["vegetarian", "vegan"],
  Sandwich: [],
  Burgers: [],
  Diner: [],
  Bar: [],
  BBQ: ["glutenFree"],
  Brewpub: ["vegetarian"],
  "Fast Food": [],
  American: [],
  Restaurant: [],
};

export const PHOTO_BY_CUISINE: Record<string, string> = {
  Japanese:
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=70",
  Pizza:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=70",
  Mexican:
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=70",
  Italian:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=70",
  Greek:
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=70",
  Steakhouse:
    "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=70",
  BBQ: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=70",
  Brewpub:
    "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&w=800&q=70",
  Bakery:
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=70",
  Coffee:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=70",
  "Ice Cream":
    "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&q=70",
  Drinks:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=70",
  Sandwich:
    "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=800&q=70",
  Burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=70",
  Diner:
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=70",
  Bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=70",
  "Fast Food":
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=70",
  Cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=70",
  American:
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=70",
  Restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=70",
};
