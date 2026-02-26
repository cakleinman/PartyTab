# Share Page Rework — "Go Pay Up" Design

## Problem

The share page (`/share/[token]`) shows a wrong per-person average and has no way to get to the actual tab. When someone shares the link in a group chat to remind people to pay, it fails at that job entirely.

## Solution

Rework the share page into a settlement-focused view that shows who owes whom, settlement progress, and lets people join the tab.

## Design

### Page Structure

Three sections, top to bottom:

1. **Tab header** — name, description, total amount, participant count
2. **Settlement transfers** — progress bar + two groups:
   - **Still owed** — unpaid transfers with names and amounts
   - **Settled up** — completed transfers with green checkmarks (social proof)
3. **Actions footer** — "Join this tab" button (links to invite flow) + "Create your own tab" secondary link + "Powered by PartyTab" branding

### Data Requirements

The share page needs to fetch:
- Tab info (name, description, status)
- Participants with display names
- Settlement transfers (saved for closed tabs, computed on-the-fly for active)
- Acknowledgement status for each transfer (to determine paid vs unpaid)

### Key Decisions

- **Show all transfers, not just unpaid** — settled transfers with checkmarks create social proof and peer pressure
- **Show real amounts, not averages** — per-person average was misleading with custom splits
- **Keep share and invite tokens separate** — share page links to `/join/[token]` for joining, no auth logic on the share page itself
- **No payment method details** — those stay behind auth on the settlement page
- **Active tabs show "Settlement preview"** with note that amounts may change; closed tabs show "Final settlement"
- **"Join this tab" button** — only shown if the tab has an active (non-revoked) invite; links to the existing join flow
- **"Create your own tab"** — secondary CTA for growth loop (participant → creator)

### OG Image

Update to show transfer count and progress instead of the misleading per-person average. E.g., "5 people · 2 of 4 settled up · $847.50 total"

### Privacy

Names and amounts are visible to anyone with the link. No emails, user IDs, or payment methods exposed. This is acceptable since the link is shared intentionally in private group chats, not on social media.
