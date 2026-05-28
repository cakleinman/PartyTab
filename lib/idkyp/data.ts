import type { Restaurant } from "./types";
import { MAP_CENTER } from "./types";
import {
  distanceMiles,
  estDriveMinutes,
  inferCuisine,
  TAGS_BY_CUISINE,
  PHOTO_BY_CUISINE,
} from "./geo";

type RawPlace = {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  types: string[];
};

const RAW_PLACES: RawPlace[] = [
  { place_id: "ccu_001", name: "Tangerine Eatery", formatted_address: "695 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8013, rating: 4.3, user_ratings_total: 357, price_level: 1, types: ["cafe", "salad_shop", "restaurant", "food"] },
  { place_id: "ccu_002", name: "Farlaino's Café", formatted_address: "87 W Main St, Price, UT 84501", lat: 39.5994, lng: -110.8119, rating: 4.1, user_ratings_total: 261, price_level: 1, types: ["italian_restaurant", "cafe", "restaurant"] },
  { place_id: "ccu_003", name: "Sherald's Frosty Freeze", formatted_address: "434 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8048, rating: 4.2, user_ratings_total: 328, price_level: 1, types: ["hamburger_restaurant", "ice_cream_shop", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_004", name: "Club Mecca", formatted_address: "75 W Main St, Price, UT 84501", lat: 39.5994, lng: -110.8117, rating: 4.3, user_ratings_total: 173, price_level: 2, types: ["bar", "american_restaurant", "restaurant"] },
  { place_id: "ccu_005", name: "Silver Dollar Sports Club", formatted_address: "36 W Main St, Price, UT 84501", lat: 39.5994, lng: -110.8112, rating: 4.7, user_ratings_total: 47, price_level: 2, types: ["sports_bar", "bar", "restaurant"] },
  { place_id: "ccu_006", name: "Ruben's BBQ", formatted_address: "40 W Main St, Price, UT 84501", lat: 39.5994, lng: -110.8113, rating: 4.5, user_ratings_total: 45, price_level: 2, types: ["barbecue_restaurant", "restaurant"] },
  { place_id: "ccu_007", name: "Sakura Japanese Steakhouse", formatted_address: "801 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.7999, rating: 4.3, user_ratings_total: 111, price_level: 3, types: ["japanese_restaurant", "steak_house", "restaurant"] },
  { place_id: "ccu_008", name: "The Coffee Shop", formatted_address: "17 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8105, rating: 4.3, user_ratings_total: 82, price_level: 1, types: ["coffee_shop", "cafe"] },
  { place_id: "ccu_009", name: "McDonald's", formatted_address: "409 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8052, rating: 3.5, user_ratings_total: 612, price_level: 1, types: ["fast_food_restaurant", "hamburger_restaurant", "restaurant"] },
  { place_id: "ccu_010", name: "Arby's", formatted_address: "755 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8005, rating: 3.6, user_ratings_total: 480, price_level: 1, types: ["fast_food_restaurant", "sandwich_shop", "restaurant"] },
  { place_id: "ccu_011", name: "Subway (E Main)", formatted_address: "382 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8055, rating: 3.4, user_ratings_total: 95, price_level: 1, types: ["sandwich_shop", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_012", name: "Domino's Pizza", formatted_address: "640 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.8019, rating: 3.4, user_ratings_total: 240, price_level: 1, types: ["pizza_restaurant", "meal_takeaway", "restaurant"] },
  { place_id: "ccu_013", name: "Little Caesars Pizza", formatted_address: "1169 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.7950, rating: 3.7, user_ratings_total: 220, price_level: 1, types: ["pizza_restaurant", "meal_takeaway", "restaurant"] },
  { place_id: "ccu_014", name: "Bakesters", formatted_address: "1181 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.7948, rating: 5.0, user_ratings_total: 38, price_level: 1, types: ["bakery", "donut_shop", "cafe"] },
  { place_id: "ccu_015", name: "Cold Stone Creamery", formatted_address: "1191 E Main St, Price, UT 84501", lat: 39.5994, lng: -110.7947, rating: 4.5, user_ratings_total: 54, price_level: 1, types: ["ice_cream_shop", "dessert_shop"] },
  { place_id: "ccu_016", name: "Greek Streak & Pastry", formatted_address: "84 S Carbon Ave, Price, UT 84501", lat: 39.5982, lng: -110.8108, rating: 4.3, user_ratings_total: 196, price_level: 1, types: ["greek_restaurant", "mediterranean_restaurant", "restaurant"] },
  { place_id: "ccu_017", name: "Big Don's Pizza & Pasta", formatted_address: "170 W 100 N, Price, UT 84501", lat: 39.6006, lng: -110.8130, rating: 4.2, user_ratings_total: 221, price_level: 2, types: ["pizza_restaurant", "italian_restaurant", "restaurant"] },
  { place_id: "ccu_018", name: "Sodalicious", formatted_address: "97 E 100 N, Price, UT 84501", lat: 39.6006, lng: -110.8093, rating: 4.4, user_ratings_total: 64, price_level: 1, types: ["dessert_shop", "drink_shop"] },
  { place_id: "ccu_019", name: "Chugg Drive Thru", formatted_address: "430 S Carbon Ave, Price, UT 84501", lat: 39.5940, lng: -110.8108, rating: 4.0, user_ratings_total: 69, price_level: 1, types: ["hot_dog_stand", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_020", name: "Market Express", formatted_address: "850 S Carbon Ave, Price, UT 84501", lat: 39.5887, lng: -110.8108, rating: 4.0, user_ratings_total: 48, price_level: 1, types: ["pizza_restaurant", "convenience_store", "meal_takeaway"] },
  { place_id: "ccu_021", name: "Big Moe's Eatery & Bakery", formatted_address: "61 S 700 E, Price, UT 84501", lat: 39.5985, lng: -110.7992, rating: 4.6, user_ratings_total: 91, price_level: 1, types: ["bakery", "cafe", "american_restaurant", "restaurant"] },
  { place_id: "ccu_022", name: "Oasis Café", formatted_address: "250 E 500 N, Price, UT 84501", lat: 39.6058, lng: -110.8073, rating: 4.4, user_ratings_total: 66, price_level: 1, types: ["cafe", "american_restaurant", "restaurant"] },
  { place_id: "ccu_023", name: "Juniper Pizza Café", formatted_address: "150 N Hospital Dr, Price, UT 84501", lat: 39.6053, lng: -110.8170, rating: 4.3, user_ratings_total: 165, price_level: 2, types: ["pizza_restaurant", "cafe", "restaurant"] },
  { place_id: "ccu_024", name: "WINGERS Restaurant", formatted_address: "205 N Hospital Dr, Price, UT 84501", lat: 39.6062, lng: -110.8170, rating: 4.0, user_ratings_total: 412, price_level: 2, types: ["sports_bar", "american_restaurant", "restaurant"] },
  { place_id: "ccu_025", name: "Uptown Steakhouse", formatted_address: "838 Westwood Blvd, Price, UT 84501", lat: 39.6065, lng: -110.8290, rating: 4.6, user_ratings_total: 352, price_level: 3, types: ["steak_house", "american_restaurant", "restaurant"] },
  { place_id: "ccu_026", name: "Sports Page Bar & Grill", formatted_address: "838 Westwood Blvd, Price, UT 84501", lat: 39.6068, lng: -110.8290, rating: 3.8, user_ratings_total: 72, price_level: 2, types: ["bar", "american_restaurant", "restaurant"] },
  { place_id: "ccu_027", name: "Dairy Queen Grill & Chill", formatted_address: "915 Westwood Blvd, Price, UT 84501", lat: 39.6072, lng: -110.8295, rating: 3.8, user_ratings_total: 182, price_level: 1, types: ["fast_food_restaurant", "ice_cream_shop", "restaurant"] },
  { place_id: "ccu_028", name: "JB's Restaurant", formatted_address: "111 N 800 W, Price, UT 84501", lat: 39.6005, lng: -110.8221, rating: 3.9, user_ratings_total: 329, price_level: 2, types: ["diner", "american_restaurant", "restaurant"] },
  { place_id: "ccu_029", name: "Wendy's", formatted_address: "687 W Price River Dr, Price, UT 84501", lat: 39.5965, lng: -110.8245, rating: 3.5, user_ratings_total: 540, price_level: 1, types: ["fast_food_restaurant", "hamburger_restaurant", "restaurant"] },
  { place_id: "ccu_030", name: "Taco Time", formatted_address: "640 W Price River Dr, Price, UT 84501", lat: 39.5965, lng: -110.8240, rating: 3.6, user_ratings_total: 192, price_level: 1, types: ["mexican_restaurant", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_031", name: "Lin's Market & Starbucks", formatted_address: "760 W Price River Dr, Price, UT 84501", lat: 39.5965, lng: -110.8255, rating: 4.2, user_ratings_total: 88, price_level: 1, types: ["coffee_shop", "cafe", "supermarket"] },
  { place_id: "ccu_032", name: "Los 2 Amigos", formatted_address: "353 S Highway 55, Price, UT 84501", lat: 39.5950, lng: -110.8108, rating: 3.8, user_ratings_total: 230, price_level: 2, types: ["mexican_restaurant", "restaurant"] },
  { place_id: "ccu_033", name: "Rolberto's Mexican", formatted_address: "212 S Highway 55, Price, UT 84501", lat: 39.5965, lng: -110.8108, rating: 4.2, user_ratings_total: 110, price_level: 1, types: ["mexican_restaurant", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_034", name: "Subway (Walmart)", formatted_address: "255 S Highway 55, Price, UT 84501", lat: 39.5963, lng: -110.8108, rating: 3.2, user_ratings_total: 24, price_level: 1, types: ["sandwich_shop", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_035", name: "Taco Bell", formatted_address: "120 N Carbonville Rd, Price, UT 84501", lat: 39.6017, lng: -110.8295, rating: 3.6, user_ratings_total: 220, price_level: 1, types: ["mexican_restaurant", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_036", name: "Burger King", formatted_address: "124 N Carbonville Rd, Price, UT 84501", lat: 39.6018, lng: -110.8295, rating: 3.3, user_ratings_total: 320, price_level: 1, types: ["fast_food_restaurant", "hamburger_restaurant", "restaurant"] },
  { place_id: "ccu_037", name: "KFC / A&W", formatted_address: "130 N Carbonville Rd, Price, UT 84501", lat: 39.6019, lng: -110.8295, rating: 3.6, user_ratings_total: 195, price_level: 1, types: ["fast_food_restaurant", "chicken_restaurant", "restaurant"] },
  { place_id: "ccu_038", name: "The Tipsy Tavern", formatted_address: "199 N Carbonville Rd, Price, UT 84501", lat: 39.6027, lng: -110.8295, rating: 5.0, user_ratings_total: 34, price_level: 2, types: ["bar", "restaurant"] },
  { place_id: "ccu_039", name: "El Jinete #2 Mexican Grill", formatted_address: "1267 N Carbonville Rd, Price, UT 84501", lat: 39.6147, lng: -110.8295, rating: 4.4, user_ratings_total: 114, price_level: 2, types: ["mexican_restaurant", "restaurant"] },
  { place_id: "ccu_040", name: "Grogg's Pinnacle Brewing", formatted_address: "1653 N Carbonville Rd, Helper, UT 84526", lat: 39.6520, lng: -110.8350, rating: 4.2, user_ratings_total: 245, price_level: 2, types: ["brewery", "american_restaurant", "restaurant"] },
  { place_id: "ccu_041", name: "Balance Rock Eatery & Pub", formatted_address: "148 S Main St, Helper, UT 84526", lat: 39.6822, lng: -110.8568, rating: 4.5, user_ratings_total: 208, price_level: 2, types: ["american_restaurant", "bar", "restaurant"] },
  { place_id: "ccu_042", name: "The Filling Station", formatted_address: "54 S Main St, Helper, UT 84526", lat: 39.6833, lng: -110.8568, rating: 4.0, user_ratings_total: 28, price_level: 1, types: ["diner", "hamburger_restaurant", "restaurant"] },
  { place_id: "ccu_043", name: "Gateway Lanes Food Counter", formatted_address: "94 S Main St, Helper, UT 84526", lat: 39.6829, lng: -110.8568, rating: 3.8, user_ratings_total: 22, price_level: 1, types: ["bowling_alley", "american_restaurant"] },
  { place_id: "ccu_044", name: "Helper Beer", formatted_address: "159 N Main St, Helper, UT 84526", lat: 39.6856, lng: -110.8568, rating: 4.8, user_ratings_total: 62, price_level: 2, types: ["brewery", "pizza_restaurant", "bar", "restaurant"] },
  { place_id: "ccu_045", name: "Happiness Within", formatted_address: "153 N Main St, Helper, UT 84526", lat: 39.6855, lng: -110.8568, rating: 4.4, user_ratings_total: 17, price_level: 2, types: ["restaurant", "american_restaurant"] },
  { place_id: "ccu_046", name: "Swift's Stop & Shop", formatted_address: "156 N Main St, Helper, UT 84526", lat: 39.6855, lng: -110.8570, rating: 4.0, user_ratings_total: 19, price_level: 1, types: ["convenience_store", "sandwich_shop", "food"] },
  { place_id: "ccu_047", name: "Angel's Cravings Food Truck", formatted_address: "99 N Main St, Helper, UT 84526", lat: 39.6850, lng: -110.8568, rating: 4.6, user_ratings_total: 24, price_level: 1, types: ["food_truck", "mexican_restaurant", "restaurant"] },
  { place_id: "ccu_048", name: "Carbon Country Club", formatted_address: "3055 US-6, Helper, UT 84526", lat: 39.7050, lng: -110.8200, rating: 4.5, user_ratings_total: 13, price_level: 3, types: ["country_club", "american_restaurant", "restaurant"] },
  { place_id: "ccu_049", name: "Cowboy Club & Cowboy's Kitchen", formatted_address: "31 E Main St, Wellington, UT 84542", lat: 39.5450, lng: -110.7350, rating: 3.9, user_ratings_total: 86, price_level: 2, types: ["american_restaurant", "bar", "restaurant"] },
  { place_id: "ccu_050", name: "Outlaw Café", formatted_address: "50 S 700 E, Wellington, UT 84542", lat: 39.5443, lng: -110.7270, rating: 3.8, user_ratings_total: 41, price_level: 1, types: ["cafe", "american_restaurant", "restaurant"] },
  { place_id: "ccu_051", name: "Mama DeLuca's Pizza", formatted_address: "2195 E Main St, Wellington, UT 84542", lat: 39.5450, lng: -110.7140, rating: 4.0, user_ratings_total: 26, price_level: 1, types: ["pizza_restaurant", "fast_food_restaurant", "restaurant"] },
  { place_id: "ccu_052", name: "Subway (Wellington)", formatted_address: "2195 E Main St, Wellington, UT 84542", lat: 39.5450, lng: -110.7142, rating: 2.9, user_ratings_total: 7, price_level: 1, types: ["sandwich_shop", "fast_food_restaurant", "restaurant"] },
];

function toRestaurant(p: RawPlace, idx: number): Restaurant {
  const cuisine = inferCuisine(p.types);
  const dist = distanceMiles(MAP_CENTER, { lat: p.lat, lng: p.lng });
  return {
    id: idx + 1,
    placeId: p.place_id,
    name: p.name,
    address: p.formatted_address,
    cuisine,
    rating: p.rating,
    reviews: p.user_ratings_total,
    price: p.price_level,
    distance: Math.round(dist * 10) / 10,
    drive: estDriveMinutes(dist),
    tags: TAGS_BY_CUISINE[cuisine] ?? [],
    lat: p.lat,
    lng: p.lng,
    photo: PHOTO_BY_CUISINE[cuisine] ?? PHOTO_BY_CUISINE.Restaurant,
    photos: [PHOTO_BY_CUISINE[cuisine] ?? PHOTO_BY_CUISINE.Restaurant],
    hours: null,
    periods: null,
    openNow: null,
    realReviews: null,
    website: true,
    websiteUrl: null,
  };
}

export const RESTAURANTS: Restaurant[] = RAW_PLACES.map(toRestaurant);

export function recomputeDistances(userPin: { lat: number; lng: number }): Restaurant[] {
  return RESTAURANTS.map((r) => {
    const dist = distanceMiles(userPin, { lat: r.lat, lng: r.lng });
    return {
      ...r,
      distance: Math.round(dist * 10) / 10,
      drive: estDriveMinutes(dist),
    };
  });
}
