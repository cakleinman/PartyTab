# PartyTab Launch Copy

> Ready-to-paste copy for Product Hunt, Show HN, Reddit, and directory listings.
> **Tone:** Conversational, authentic, no hype. Emphasize: browser-based, no download friction, free, built for one-off events.

---

## 1. PRODUCT HUNT LAUNCH

### Tagline (60 chars max)
Split bills instantly. No app download required.

### Description (260 chars max)
The fastest way to split costs for trips and parties. Share a link, add expenses, and settle up. No accounts needed for guests. Built for the web.

### Full First Comment (Maker Response)

Hey everyone! 👋

I built PartyTab because I was tired of being the "accounting buzzkill" on group trips. You know the drill: you're at a bachelor party or a ski weekend, and you have to nag 10 people to download an app, create an account, and verify their email just to figure out who paid for the Airbnb.

PartyTab solves that friction. It's a browser-based bill splitter designed for speed:

1. **Create a tab.**
2. **Share the link.**
3. **Everyone adds their own expenses.**

We use a greedy algorithm to minimize the number of transactions needed to settle up (so 5 people don't have to Venmo 5 other people). It's free to use for manual entry. We do have a paid "Pro" tier ($3.99/mo) if you want AI receipt scanning, but the core utility is completely free.

Would love to hear what you think!

### Key Highlights/Topics
- No App Install Required
- Instant Link Sharing
- Optimized Settlement Math

### Suggested Categories
**Primary:** Web App
**Secondary:** Fintech, Travel

---

## 2. SHOW HN POST

### Title
Show HN: PartyTab – Split bills in the browser, no app install required

### Body Text

I built PartyTab to solve the friction of splitting bills for one-off events (ski trips, dinners, bachelor parties). Existing solutions usually require every participant to download a native app and create an account, which is a high barrier for a casual weekend group.

PartyTab is a Next.js web app. It uses a greedy algorithm to calculate the settlement plan, minimizing the total number of edges (transactions) in the debt graph—so instead of 10 Venmos, you might only need 3.

It's free to use. We monetize via an optional $3.99/mo Pro subscription that adds AI receipt scanning (using Claude), but manual entry is free forever.

Check it out: https://partytab.app

Feedback on the settlement logic or mobile web UX is appreciated.

---

## 3. REDDIT POSTS

### r/SideProject

#### Title
I built a bill splitter because I hate asking friends to download apps.

#### Body

Hi everyone,

I recently launched PartyTab. It's a web-based bill splitter for groups.

The idea came from a frustration I think many of us have felt: trying to organize expenses for a group trip, but half the group doesn't have the "right" app installed. I didn't want to force my friends to sign up for a service just to split a dinner bill.

With PartyTab, you just create a link and drop it in the group chat. Everyone can add expenses immediately in their mobile browser. Under the hood, I'm using a minimization algorithm to ensure the fewest number of people have to pay each other back.

The tech stack is Next.js/React/TypeScript with Prisma and PostgreSQL on the backend. Would love any feedback on the UI/UX or the math behind settlement!

https://partytab.app

---

### r/webapps

#### Title
PartyTab: A browser-based bill splitter for groups (no install needed)

#### Body

I wanted to share a tool I built called PartyTab. It's a utility for splitting expenses for events like bachelor parties, road trips, or group dinners.

**How it works:**
1. Create a "Tab" and get a unique URL.
2. Share the URL with friends.
3. Anyone with the link can add expenses or view the balance.
4. The app calculates who owes whom, minimizing the total number of transfers.

It works entirely in the browser (mobile-first design), so nobody needs to install anything. You can even join without signing up—just grab the link and start adding expenses.

https://partytab.app

---

### r/splitwise

#### Title
I made a simpler alternative for one-off trips (no account needed)

#### Body

Hey all, long-time Splitwise user here.

I love Splitwise for my actual roommates, but I've always found it heavy for one-off events (like a weekend camping trip with friends who don't use the app). It's often hard to get everyone to download it and set it up just for 48 hours.

I built **PartyTab** as a lightweight alternative for these specific situations. It's browser-based, so you just send a link. No app install or account creation is required for guests to join and add expenses.

It's not meant to replace Splitwise for long-term household management, but it might be useful for your next vacation or night out. There's also an optional Pro tier ($3.99/mo) if you want AI receipt scanning.

https://partytab.app

---

## 4. DIRECTORY LISTINGS

### AlternativeTo
A lightweight, browser-based alternative to Splitwise. Perfect for one-off events like trips or dinners where guests shouldn't need to download an app or create an account to participate. Uses a greedy algorithm to minimize settlement transactions.

**Alternative to:** Splitwise, Tricount, Kittysplit

### SaaSHub
Free bill-splitting for groups without the app install friction. Share a link to collaborate instantly on expenses for trips and parties. Optional Pro subscription ($3.99/mo) adds AI receipt scanning capabilities. Built with Next.js and PostgreSQL.

### Product Hunt "About" Section
The frictionless, browser-based way to split bills for groups and trips.

---

## 5. ONE-LINER DESCRIPTIONS

### 10 Words
Split bills instantly in your browser. No app download needed.

### 25 Words
The easiest way to split expenses for trips and parties. Share a link, add costs, and settle up without forcing friends to download an app.

### 50 Words
PartyTab removes the friction from splitting bills. Perfect for bachelor parties, ski trips, and dinners. Create a tab, share the link, and let the group add expenses. Our algorithm calculates the fewest payments needed to settle up. Works entirely in the browser—no app install or accounts required for guests.

---

## Usage Notes

- **Tone:** Keep it conversational across all platforms. Avoid buzzwords like "revolutionary" or "disruptive."
- **Key Points to Reinforce:** No friction (no app, no account needed), free, browser-based, smart settlement math
- **Pro Features Mention:** Only mention AI receipt scanning ($3.99/mo) if relevant to the audience; de-emphasize it on HN and r/webapps
- **Authentic Differentiator:** Emphasize this is built for *one-off events*, not household/ongoing management
- **Links:** Replace placeholder `https://partytab.app` with actual campaign URLs if using UTM tracking
