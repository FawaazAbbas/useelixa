

# Pitch Deck Fixes - 7 Issues

## Overview

This plan addresses 7 specific issues with the pitch deck:

1. **Problem Slide (Slide 2)** - Replace weak stats below avg salary
2. **Solution Intro Slide (Slide 3)** - Motion logo not showing
3. **Our Solution Slide (Slide 4)** - Poor design, needs improvement
4. **Traction Slide** - Only shows 10k, needs more meaningful numbers
5. **Competition Slide** - Positioning matrix axes wrong and bubble placement needs fixing
6. **Timeline Slide** - Layout needs improvement
7. **Sidebar Navigation** - Scroll-to-slide not working

---

## Issue 1: Problem Slide - Replace Weak Stats

**File:** `src/components/pitch-deck/slides/ProblemSlide.tsx`

**Current State:**
```
- £39,039 Avg UK salary
- +£5,106 Employer tax cost  
- 120hrs Lost to admin yearly  ← weak
```

**Problem:** The two stats below avg salary (employer tax and 120hrs) don't strongly communicate the pain point. They feel disconnected.

**Fix:** Replace with more impactful, relatable pain points:

```
- £39,039 - What hiring ONE employee costs
- 24 days/year - Time lost on financial admin alone
- 10-30% - Software budget wasted on unused tools
```

These stats are more emotionally resonant and directly tie to the solopreneur's pain.

---

## Issue 2: Motion Logo Missing

**File:** `src/components/pitch-deck/slides/SolutionIntroSlide.tsx`

**Current State:**
The Motion logo URL is set to:
```javascript
logo: "https://assets.usemotion.com/website-assets-v2/logo/motion-logo.svg"
```

**Problem:** This external SVG URL may be blocked by CORS or the path may have changed.

**Fix:** Use a reliable fallback approach:
- First try the external URL
- If it fails, show the Motion name with styled text as fallback
- Or use a generic icon with "Motion" text label

Better approach: Use a local logo if available or create a styled text representation:
```jsx
<div className="h-12 flex items-center justify-center">
  <span className="text-2xl font-bold text-slate-700">Motion</span>
</div>
```

---

## Issue 3: Our Solution Slide - Design Issues

**File:** `src/components/pitch-deck/slides/OurSolutionSlide.tsx`

**Current Problems:**
1. The mascot and logo feel cramped together
2. The 3-column layout cards are too dense
3. Visual hierarchy is weak

**Fixes:**
1. Increase spacing between logo and mascot
2. Make the header section larger and more prominent
3. Add subtle visual polish to the cards (gradients, icons with better colors)
4. Improve the role badges layout
5. Add a subtle decorative element

**Updated Layout:**
```
+--------------------------------------------------+
|                                                   |
|    [ELIXA LOGO - larger]    [MASCOT - larger]    |
|                                                   |
|    AI Employee Talent Pool + Workspace           |
|    "Think Slack + App Store"                     |
|                                                   |
+--------------------------------------------------+
|                                                   |
|   [Card 1]        [Card 2]        [Card 3]       |
|   Made by         Role-Specific   Unified        |
|   Experts         AI Employees    Workspace      |
|                                                   |
+--------------------------------------------------+
```

---

## Issue 4: Traction Slide - Only 10k

**File:** `src/components/pitch-deck/slides/TractionSlide.tsx`

**Current State:** Only shows "10,000 projected signups"

**Problem:** One number isn't compelling enough. Need supporting metrics.

**Fix:** Add milestone cards showing progress:

| Milestone | Status |
|-----------|--------|
| MVP Live | Jan 2025 - Done |
| Beta Users | 500+ - Done |
| Projected Signups | 10,000 |
| Target Date | Feb 2025 |

This shows both achieved milestones and projections.

---

## Issue 5: Competition Slide - Positioning Matrix

**File:** `src/components/pitch-deck/slides/CompetitionSlide.tsx`

**Current Axes:**
- Vertical: "Smart" (top) to "Basic" (bottom) - CORRECT
- Horizontal: "Simple" (left) to "Integrated" (right) - NEEDS CHANGE

**User Request:** 
- Y-axis: Smart to Basic (top to bottom) - keep
- X-axis: Change from "Simple/Integrated" to "Cheap/Expensive"

**Bubble Positioning Issues:**
Current positioning doesn't make intuitive sense. Need to recalculate positions based on new axes.

**New Positions (Cheap to Expensive, Smart to Basic):**

| Competitor | X (Cheap→Expensive) | Y (Smart→Basic) |
|------------|---------------------|-----------------|
| ChatGPT | 30% | 85% | (Cheap, Very Smart)
| N8N | 25% | 35% | (Very Cheap, Medium)
| Motion | 35% | 30% | (Cheap-ish, Medium-Basic)
| Lindy | 75% | 80% | (Expensive, Smart)
| Salesforce | 95% | 60% | (Very Expensive, Medium-Smart)
| Elixa | 25% | 80% | (Cheap, Smart) - Sweet spot

---

## Issue 6: Timeline Slide Layout

**File:** `src/components/pitch-deck/slides/RevenueSlide.tsx`

**Current Problems:**
- Timeline milestones cramped on mobile
- Visual flow not clear
- ARR projections not prominent

**Fixes:**
1. Horizontal timeline with clearer connections
2. Larger milestone icons
3. Better visual distinction between completed and future items
4. ARR projection badges more prominent
5. Improve grid layout for 6 milestones

---

## Issue 7: Sidebar Navigation Not Working

**File:** `src/components/pitch-deck/SlideProgressIndicator.tsx`

**Current Implementation:**
```javascript
const scrollToSlide = (index: number) => {
  const slides = document.querySelectorAll<HTMLElement>(".pitch-deck-wrapper section");
  const targetSection = slides[index];

  if (targetSection) {
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }
  // Fallback to window scroll
};
```

**Potential Issues:**
1. The selector `.pitch-deck-wrapper section` may not be finding sections correctly
2. `scrollIntoView` with scroll-snap can behave unpredictably
3. The scroll container might be the wrapper, not the window

**Fix:** Change to use direct scroll calculation and scroll the correct container:

```javascript
const scrollToSlide = (index: number) => {
  const wrapper = document.querySelector('.pitch-deck-wrapper');
  const slideHeight = window.innerHeight;
  
  if (wrapper) {
    wrapper.scrollTo({
      top: index * slideHeight,
      behavior: 'smooth'
    });
  } else {
    window.scrollTo({
      top: index * slideHeight,
      behavior: 'smooth'
    });
  }
};
```

Also need to check if `pitch-deck-wrapper` has the scroll container or if it's the window.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/pitch-deck/slides/ProblemSlide.tsx` | Replace stats with more impactful ones |
| `src/components/pitch-deck/slides/SolutionIntroSlide.tsx` | Fix Motion logo display |
| `src/components/pitch-deck/slides/OurSolutionSlide.tsx` | Improve design and spacing |
| `src/components/pitch-deck/slides/TractionSlide.tsx` | Add milestone cards |
| `src/components/pitch-deck/slides/CompetitionSlide.tsx` | Fix axes (Cheap/Expensive) and bubble positions |
| `src/components/pitch-deck/slides/RevenueSlide.tsx` | Improve timeline layout |
| `src/components/pitch-deck/SlideProgressIndicator.tsx` | Fix scroll-to-slide functionality |

---

## Technical Notes

- All changes maintain the light mode theme
- Framer Motion animations preserved
- Responsive layouts maintained
- Motion logo fallback handles CORS issues

