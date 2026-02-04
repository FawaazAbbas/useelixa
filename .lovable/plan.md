

# Pitch Deck Layout Redesign: 12-Column Grid System

## Overview

This plan restructures all pitch deck slides to match the PDF wireframes using a consistent 12-column grid layout system with standardized spacing, typography, and card tokens. The redesign adds a new Contact slide (Slide 13) and updates the total slide count.

---

## Phase 1: Create Reusable Slide Shell Component

### New Component: `SlideShell.tsx`

A wrapper component that enforces the 16:9 design system:

| Property | Value | Implementation |
|----------|-------|----------------|
| Canvas | 16:9 (1920x1080) | `aspect-video` or min-height calc |
| Outer Padding | Top 72px, Bottom 72px, Left 96px, Right 96px | `pt-[72px] pb-[72px] px-[96px]` |
| Inner Grid | 12 columns | CSS Grid with `grid-cols-12` |
| Column Gap | 24px | `gap-6` |
| Max Width | 1728px (1920 - 2x96) | `max-w-[1728px]` |
| Safe Area | No content above y=72 | Enforced by outer padding |

### Design Tokens (CSS Variables)

Add to `index.css`:
- Card: `rounded-3xl p-8 border border-slate-200 shadow-sm` (radius 24px, padding 32px)
- Typography: H1 (64-72px), H2 (44-52px), Body (20-24px), Label (14-16px)
- Spacing: multiples of 8px

---

## Phase 2: Slide-by-Slide Restructure

### Slide 1 - Cover

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
|                                                                  |
|                     Logo/Wordmark (cols 4-9)                     |
|                     Tagline (cols 3-10)                          |
|                     Subtitle pill (cols 5-8)                     |
|                                                                  |
|                     Footer line (bottom)                         |
+------------------------------------------------------------------+
```

**Changes:**
- Center all elements using grid column spans
- Logo: `col-span-6 col-start-4` (cols 4-9)
- Tagline: `col-span-8 col-start-3` (cols 3-10)
- Pill: `col-span-4 col-start-5` (cols 5-8)
- Add footer: website/email at bottom
- Remove scroll indicator animation

---

### Slide 2 - Problem

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-8)                                                    |
| Role pills row (cols 1-8)                                        |
|------------------------------------------------------------------|
| Left narrative (cols 1-7)    | Right paragraph card (cols 8-12) |
|------------------------------------------------------------------|
| KPI 1 (cols 1-4)  |  KPI 2 (cols 5-8)  |  KPI 3 (cols 9-12)     |
|------------------------------------------------------------------|
| Catch-22 flow card (full-width, cols 1-12)                       |
+------------------------------------------------------------------+
```

**Changes:**
- Restructure header: label left-aligned (cols 1-4), H1 spans (cols 1-8)
- Pills row below H1 (cols 1-8)
- Split body: narrative left (cols 1-7), paragraph card right (cols 8-12)
- KPI cards: 3 equal cards spanning 4 columns each
- Catch-22: full-width card (cols 1-12)

---

