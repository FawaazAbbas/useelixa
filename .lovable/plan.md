
# Fix: Pitch Deck Slides Not Loading Properly (Faded/Overlapping)

## Problem Analysis

After analyzing the pitch deck using browser screenshots and code inspection, I identified the following issues:

### Root Cause
The wrapper `div.relative` elements around each slide in `PitchDeck.tsx` do not have explicit height constraints. This causes:

1. **Slides collapsing**: Without `min-height: 100vh`, slides can collapse to their content height rather than taking the full viewport
2. **Multiple slides visible**: When slides collapse, multiple slides become visible simultaneously, creating the "overlapping" effect
3. **Scroll-snap breaking**: The scroll-snap behavior requires each slide container to be exactly one viewport height to work properly

### Visual Evidence
- Slide number shows "02/13" but content from multiple slides is visible
- Elements appear at ~20-30% opacity (likely seeing through to slides behind)
- The Catch-22 flow and KPI cards from different slides are visible simultaneously

---

## Solution

### Changes to `src/pages/PitchDeck.tsx`

Add `min-h-screen` class to all wrapper divs:

```text
Current:
<div className="relative">
  <SlideNumber number={1} total={TOTAL_SLIDES} />
  <TitleSlide />
</div>

Fixed:
<div className="relative min-h-screen">
  <SlideNumber number={1} total={TOTAL_SLIDES} />
  <TitleSlide />
</div>
```

This ensures each slide wrapper takes exactly 100vh (full viewport height), which:
- Prevents slides from collapsing
- Ensures only one slide is visible at a time
- Allows scroll-snap to work correctly
- Positions the absolute SlideNumber correctly within each slide's bounds

---

## Technical Implementation

| File | Change |
|------|--------|
| `src/pages/PitchDeck.tsx` | Add `min-h-screen` to all 13 wrapper `div.relative` elements |

This is a single-file fix affecting lines 57-108, adding the same class to each of the 13 slide wrappers.

---

## Expected Result

After this fix:
- Each slide will occupy exactly 100vh (one full viewport)
- Only one slide will be visible at a time
- Scroll-snap will work correctly, snapping to each slide
- All content will appear at full opacity (no more "faded" look)
- Keyboard navigation (Arrow keys, PageDown/Up) will work smoothly

