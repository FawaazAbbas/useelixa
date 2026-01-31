

# Enhance Storytelling for Slides 6, 7, and 8

## Overview

We need to embed compelling narrative content into three slides to make them more investor-ready and emotionally engaging. Each slide will have its story text updated while maintaining the visual structure.

---

## Slide 6: Market Opportunity (MarketSlide.tsx)

### Current State
- Generic header: "Significant Growth Opportunity"
- Brief description about AI software and SMB tools market

### New Narrative
Replace the header and description with the compelling story about digital-native SMBs actively transforming their operations:

**New Title:** "A Market That's Already Moving"

**New Story Text:**
> The global wave of digital-native SMBs isn't waiting for tomorrow—they're already investing in tools that make them faster, leaner, and more competitive. With millions of these businesses now spending monthly on SaaS solutions—whether for e-commerce, marketing, or operations—they're actively shaping a market worth tens of billions. The opportunity is immense because these businesses aren't just growing—they're transforming how they operate each day.

### Changes
- Update header from "Significant Growth Opportunity" to "A Market That's Already Moving"
- Replace the generic subtitle with the narrative paragraph
- Ensure the text flows naturally with the TAM/SAM/SOM visual

---

## Slide 7: Shopify Deep Dive (ShopifyDeepDiveSlide.tsx)

### Current State
- Good narrative exists but displayed as plain paragraphs
- Bullet points at the bottom feel disconnected

### Improvements
Keep the existing narrative but restructure the display for better visual hierarchy:

1. **Keep the intro paragraph** about Shopify merchants (5.5M customers, $120/mo, 64% small businesses)

2. **Transform the "Why start here?" section** into a more compelling narrative format:
   - Convert bullet points into a flowing sentence or two with visual emphasis on key benefits
   - Make it feel like a continuation of the story rather than a list

3. **Strengthen the bottom callout** with a more action-oriented message

### Key Changes
- Restructure the "Why start here?" insight box to flow as narrative prose instead of bullet points
- Update the bottom highlight to emphasize the opportunity with stronger language

---

## Slide 8: Traction (TractionSlide.tsx)

### Current State
- Title: "Where We Are Today"
- Generic story about MVP in 6 months
- Static milestone cards
- Big numbers for 10,000 target and £250k ARR

### Major Redesign

Based on the user's requirements, this slide needs significant updates:

**New Title:** "Where We Are Today" (keep this)

**New Visual 1 - Waitlist Progress Bar:**
A dynamic animated progress bar showing waitlist growth:
- From 0 (December) to 10K projected (March)
- Visual representation of demand momentum

**New Visual 2 - Timeline:**
A horizontal development timeline:
- November: MVP Development Starts
- March: Launch Ready
- Visual arrow showing progress

**New Narrative Text:**
> In less than a month, thousands of businesses have raised their hands for Elixa. While demand surges, our MVP—started in November—is racing toward launch in March. Market need and execution are moving in sync.

### Detailed Implementation

1. **Replace the current "Big numbers row"** with:
   - A waitlist progress visualization (animated bar from 0 to 10K)
   - Show "Dec" on left, "March" on right with projected 10K

2. **Add a development timeline** showing:
   - Nov: Started Development
   - Apr: Launch Ready
   - Use a horizontal timeline with nodes

3. **Update milestones array:**
   - Focus on: Waitlist momentum, MVP progress, Launch date
   - Remove the old milestones that don't match the new narrative

4. **Replace the bottom insight box** with the new narrative prose

---

## Files to Modify

| File | Changes |
|------|---------|
| `MarketSlide.tsx` | Update title to "A Market That's Already Moving", replace subtitle with narrative paragraph about digital-native SMBs |
| `ShopifyDeepDiveSlide.tsx` | Restructure the "Why start here?" section to flow as prose, update bottom callout |
| `TractionSlide.tsx` | Add waitlist progress bar, add development timeline, update narrative text, restructure milestones |

---

## Visual Structure

### Slide 8 New Layout

```text
+------------------------------------------------------------------+
|                         TRACTION                                  |
|                    Where We Are Today                            |
|                                                                  |
|  ┌─────────────────────────────────────────────────────────────┐ |
|  │                   WAITLIST MOMENTUM                         │ |
|  │  Dec ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━ March     │ |
|  │   0                      NOW                     10K Target  │ |
|  └─────────────────────────────────────────────────────────────┘ |
|                                                                  |
|  ┌─────────────────────────────────────────────────────────────┐ |
|  │                   MVP DEVELOPMENT                           │ |
|  │  Nov ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● March    │ |
|  │  Started                                       Launch Ready  │ |
|  └─────────────────────────────────────────────────────────────┘ |
|                                                                  |
|        "In less than a month, thousands of businesses have      |
|         raised their hands for Elixa. While demand surges,      |
|         our MVP is racing toward launch. Market need and        |
|         execution are moving in sync."                          |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Technical Notes

### Slide 6 (MarketSlide)
- Lines 66-72: Update title and subtitle text
- Keep the TAM/SAM/SOM visualization unchanged

### Slide 7 (ShopifyDeepDiveSlide)  
- Lines 147-169: Restructure the insight box
- Lines 172-188: Update bottom highlight
- Convert bullet list to narrative prose

### Slide 8 (TractionSlide)
- Lines 31-36: Update milestones to match new timeline
- Lines 77-108: Replace big numbers with waitlist progress bar
- Lines 110-143: Replace milestone cards with timeline visualization
- Lines 145-162: Update narrative text