### Slide 3 - Existing Options Fail

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-10)                                                   |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| Card A (cols 1-4) | Card B (cols 5-8) | Card C (cols 9-12)      |
|------------------------------------------------------------------|
| Punchline/What-if card (cols 2-11, centered)                     |
+------------------------------------------------------------------+
```

**Changes:**
- Header with label, H1, subcopy stacked left
- 3 comparison cards in equal 4-column widths
- Centered punchline card spanning cols 2-11

---

### Slide 4 - Solution Pillars

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-9)                                                    |
| Intro line (cols 1-10)                                           |
|------------------------------------------------------------------|
| Pillar 1 (cols 1-4) | Pillar 2 (cols 5-8) | Pillar 3 (cols 9-12)|
|------------------------------------------------------------------|
| Bottom value bar strip (cols 1-12)                               |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned with label, H1, intro
- Remove marketplace description card (merge into intro line)
- 3 pillar cards in equal 4-column layout
- Bottom strip: "think, remember, execute" tagline

---

### Slide 5 - Product

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-10)                                                   |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| Hero screenshot frame (cols 1-12, full-width)                    |
|------------------------------------------------------------------|
| Footer text (cols 1-8)        | CTA button (cols 9-12)          |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned
- Full-width screenshot container (cols 1-12)
- Footer row: text left, CTA button right

---

### Slide 6 - Market Size

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-8)                                                    |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| TAM/SAM/SOM graphic (cols 1-6) | TAM card  (cols 7-12)          |
|                                 | SAM card  (cols 7-12)          |
|                                 | SOM card  (cols 7-12)          |
|------------------------------------------------------------------|
| Benchmark strip (cols 1-12) with 4 KPI mini-tiles               |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned
- Split layout: rings left (cols 1-6), stacked cards right (cols 7-12)
- Bottom strip with 4 evenly-spaced KPI tiles
- Remove inline labels from rings (move to cards)

---

### Slide 7 - Shopify First

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-10)                                                   |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| KPI1 (1-3) | KPI2 (4-6) | KPI3 (7-9) | KPI4 (10-12)            |
|------------------------------------------------------------------|
| Rationale card (cols 1-12)                                       |
|------------------------------------------------------------------|
| Bottom banner strip (cols 1-12)                                  |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned
- 4 KPI tiles in 3-column widths each
- Full-width rationale card
- Bold bottom banner statement

---

### Slide 8 - Pricing

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-8)                                                    |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| Plan1 (1-3) | Plan2 (4-6) | Plan3 (7-9) | Plan4 (10-12)        |
|                             (highlighted)                        |
|------------------------------------------------------------------|
| Add-on1 (cols 1-4) | Add-on2 (cols 5-8) | Add-on3 (cols 9-12)  |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned
- 4 pricing cards in 3-column widths
- Plan3 highlighted with stronger border/fill
- 3 add-on cards in 4-column widths

---

### Slide 9 - Go-to-Market

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-8)                                                    |
| Subcopy (cols 1-10)                                              |
|------------------------------------------------------------------|
| Card1 (1-3) | Card2 (4-6) | Card3 (7-9) | Card4 (10-12)        |
| Card5 (1-3) | Card6 (4-6) | Card7 (7-9) | Card8 (10-12)        |
|------------------------------------------------------------------|
| Bottom callout strip (cols 1-12)                                 |
+------------------------------------------------------------------+
```

**Changes:**
- Header left-aligned
- 2x4 grid of channel cards (8 total, 3 columns each)
- Each card: Icon, Title, max 2 lines body
- Bottom callout strip

---

### Slide 10 - Journey + Roadmap

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-9)                                                    |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| Story card (cols 1-7)        | Roadmap timeline (cols 8-12)     |
| Traction card (cols 1-7)     |                                   |
| Quote card (cols 1-7)        |                                   |
+------------------------------------------------------------------+
```

**Changes:**
- 60/40 split: narrative left (cols 1-7), timeline right (cols 8-12)
- Left: 3 stacked cards (story, traction, quote)
- Right: single tall vertical timeline card

---

### Slide 11 - Competition

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| Section label (cols 1-4)                                         |
| H1 (cols 1-8)                                                    |
| Subcopy (cols 1-9)                                               |
|------------------------------------------------------------------|
| Claim card 1 (cols 1-6)      | Positioning matrix (cols 7-12)   |
| Claim card 2 (cols 1-6)      |                                   |
| Claim card 3 (cols 1-6)      |                                   |
+------------------------------------------------------------------+
```

**Changes:**
- 50/50 split: claims left (cols 1-6), matrix right (cols 7-12)
- 3 equal-height claim cards stacked vertically
- Matrix with axis labels INSIDE the container
- Currently implemented - minor grid adjustments needed

---

