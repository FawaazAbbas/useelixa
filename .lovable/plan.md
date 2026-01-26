

# Pitch Deck Light Mode & Content Overhaul

## Overview
Transform the pitch deck from dark mode to light mode, reorganize slides, add competitor comparison boxes, update pricing to match the website, and create a more visual workspace demo.

---

## Changes Summary

| Change | Description |
|--------|-------------|
| Light Mode | Convert all slides from dark gradients to light, professional backgrounds |
| Solution Comparison | Add 3 competitor boxes: Private Developers, N8N, Motion |
| Elixa Reveal | Add "Made by private developers" box + specific AI employee roles |
| Visual Workspace | Replace box-based product slide with actual workspace mockup |
| Remove Architecture | Delete ArchitectureSlide completely |
| Correct Pricing | Update to Starter £4.99, Pro £14.99, Unlimited £29.99 + credits/storage |
| Reorder Slides | Move Traction before GTM ("How We'll Win") |
| Shopify Deep Dive | Add detailed customer segment slide after Market |
| Remove Profitability | Update Revenue slide heading |

---

## Slide Order (New)

```text
1.  Title
2.  Problem
3.  Solution Intro (with competitor comparison)
4.  Our Solution (enhanced with roles)
5.  Product (visual workspace demo)
6.  Market Size
7.  Shopify Deep Dive (NEW)
8.  Traction (MOVED UP)
9.  Competition
10. Pricing (updated)
11. Revenue (remove profitability mention)
12. GTM (Path to Win)
13. Team & Ask
```

Total: 13 slides (same count, Architecture removed, Shopify added)

---

## Technical Implementation

### 1. Light Mode Theme

**Files affected:**
- `src/index.css` - Add `.pitch-deck-light` theme variables
- `src/pages/PitchDeck.tsx` - Remove `dark` class, add light mode class
- All 13 slide components - Update background gradients and text colors

**Light mode color palette:**
- Background: Clean whites and soft grays (hsl(220, 20%, 98%))
- Text: Dark navy/charcoal (hsl(220, 15%, 15%))
- Accent colors: Same primary blue, but on light backgrounds
- Cards: White with subtle shadows instead of dark glass

### 2. Solution Intro Slide Update

**File:** `src/components/pitch-deck/slides/SolutionIntroSlide.tsx`

Add 3 competitor comparison boxes below "But where are they?":

```text
+------------------+  +------------------+  +------------------+
| Private          |  | N8N              |  | Motion           |
| Developers       |  |                  |  |                  |
|                  |  |                  |  |                  |
| £500+            |  | £24/month        |  | £35/month        |
| "Expensive"      |  | "DIY solution"   |  | "Not very smart" |
+------------------+  +------------------+  +------------------+
```

### 3. Our Solution Slide Enhancement

**File:** `src/components/pitch-deck/slides/OurSolutionSlide.tsx`

Changes:
- Add third box: "Made by private developers"
- Update Talent Pool description with specific roles:
  - Bookkeeper
  - Google PPC Marketer
  - SEO Analyst
  - Customer Support Agent
  - Tax & Audit Supervisor

Layout becomes 3-column grid with:
1. Made by Private Developers
2. Talent Pool (with role examples)
3. Unified Workspace

### 4. Visual Workspace Demo

**File:** `src/components/pitch-deck/slides/ProductSlide.tsx`

Replace abstract boxes with:
- Full-width workspace mockup/screenshot area
- Floating feature callouts overlaid on the visual
- Show actual chat interface, sidebar, connected tools
- "See it in action" CTA remains

### 5. Remove Architecture Slide

**Files affected:**
- Delete: `src/components/pitch-deck/slides/ArchitectureSlide.tsx`
- Update: `src/pages/PitchDeck.tsx` - Remove import and component
- Update: `src/components/pitch-deck/SlideProgressIndicator.tsx` - Update labels

### 6. Create Shopify Deep Dive Slide

**New file:** `src/components/pitch-deck/slides/ShopifyDeepDiveSlide.tsx`

Content:
- Headline: "Let's Zoom In: Shopify Merchants"
- Key metrics with animated counters:
  - 5.5M merchants globally
  - $120/month average app spend
  - 64% are small businesses
  - $7.9B total addressable within Shopify alone
- Visual showing merchant pain points
- Position after Market slide, before Traction

### 7. Update Pricing Slide

**File:** `src/components/pitch-deck/slides/PricingSlide.tsx`

Update pricing to match website:

