/**
 * Trip Templates for PartyTab Demo Generation
 * Each template includes themed expenses that will be shown in the demo
 */

export const TRIP_TEMPLATES = {
  ski: {
    name: "Ski Weekend",
    emoji: "⛷️",
    expenses: [
      { description: "Cabin rental", amount: 800, paidBy: "Jamie" },
      { description: "Lift tickets", amount: 480, paidBy: "Alex" },
      { description: "Groceries", amount: 156, paidBy: "You" },
      { description: "Ski rentals", amount: 240, paidBy: "Sam" },
      { description: "Dinner out", amount: 95, paidBy: "Jamie" },
    ],
  },

  beach: {
    name: "Beach Trip",
    emoji: "🏖️",
    expenses: [
      { description: "Beach house", amount: 1200, paidBy: "Alex" },
      { description: "Jet ski rental", amount: 280, paidBy: "You" },
      { description: "Groceries", amount: 175, paidBy: "Sam" },
      { description: "Seafood dinner", amount: 220, paidBy: "Jamie" },
      { description: "Beach gear", amount: 85, paidBy: "You" },
    ],
  },

  bachelor: {
    name: "Bachelor Party",
    emoji: "🎉",
    expenses: [
      { description: "Airbnb", amount: 950, paidBy: "Alex" },
      { description: "Bottle service", amount: 600, paidBy: "Jamie" },
      { description: "Steakhouse dinner", amount: 480, paidBy: "You" },
      { description: "Golf round", amount: 320, paidBy: "Sam" },
      { description: "Uber rides", amount: 145, paidBy: "Alex" },
    ],
  },

  bachelorette: {
    name: "Bachelorette",
    emoji: "💅",
    expenses: [
      { description: "Airbnb", amount: 850, paidBy: "Mia" },
      { description: "Spa day", amount: 400, paidBy: "You" },
      { description: "Brunch", amount: 185, paidBy: "Sophie" },
      { description: "Wine tour", amount: 280, paidBy: "Emma" },
      { description: "Decorations", amount: 95, paidBy: "You" },
    ],
  },

  roadtrip: {
    name: "Road Trip",
    emoji: "🚗",
    expenses: [
      { description: "Gas", amount: 320, paidBy: "You" },
      { description: "Motel", amount: 240, paidBy: "Alex" },
      { description: "Food stops", amount: 185, paidBy: "Jamie" },
      { description: "National park pass", amount: 80, paidBy: "Sam" },
      { description: "Car snacks", amount: 45, paidBy: "You" },
    ],
  },

  camping: {
    name: "Camping Trip",
    emoji: "🏕️",
    expenses: [
      { description: "Campsite fees", amount: 120, paidBy: "Sam" },
      { description: "Firewood & supplies", amount: 65, paidBy: "You" },
      { description: "Food & drinks", amount: 210, paidBy: "Alex" },
      { description: "Gear rental", amount: 150, paidBy: "Jamie" },
      { description: "Gas", amount: 80, paidBy: "You" },
    ],
  },

  lake: {
    name: "Lake House",
    emoji: "🛶",
    expenses: [
      { description: "Lake house rental", amount: 1100, paidBy: "Jamie" },
      { description: "Boat rental", amount: 350, paidBy: "Alex" },
      { description: "Groceries", amount: 195, paidBy: "You" },
      { description: "Fishing gear", amount: 85, paidBy: "Sam" },
      { description: "BBQ supplies", amount: 120, paidBy: "Jamie" },
    ],
  },

  city: {
    name: "City Trip",
    emoji: "🌆",
    expenses: [
      { description: "Hotel", amount: 680, paidBy: "Alex" },
      { description: "Concert tickets", amount: 320, paidBy: "You" },
      { description: "Nice dinner", amount: 245, paidBy: "Jamie" },
      { description: "Ubers", amount: 95, paidBy: "Sam" },
      { description: "Museum & tours", amount: 80, paidBy: "You" },
    ],
  },

  vegas: {
    name: "Vegas Trip",
    emoji: "🎰",
    expenses: [
      { description: "Hotel suite", amount: 800, paidBy: "Jamie" },
      { description: "Club table", amount: 550, paidBy: "Alex" },
      { description: "Show tickets", amount: 280, paidBy: "You" },
      { description: "Pool cabana", amount: 300, paidBy: "Sam" },
      { description: "Group dinner", amount: 195, paidBy: "Jamie" },
    ],
  },

  hiking: {
    name: "Hiking Trip",
    emoji: "🥾",
    expenses: [
      { description: "Cabin", amount: 420, paidBy: "Alex" },
      { description: "Gear rental", amount: 120, paidBy: "You" },
      { description: "Food & snacks", amount: 145, paidBy: "Sam" },
      { description: "Park permits", amount: 60, paidBy: "Jamie" },
      { description: "Gas", amount: 75, paidBy: "You" },
    ],
  },

  // Default fallback for unrecognized trips
  generic: {
    name: "Group Trip",
    emoji: "✈️",
    expenses: [
      { description: "Accommodation", amount: 750, paidBy: "Alex" },
      { description: "Activities", amount: 280, paidBy: "You" },
      { description: "Food & drinks", amount: 195, paidBy: "Jamie" },
      { description: "Transportation", amount: 120, paidBy: "Sam" },
      { description: "Misc expenses", amount: 85, paidBy: "You" },
    ],
  },
};

// Keywords for manual override or simple matching
export const CATEGORY_KEYWORDS = {
  ski: ["ski", "snow", "slopes", "mountain", "snowboard", "winter", "lodge"],
  beach: ["beach", "ocean", "sand", "surf", "waves", "coastal", "shore", "tropical"],
  bachelor: ["bachelor", "groom", "guys trip", "boys trip", "stag"],
  bachelorette: ["bachelorette", "bride", "girls trip", "ladies"],
  roadtrip: ["road trip", "roadtrip", "driving", "highway", "cross country"],
  camping: ["camping", "tent", "campfire", "outdoors", "campsite"],
  lake: ["lake", "lakehouse", "cabin", "fishing", "boat"],
  city: ["city", "downtown", "urban", "nyc", "chicago", "austin", "nashville"],
  vegas: ["vegas", "casino", "gambling", "strip"],
  hiking: ["hiking", "hike", "trail", "backpacking", "summit"],
};

/**
 * Get template by category name
 */
export function getTemplate(category) {
  return TRIP_TEMPLATES[category] || TRIP_TEMPLATES.generic;
}

/**
 * Try to match category from text using keywords
 */
export function matchCategoryFromText(text) {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }

  return "generic";
}

export default TRIP_TEMPLATES;