### Slide 12 - Close + Raise

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
| H1 (cols 1-9)                                                    |
| Mission subcopy (cols 1-9)                                       |
|------------------------------------------------------------------|
| Founder story card (cols 1-6) | Raise card (cols 7-12)          |
| Founder profile (cols 1-6)    | Use-of-funds card (cols 7-12)   |
|------------------------------------------------------------------|
| Optional vision strip (cols 1-12)                                |
+------------------------------------------------------------------+
```

**Changes:**
- Remove "Join Us" label, simplify header
- Left column: founder story + profile cards (cols 1-6)
- Right column: raise + use-of-funds cards (cols 7-12)
- Optional bottom vision strip
- Remove mascot

---

### Slide 13 - Contact (NEW)

**Wireframe Layout:**
```text
+------------------------------------------------------------------+
|                                                                  |
|                    "Contact" H1 (cols 1-8)                       |
|                                                                  |
|            Contact card (cols 4-9, centered)                     |
|              - Email                                             |
|              - Website                                           |
|              - QR code to waitlist/demo                          |
|                                                                  |
|            Footer strip (cols 1-12)                              |
|              - Small logo / Thank you                            |
+------------------------------------------------------------------+
```

**Implementation:**
- Create new `ContactSlide.tsx` component
- Centered H1 heading
- Centered contact card with email, site, optional QR
- Footer strip with logo and thank you message

---

## Phase 3: Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/pitch-deck/SlideShell.tsx` | Reusable wrapper with 12-column grid |
| `src/components/pitch-deck/slides/ContactSlide.tsx` | New Contact slide |

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add pitch deck design tokens |
| `src/pages/PitchDeck.tsx` | Update TOTAL_SLIDES to 13, add ContactSlide |
| `src/components/pitch-deck/SlideNumber.tsx` | Update default total to 13 |
| All 12 existing slide files | Restructure to use SlideShell and 12-column grid |

### CSS Token Additions (index.css)

```css
/* Pitch Deck Design Tokens */
.pitch-card {
  @apply rounded-3xl p-8 border border-slate-200 shadow-sm bg-white;
}

.pitch-h1 {
  @apply text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900;
}

.pitch-h2 {
  @apply text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900;
}

.pitch-body {
  @apply text-xl md:text-2xl text-slate-600 leading-relaxed;
}

.pitch-label {
  @apply text-sm uppercase tracking-widest font-semibold;
}

.pitch-grid {
  @apply grid grid-cols-12 gap-6;
}
```

### SlideShell Component Structure

```tsx
interface SlideShellProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "gradient";
}

export const SlideShell = ({ children, className, background = "white" }: SlideShellProps) => {
  return (
    <section className={cn(
      "pitch-slide",
      "min-h-screen w-full relative overflow-hidden",
      className
    )}>
      {/* Background */}
      <div className={cn(
        "absolute inset-0",
        background === "white" ? "bg-white" : "bg-gradient-to-br from-white via-slate-50 to-white"
      )} />
      
      {/* Content container with safe area padding */}
      <div className="relative z-10 w-full h-full pt-[72px] pb-[72px] px-6 md:px-12 lg:px-24">
        <div className="max-w-[1728px] mx-auto h-full">
          <div className="grid grid-cols-12 gap-6 h-full">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};
```

---

## Implementation Order

1. **Create SlideShell.tsx** - Base component for all slides
2. **Update index.css** - Add design token classes
3. **Update SlideNumber.tsx** - Change default total to 13
4. **Create ContactSlide.tsx** - New slide 13
5. **Refactor slides in order**:
   - TitleSlide (Slide 1) - simplest, good test of shell
   - ProblemSlide (Slide 2)
   - SolutionIntroSlide (Slide 3)
   - OurSolutionSlide (Slide 4)
   - ProductSlide (Slide 5)
   - MarketSlide (Slide 6)
   - ShopifyDeepDiveSlide (Slide 7)
   - PricingSlide (Slide 8)
   - GTMSlide (Slide 9)
   - TractionRoadmapSlide (Slide 10)
   - CompetitionSlide (Slide 11)
   - TeamAskSlide (Slide 12)
6. **Update PitchDeck.tsx** - Add ContactSlide, update total

---

## Key Design Principles

1. **Consistency**: All slides use SlideShell wrapper with identical padding and grid
2. **Safe Area**: No content above y=72px to prevent cropping
3. **Card Uniformity**: Single card style (radius 24, padding 32, border 1px, subtle shadow)
4. **Typography Scale**: H1 (64-72), H2 (44-52), Body (20-24), Label (14-16)
5. **Spacing Rhythm**: All spacing in multiples of 8px
6. **Grid Alignment**: Content aligned to 12-column grid with 24px gaps
7. **Animations**: Keep existing `animate="visible"` for immediate load, no scroll-triggered animations