| Plan | Price | Key Features |
|------|-------|--------------|
| Trial | £0 | 100 credits, 2 connectors, 14 days |
| Starter | £4.99/mo | 1,000 credits, unlimited connectors |
| Pro | £14.99/mo | 5,000 credits, GPT & Gemini Pro |
| Unlimited | £29.99/mo | Unlimited credits, premium models |

Add "Additional Costs" section below pricing cards:

```text
+------------------------+  +------------------------+
| Storage                |  | Credits                |
| TBC                    |  | 6p per credit          |
| Additional storage     |  | Top up anytime for     |
| pricing coming soon    |  | extra AI interactions  |
+------------------------+  +------------------------+
```

### 8. Reorder Slides & Update Revenue

**File:** `src/pages/PitchDeck.tsx`

New order:
```tsx
<TitleSlide />
<ProblemSlide />
<SolutionIntroSlide />
<OurSolutionSlide />
<ProductSlide />
<MarketSlide />
<ShopifyDeepDiveSlide />  {/* NEW */}
<TractionSlide />         {/* MOVED UP */}
<CompetitionSlide />
<PricingSlide />
<RevenueSlide />
<GTMSlide />              {/* Now after Traction */}
<TeamAskSlide />
```

**File:** `src/components/pitch-deck/slides/RevenueSlide.tsx`
- Change heading from "Path to Profitability" to "Revenue Model" or "Business Model"

### 9. Update Progress Indicator

**File:** `src/components/pitch-deck/SlideProgressIndicator.tsx`

New labels:
```typescript
const slideLabels = [
  "Title",
  "Problem",
  "Solution Intro",
  "Our Solution",
  "Product",
  "Market",
  "Shopify Focus",
  "Traction",
  "Competition",
  "Pricing",
  "Revenue",
  "GTM",
  "Team & Ask",
];
```

---

## Light Mode Style Guide

### Background Gradients (per slide)

| Slide | Light Mode Background |
|-------|----------------------|
| Title | White to soft blue gradient |
| Problem | Soft warm gray with subtle orange accent |
| Solution Intro | Light gray to white |
| Our Solution | White with blue accent glow |
| Product | Light gray with grid pattern |
| Market | White with teal accent |
| Shopify | White with green (Shopify brand) accent |
| Traction | Light with teal gradient |
| Competition | Clean white |
| Pricing | Soft gray to white |
| Revenue | White with green accent |
| GTM | Light purple tint |
| Team & Ask | Gradient to primary blue |

### Text Colors
- Headlines: `text-slate-900` or `text-gray-900`
- Body text: `text-slate-600` or `text-gray-600`
- Muted: `text-slate-400`
- Accent text: Keep existing primary/purple/teal colors

### Card Styling
- Background: `bg-white`
- Border: `border border-slate-200`
- Shadow: `shadow-lg shadow-slate-200/50`

---

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/PitchDeck.tsx` | Update slide order, remove Architecture import |
| `src/index.css` | Add light mode pitch deck styles |
| `src/components/pitch-deck/SlideProgressIndicator.tsx` | Update slide labels |
| `src/components/pitch-deck/slides/TitleSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/ProblemSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/SolutionIntroSlide.tsx` | Light mode + add competitor boxes |
| `src/components/pitch-deck/slides/OurSolutionSlide.tsx` | Light mode + 3-column with roles |
| `src/components/pitch-deck/slides/ProductSlide.tsx` | Light mode + visual workspace |
| `src/components/pitch-deck/slides/MarketSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/ShopifyDeepDiveSlide.tsx` | **CREATE NEW** |
| `src/components/pitch-deck/slides/TractionSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/CompetitionSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/PricingSlide.tsx` | Light mode + update prices + add costs |
| `src/components/pitch-deck/slides/RevenueSlide.tsx` | Light mode + remove profitability |
| `src/components/pitch-deck/slides/GTMSlide.tsx` | Light mode conversion |
| `src/components/pitch-deck/slides/TeamAskSlide.tsx` | Light mode conversion |

---

## Landscape Improvements

For better landscape viewing:
- Increase horizontal padding on all slides
- Use more horizontal layouts (side-by-side) instead of stacked
- Ensure content doesn't feel cramped
- Use `max-w-7xl` instead of `max-w-6xl` on wider slides
- Add `lg:flex-row` patterns where content is currently stacked

---

## Visual Workspace Mockup

For the Product slide, will create a stylized representation showing:
- Left sidebar with navigation icons
- Chat area with sample AI conversation
- Connected tools badges floating around
- This can be achieved with CSS/Tailwind styling to represent the UI

