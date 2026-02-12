/**
 * Trip Templates for PartyTab Demo Generation
 * Each template includes themed expenses that will be shown in the demo
 */

export const TRIP_TEMPLATES = {
  ski: {
    name: "Ski Weekend",
    emoji: "⛷️",
    expenses: [
      { description: "Cabin rental", amount: 783.50, paidBy: "Jamie" },
      { description: "Lift tickets", amount: 492, paidBy: "Jamie" },
      { description: "Groceries", amount: 167.80, paidBy: "You" },
      { description: "Ski rentals", amount: 248, paidBy: "Alex" },
      { description: "Dinner out", amount: 94.50, paidBy: "Sam" },
    ],
  },

  beach: {
    name: "Beach Trip",
    emoji: "🏖️",
    expenses: [
      { description: "Beach house", amount: 1247.50, paidBy: "Alex" },
      { description: "Jet ski rental", amount: 285, paidBy: "Alex" },
      { description: "Groceries", amount: 178.30, paidBy: "You" },
      { description: "Seafood dinner", amount: 216.40, paidBy: "Jamie" },
      { description: "Beach gear", amount: 89.50, paidBy: "Sam" },
    ],
  },

  bachelor: {
    name: "Bachelor Party",
    emoji: "🎉",
    expenses: [
      { description: "Airbnb", amount: 967.50, paidBy: "Alex" },
      { description: "Bottle service", amount: 584, paidBy: "Alex" },
      { description: "Steakhouse dinner", amount: 487.20, paidBy: "You" },
      { description: "Golf round", amount: 316, paidBy: "Sam" },
      { description: "Uber rides", amount: 143.80, paidBy: "Jamie" },
    ],
  },

  bachelorette: {
    name: "Bachelorette",
    emoji: "💅",
    expenses: [
      { description: "Airbnb", amount: 862.50, paidBy: "Mia" },
      { description: "Spa day", amount: 396, paidBy: "Mia" },
      { description: "Brunch", amount: 187.40, paidBy: "You" },
      { description: "Wine tour", amount: 276, paidBy: "Sophie" },
      { description: "Decorations", amount: 93.50, paidBy: "Emma" },
    ],
  },

  roadtrip: {
    name: "Road Trip",
    emoji: "🚗",
    expenses: [
      { description: "Gas", amount: 327.50, paidBy: "You" },
      { description: "Motel", amount: 247.80, paidBy: "You" },
      { description: "Food stops", amount: 183.40, paidBy: "Jamie" },
      { description: "National park pass", amount: 84, paidBy: "Sam" },
      { description: "Car snacks", amount: 47.30, paidBy: "Alex" },
    ],
  },

  camping: {
    name: "Camping Trip",
    emoji: "🏕️",
    expenses: [
      { description: "Campsite fees", amount: 127.50, paidBy: "Alex" },
      { description: "Firewood & supplies", amount: 68, paidBy: "Alex" },
      { description: "Food & drinks", amount: 218.75, paidBy: "Jamie" },
      { description: "Gear rental", amount: 156, paidBy: "You" },
      { description: "Gas", amount: 84.50, paidBy: "Sam" },
    ],
  },

  lake: {
    name: "Lake House",
    emoji: "🛶",
    expenses: [
      { description: "Lake house rental", amount: 1135, paidBy: "Jamie" },
      { description: "Boat rental", amount: 347.50, paidBy: "Jamie" },
      { description: "Groceries", amount: 193.20, paidBy: "You" },
      { description: "Fishing gear", amount: 87.50, paidBy: "Sam" },
      { description: "BBQ supplies", amount: 124.30, paidBy: "Alex" },
    ],
  },

  city: {
    name: "City Trip",
    emoji: "🌆",
    expenses: [
      { description: "Hotel", amount: 687.50, paidBy: "Alex" },
      { description: "Concert tickets", amount: 324, paidBy: "Alex" },
      { description: "Nice dinner", amount: 243.80, paidBy: "Jamie" },
      { description: "Ubers", amount: 97.50, paidBy: "Sam" },
      { description: "Museum & tours", amount: 84, paidBy: "You" },
    ],
  },

  vegas: {
    name: "Vegas Trip",
    emoji: "🎰",
    expenses: [
      { description: "Hotel suite", amount: 812.50, paidBy: "Jamie" },
      { description: "Club table", amount: 547, paidBy: "Jamie" },
      { description: "Show tickets", amount: 276, paidBy: "You" },
      { description: "Pool cabana", amount: 298.50, paidBy: "Sam" },
      { description: "Group dinner", amount: 197.40, paidBy: "Alex" },
    ],
  },

  hiking: {
    name: "Hiking Trip",
    emoji: "🥾",
    expenses: [
      { description: "Cabin", amount: 437.50, paidBy: "Alex" },
      { description: "Gear rental", amount: 124, paidBy: "Alex" },
      { description: "Food & snacks", amount: 148.75, paidBy: "You" },
      { description: "Park permits", amount: 64, paidBy: "Sam" },
      { description: "Gas", amount: 78.50, paidBy: "Jamie" },
    ],
  },

  // Default fallback for unrecognized trips
  generic: {
    name: "Group Trip",
    emoji: "🤙",
    expenses: [
      { description: "Accommodation", amount: 763.50, paidBy: "Alex" },
      { description: "Activities", amount: 284, paidBy: "Alex" },
      { description: "Food & drinks", amount: 197.50, paidBy: "Jamie" },
      { description: "Transportation", amount: 124, paidBy: "Sam" },
      { description: "Misc expenses", amount: 89.50, paidBy: "You" },
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
