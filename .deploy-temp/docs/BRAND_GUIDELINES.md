# PartyTab Brand & Color Guidelines

## Brand Overview

PartyTab is a calm, minimal expense-tracking app for temporary groups. The visual language reflects this: warm, approachable neutrals with subtle accents. No harsh contrasts, no visual noise.

**Brand personality:** Calm, trustworthy, minimal, friendly

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Sand 50** | `#fbf7f0` | `--sand-50` | Page background, light surfaces |
| **Sand 100** | `#f5efe2` | `--sand-100` | Secondary backgrounds, cards |
| **Sand 200** | `#eadfcd` | `--sand-200` | Borders, dividers |
| **Ink 900** | `#1b1a18` | `--ink-900` | Primary text, primary buttons |
| **Ink 700** | `#3c3a36` | `--ink-700` | Secondary text, links |
| **Ink 500** | `#6f6a61` | `--ink-500` | Tertiary text, placeholders |
| **Ink 300** | `#a8a29a` | `--ink-300` | Subtle borders, disabled states |

### Accent Color

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **Mint 400** | `#54b9a7` | `--mint-400` | Success states, positive balances (reserved) |

---

## Typography

### Font Families

| Role | Font | CSS Variable |
|------|------|--------------|
| **Display** | Space Grotesk | `--font-display` |
| **Body** | Work Sans | `--font-body` |

### Usage

- **Headings (h1-h5):** Space Grotesk
- **Body text, buttons, forms:** Work Sans
- **Default size:** 14px (text-sm) for most UI elements
- **Tracking:** Use `tracking-[0.2em]` for uppercase labels

---

## Button Styles

### Primary Button (`.btn-primary`)

Use for the main action on any page. Only one primary button per view.

```html
<button class="btn-primary rounded-full px-6 py-3 text-sm font-semibold">
  Create tab
</button>
```

**Styles:**
- Background: `ink-900` (#1b1a18)
- Text: `sand-50` (#fbf7f0)
- Hover: `ink-700` (#3c3a36)
- Border radius: `rounded-full`

**Examples:** "Create a tab", "Save expense", "Join tab", "Confirm close"

### Secondary Button (`.btn-secondary`)

Use for secondary actions or when multiple actions are available.

```html
<button class="btn-secondary rounded-full px-6 py-3 text-sm font-semibold">
  View my tabs
</button>
```

**Styles:**
- Background: transparent
- Border: 1px solid `ink-300`
- Text: `ink-700`
- Hover: Border darkens to `ink-500`

**Examples:** "View my tabs", "Settings", "New invite", "Review & close"

### Disabled State

Add `disabled:opacity-50` for disabled buttons.

```html
<button class="btn-primary ... disabled:opacity-50" disabled>
  Saving...
</button>
```

---

## Component Patterns

### Cards

```html
<div class="rounded-3xl border border-sand-200 bg-white/80 p-6">
  <!-- Content -->
</div>
```

- Border radius: `rounded-3xl` (24px)
- Border: `border-sand-200`
- Background: `bg-white/80` (semi-transparent white)
- Padding: `p-5` or `p-6`

### Form Inputs

```html
<input class="rounded-2xl border border-sand-200 px-4 py-2" />
```

- Border radius: `rounded-2xl` (16px)
- Border: `border-sand-200`
- Padding: `px-4 py-2`

### Labels & Hints

```html
<p class="text-xs uppercase tracking-[0.2em] text-ink-500">Label</p>
<p class="text-sm text-ink-500">Helper text</p>
```

---

## Spacing System

Use Tailwind's default spacing scale:

| Class | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Tight spacing (within components) |
| `gap-3` | 12px | List items |
| `gap-4` | 16px | Card sections |
| `gap-6` | 24px | Major sections |
| `gap-8` | 32px | Page sections |

---

## Icons & Visual Elements

- **Status badges:** `rounded-full border border-sand-200 px-3 py-1 text-xs uppercase`
- **Dashed empty states:** `border border-dashed border-ink-300`
- **Info tooltips:** Use inline SVG with `text-ink-500`, 16x16px

---

## Do's and Don'ts

### Do:
- Use `btn-primary` for main actions
- Keep pages calm with plenty of white space
- Use `text-ink-500` for secondary/helper text
- Apply `rounded-3xl` to major containers, `rounded-2xl` to inputs
- Use `font-semibold` for button text and section headers

### Don't:
- Use more than one primary button per view
- Mix warm (sand) and cool colors
- Add shadows (keep surfaces flat)
- Use pure black (#000) or pure white (#fff)
- Add unnecessary visual complexity

---

## Tailwind CSS Classes Reference

### Text Colors
- `text-ink-900` - Primary text
- `text-ink-700` - Secondary text, links
- `text-ink-500` - Tertiary text, placeholders
- `text-ink-300` - Disabled text
- `text-sand-50` - Text on dark backgrounds

### Background Colors
- `bg-sand-50` - Page background
- `bg-sand-100` - Inset panels
- `bg-white/80` - Cards (semi-transparent)
- `bg-ink-900` - Primary buttons
- `bg-ink-700` - Primary button hover

### Border Colors
- `border-sand-200` - Default borders
- `border-ink-300` - Secondary buttons, subtle borders
- `border-ink-900` - Active/selected states
