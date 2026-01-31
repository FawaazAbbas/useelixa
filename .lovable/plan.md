

# Combine Traction & Roadmap Slides + Reorder Pricing

## Overview

We'll merge "Where We Are Today" (TractionSlide) and "Our Path to 10k Users" (RevenueSlide) into a single powerful slide that tells the complete story of current momentum AND future trajectory. We'll also move the Pricing slide to position 8.

---

## New Slide Order (Reduced to 12 Slides)

| Position | Component | Title |
|----------|-----------|-------|
| 1-7 | (unchanged) | Title through Shopify Deep Dive |
| **8** | PricingSlide | Accessible for Every Business |
| **9** | GTMSlide | Go-To-Market Strategy |
| **10** | **NEW: TractionRoadmapSlide** | Traction & Roadmap (combined) |
| 11 | CompetitionSlide | Competition |
| 12 | TeamAskSlide | Team & Ask |

**Total slides reduced from 13 to 12**

---

## Combined Slide Design: "Traction & Roadmap"

### Visual Concept
A two-panel design that flows naturally from "where we are" to "where we're going":

```text
+------------------------------------------------------------------+
|                    TRACTION & ROADMAP                            |
|          From Early Momentum to Market Leadership                |
|                                                                  |
|  ┌─────────────────────────────────────────────────────────────┐ |
|  │                     WHERE WE ARE                            │ |
|  │  ┌─────────┐   ┌─────────┐   ┌─────────┐                   │ |
|  │  │  3.5K+  │   │  50%    │   │   Mar   │                   │ |
|  │  │Signups  │   │MVP Done │   │ Launch  │                   │ |
|  │  └─────────┘   └─────────┘   └─────────┘                   │ |
|  │                                                             │ |
|  │  [===================================...........]  35%→10K  │ |
|  └─────────────────────────────────────────────────────────────┘ |
|                                                                  |
|                           ↓                                      |
|                                                                  |
|  ┌─────────────────────────────────────────────────────────────┐ |
|  │                     WHERE WE'RE GOING                       │ |
|  │                                                             │ |
|  │   Mar         Apr         May         Aug                   │ |
|  │    ●───────────●───────────●───────────●                   │ |
|  │  Launch    Dev Program  AI Employees  10K Users            │ |
|  │            First $      £50k ARR     £250k ARR             │ |
|  └─────────────────────────────────────────────────────────────┘ |
|                                                                  |
|        "Market need and execution are moving in sync."          |
+------------------------------------------------------------------+
```

### Key Elements

**Section 1: Current Traction (Top Half)**
- Three animated stat cards in a row:
  - **3,500+** Waitlist signups
  - **50%** MVP complete
  - **Mar** Launch target
- Horizontal progress bar showing waitlist journey (Dec → 10K target)
- Clean, minimal design with gradient accents

**Section 2: Future Roadmap (Bottom Half)**
- Horizontal timeline with 4 key milestones:
  - **Mar 2025**: Soft Launch - First Revenue
  - **Apr 2025**: Dev Program - Opening marketplace
  - **May 2025**: AI Employees - £50k ARR
  - **Aug 2025**: Scale - 10K Users, £250k ARR
- Each milestone has an icon, date badge, and brief description
- Animated progress line showing completion

**Narrative Callout (Bottom)**
- Styled quote box combining the best of both narratives:
  > "In less than a month, thousands of businesses have raised their hands for Elixa. With each milestone building on the last, we're moving from MVP to market leadership with proven product-market fit."

---

## Files to Modify/Create

| Action | File | Description |
|--------|------|-------------|
| **Create** | `TractionRoadmapSlide.tsx` | New combined component |
| **Delete** | `TractionSlide.tsx` | No longer needed |
| **Delete** | `RevenueSlide.tsx` | No longer needed |
| **Update** | `PitchDeck.tsx` | Reorder slides, update total to 12 |

---

## Technical Implementation

### New Component Structure

```text
TractionRoadmapSlide.tsx
├── AnimatedCounter (reused from TractionSlide)
├── Section 1: Current Traction
│   ├── Stat Cards (grid of 3)
│   └── Progress Bar with animated fill
├── Visual Connector (arrow or gradient transition)
├── Section 2: Roadmap Timeline
│   ├── Horizontal timeline line (animated)
│   └── Milestone nodes (4 items)
└── Narrative Callout Box
```

### Visual Differences from Original Slides

1. **Combined flow** - Single slide with clear visual hierarchy
2. **Stat cards** - Replace separate metric displays with unified card grid
3. **Simplified timeline** - Focus on 4 key milestones (Mar, Apr, May, Aug) instead of 6
4. **Unified color scheme** - Teal-to-green gradient representing growth journey
5. **Stronger visual connection** - Arrow or fade between "now" and "future" sections

### Slide Reordering in PitchDeck.tsx

Current order (positions 8-12):
- 8: GTMSlide
- 9: PricingSlide
- 10: TractionSlide
- 11: CompetitionSlide
- 12: RevenueSlide

New order (positions 8-11, total 12 slides):
- 8: **PricingSlide** (moved up)
- 9: GTMSlide
- 10: **TractionRoadmapSlide** (new combined)
- 11: CompetitionSlide
- 12: TeamAskSlide

---

## Content Preservation

All key messages from both slides will be preserved:

**From TractionSlide:**
- 3,500+ waitlist signups
- Dec-Mar development timeline
- "Market need and execution are in sync" narrative
- 5 months to MVP stat

**From RevenueSlide:**
- Mar/May/Aug milestone dates
- Revenue projections (First Revenue → £50k → £250k ARR)
- AI Employees marketplace milestone
- Growth logic about Shopify conversion

