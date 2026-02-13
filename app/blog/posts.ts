export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
}

// These would eventually come from a CMS or MDX files
export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "round-robin-paying-doesnt-work",
        title: "The Hidden Cost of \"I'll Get This One\": Why Round-Robin Paying Fails",
        excerpt:
            "\"I'll get this one, you get the next.\" Sounds fair—until meal costs vary wildly, memory fails, and someone ends up $200 behind.",
        date: "2026-06-25",
        readTime: "6 min read",
        category: "Tips",
    },
    {
        slug: "split-costco-run-with-friends",
        title: "How to Split a Costco Run with Friends",
        excerpt:
            "Costco's prices are unbeatable—but the quantities are designed for families. Learn how to split a bulk shopping run with friends and keep the savings.",
        date: "2026-06-18",
        readTime: "5 min read",
        category: "Tips",
    },
    {
        slug: "road-trip-expense-splitting",
        title: "The Complete Guide to Splitting Road Trip Expenses",
        excerpt:
            "Gas, tolls, food, hotels—road trip expenses add up fast. Here's how to split costs fairly among passengers and settle up before you get home.",
        date: "2026-06-11",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "who-pays-for-birthday-dinner",
        title: "Splitting a Birthday Dinner: Should the Birthday Person Pay?",
        excerpt:
            "The check arrives. It's your friend's birthday. Who pays? The answer depends on one thing: who planned it.",
        date: "2026-06-04",
        readTime: "5 min read",
        category: "Advice",
    },
    {
        slug: "friends-never-pay-you-back",
        title: "Why 30% of Borrowed Money Is Never Repaid (And How to Stop Being a Statistic)",
        excerpt:
            "77% of Americans have lent money to a friend, but 32% never got it back. Here are the brutal statistics and how to protect yourself.",
        date: "2026-05-28",
        readTime: "7 min read",
        category: "Advice",
    },
    {
        slug: "group-vacation-budget-methods",
        title: "Budgeting for a Group Vacation: The \"Envelope\" Method vs. Apps",
        excerpt:
            "Should you collect money upfront or track-and-settle later? Compare the envelope method vs. expense tracking apps for group trips.",
        date: "2026-05-21",
        readTime: "7 min read",
        category: "Comparison",
    },
    {
        slug: "split-wedding-costs-families",
        title: "How to Split Wedding Costs Between Families (Without a Fight)",
        excerpt:
            "The old 'bride's family pays for everything' rule is dead. Here are 5 modern approaches to splitting wedding expenses between families.",
        date: "2026-05-14",
        readTime: "8 min read",
        category: "Guides",
    },
    {
        slug: "who-pays-on-first-date",
        title: "Dating and Money: Who Pays on the First Date in 2026?",
        excerpt:
            "It's 2026 and we still can't agree on this one. Here's what the data says, what etiquette experts recommend, and how to handle it gracefully.",
        date: "2026-05-07",
        readTime: "6 min read",
        category: "Advice",
    },
    {
        slug: "large-group-dinner-bill-tips",
        title: "Large Group Dinners: How to Handle the Bill Without Chaos",
        excerpt:
            "Dinner with 12 friends was incredible—until the waiter drops one check. Here's how to split large group restaurant bills without the chaos.",
        date: "2026-04-30",
        readTime: "6 min read",
        category: "Tips",
    },
    {
        slug: "splitting-groceries-with-roommates",
        title: "Splitting Grocery Bills with Roommates: A Survival Guide",
        excerpt:
            "Rent is easy to split. Groceries? That's where roommate tensions brew. Learn the hybrid system and how to handle common flash points.",
        date: "2026-04-23",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "who-pays-for-guest-of-honor",
        title: "Bachelor/ette Party Expenses: Who Pays for the Guest of Honor?",
        excerpt:
            "The average bachelor/ette party costs $1,300–$1,500 per guest. Here's exactly what the group covers and what they don't.",
        date: "2026-04-16",
        readTime: "6 min read",
        category: "Advice",
    },
    {
        slug: "settle-up-after-group-trip",
        title: "How to Settle Up After a Group Trip (Without 50 Venmo Transactions)",
        excerpt:
            "Minimize group payments and settle vacation expenses the smart way. Learn the greedy algorithm for settling up with fewer transactions.",
        date: "2026-04-09",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "money-ruining-friendships-statistics",
        title: "36% of Friends Split Up Over Money: How to Proof Your Friendships",
        excerpt:
            "Money is the fourth largest cause of friendship stress. Here's the data on how money destroys friendships—and how to prevent it.",
        date: "2026-04-02",
        readTime: "8 min read",
        category: "Advice",
    },
    {
        slug: "split-rent-by-income-calculator",
        title: "How to Split Rent Fairly Based on Income (With Calculator Logic)",
        excerpt:
            "You make $80k. Your partner makes $50k. Splitting rent 50/50 isn't fair. Learn how to split rent proportionally based on income.",
        date: "2026-03-26",
        readTime: "8 min read",
        category: "Guides",
    },
    {
        slug: "is-it-rude-to-split-bill-evenly",
        title: "Is It Rude to Split the Bill Evenly? The 2026 Etiquette Guide",
        excerpt:
            "You ordered a salad. Your friend had steak and cocktails. Is it rude to split evenly? Here's what etiquette experts say.",
        date: "2026-03-19",
        readTime: "7 min read",
        category: "Advice",
    },
    {
        slug: "web-based-expense-tracker-vs-app",
        title: "The \"No-Download\" Rule: Why Web-Based Expense Trackers Beat Apps",
        excerpt:
            "App download friction kills group expense splitting. Why web-based tools work better for trips, dinners, and mixed device groups.",
        date: "2026-03-12",
        readTime: "6 min read",
        category: "Tips",
    },
    {
        slug: "split-airbnb-costs-different-rooms",
        title: "How to Split Airbnb Costs Fairly When Rooms Are Different Sizes",
        excerpt:
            "Master bedroom vs pull-out couch? Here's how to split vacation rental costs fairly when rooms aren't equal—4 methods with real examples.",
        date: "2026-03-05",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "remind-someone-owes-you-money",
        title: "How to Remind Someone They Owe You Money (Copy-Paste Text Templates)",
        excerpt:
            "Awkward asking friends for money back? Use these 8 proven text message templates to politely remind someone without damaging the friendship.",
        date: "2026-02-26",
        readTime: "7 min read",
        category: "Tips",
    },
    {
        slug: "receipt-scanning-apps-split-bills",
        title: "Top 5 Receipt Scanning Apps That Split Bills by Item",
        excerpt:
            "Compare the best receipt scanning apps for itemized bill splitting. AI-powered OCR, item-level claiming, and automatic tax/tip calculation reviewed.",
        date: "2026-02-19",
        readTime: "8 min read",
        category: "Comparison",
    },
    {
        slug: "best-splitwise-alternatives",
        title: "7 Best Splitwise Alternatives in 2026 (No Daily Limits)",
        excerpt:
            "Frustrated by Splitwise's daily expense limits? Here are 7 free and affordable alternatives that let you split bills without restrictions.",
        date: "2026-02-12",
        readTime: "10 min read",
        category: "Comparison",
    },
    {
        slug: "bachelor-party-budget-guide",
        title: "The Ultimate Bachelor Party Budget Guide",
        excerpt:
            "Planning a bachelor party? Here's how to set a realistic budget, split costs fairly, and avoid awkward money conversations.",
        date: "2026-01-24",
        readTime: "8 min read",
        category: "Guides",
    },
    {
        slug: "youth-sports-travel-expenses",
        title: "Managing Youth Sports Travel Team Expenses",
        excerpt:
            "Coordinating a travel team for tournaments? Here's how parent groups can fairly split hotel rooms, gas, meals, and tournament fees.",
        date: "2026-01-21",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "splitting-group-project-expenses",
        title: "How to Split Group Project Expenses Without Drama",
        excerpt:
            "Working on a group project with shared costs? Here's how to fairly split expenses for supplies, software, and food.",
        date: "2026-01-18",
        readTime: "5 min read",
        category: "Tips",
    },
    {
        slug: "ski-trip-budget-guide",
        title: "Ski Trip Budget: How to Split Costs With Your Crew",
        excerpt:
            "Lift tickets, lodging, rentals, and après-ski—here's how to keep track without wiping out.",
        date: "2026-01-15",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "group-cruise-expense-splitting",
        title: "How to Split Expenses on a Group Cruise",
        excerpt:
            "Cruising with friends? Here's how to handle cabin costs, excursions, drink packages, and onboard expenses.",
        date: "2026-01-12",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "bachelorette-party-budget-guide",
        title: "The Ultimate Bachelorette Party Budget Guide",
        excerpt:
            "How to give the bride-to-be an amazing send-off without anyone going into debt.",
        date: "2026-01-09",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "girls-trip-budget-planning",
        title: "Girls Trip Budget Planning: Split Costs Without the Drama",
        excerpt:
            "A practical guide to planning, budgeting, and splitting expenses for your next girls getaway.",
        date: "2026-01-06",
        readTime: "6 min read",
        category: "Guides",
    },
    {
        slug: "splitting-holiday-expenses-family",
        title: "How to Split Holiday Expenses With Family",
        excerpt:
            "Family holidays get expensive fast. Here's how to fairly split costs for Thanksgiving, Christmas, or reunions.",
        date: "2026-01-03",
        readTime: "7 min read",
        category: "Guides",
    },
    {
        slug: "avoid-losing-friends-over-money",
        title: "How to Avoid Losing Friends Over Money",
        excerpt:
            "Money is the #1 cause of friendship conflicts. Here's how to handle shared expenses without ruining relationships.",
        date: "2025-12-30",
        readTime: "7 min read",
        category: "Advice",
    },
    {
        slug: "splitting-group-dinner-bills",
        title: "How to Split a Group Dinner Bill Without the Awkwardness",
        excerpt:
            "6 ways to split a restaurant bill fairly, plus how to handle the friend who always orders the expensive steak.",
        date: "2025-12-27",
        readTime: "5 min read",
        category: "Tips",
    },
    {
        slug: "splitting-rent-fairly",
        title: "How to Split Rent Fairly (When Rooms Aren't Equal)",
        excerpt:
            "The master bedroom shouldn't cost the same as the tiny room by the bathroom. 5 fair methods to split unequal rent.",
        date: "2025-12-24",
        readTime: "6 min read",
        category: "Tips",
    },
];

/** Returns only posts whose date is today or earlier */
export function getPublishedPosts(): BlogPost[] {
    const today = new Date().toISOString().split("T")[0];
    return BLOG_POSTS.filter((post) => post.date <= today);
}
