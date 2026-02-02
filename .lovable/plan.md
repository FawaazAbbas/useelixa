

# Redesign: Three Pitch Deck Slides

## Overview

This plan covers the redesign of three slides to improve narrative storytelling and visual balance:
1. **Slide 1 (TitleSlide)** — Simplify for maximum impact
2. **Slide 9 (GTMSlide)** — Replace with 8 new GTM strategies
3. **Slide 11 (CompetitionSlide)** — Narrative left + quadrant right layout

---

## Slide 1: TitleSlide — Simplification

### Current Issues
- Too many elements competing for attention (logo, tagline, value prop, badge, mascot, scroll indicator)
- Value proposition paragraph is wordy
- Mascot takes up significant space

### New Design

A clean, minimal title slide with just the essentials:

```text
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|                          ELIXA                                   |
|                                                                  |
|            AI Employees That Work For You                        |
|                                                                  |
|               Pre-Seed Deck • 2025                               |
|                                                                  |
|                      ↓ Scroll                                    |
|                                                                  |
+------------------------------------------------------------------+
```

### Changes
- **Remove**: Value proposition paragraph, mascot, accent orbs
- **Keep**: Logo, tagline, Pre-Seed badge, scroll indicator
- **Simplify**: Cleaner background, tighter spacing
- **Result**: Immediate brand recognition without distraction

---

## Slide 9: GTMSlide — New Strategies

### Current GTMs (4 strategies)
1. Shopify First
2. Community-Led
3. Content Marketing
4. Strategic Partnerships

### New GTMs (8 strategies)

| Icon | Title | Description |
|------|-------|-------------|
| Users | Social Media Engagement | Growing and converting followers on LinkedIn, Twitter into early adopters |
| Mail | Waitlist Mobilization | Converting waitlist into active users via targeted outreach and referral incentives |
| MessageCircle | Community Engagement | Leverage Reddit, Indie Hackers, and Product Hunt |
| Target | Paid Acquisition | Scale with a 17p cost-per-lead |
| FileText | Content Marketing | SEO-driven guides and valuable SME content |
| Handshake | Strategic Partnerships | Referrals through SME service providers |
| Gift | Promotions & Influencers | Giveaways, influencer campaigns, and events |
| Smartphone | Native Apps | Apps for Shopify, WooCommerce, WordPress, plus mobile and desktop apps |

### New Layout

Replace the 2x2 grid with a **4x2 compact grid** to fit 8 strategies:

```text
+------------------------------------------------------------------+
| GO-TO-MARKET                                                     |
|                                                                  |
| How We'll Reach Them                                             |
|                                                                  |
| "We're building multiple acquisition channels that compound..."  |
|                                                                  |
| ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐|
| │ Social      │  │ Waitlist    │  │ Community   │  │ Paid        │|
| │ Media       │  │ Mobilization│  │ Engagement  │  │ Acquisition │|
| └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘|
| ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐|
| │ Content     │  │ Strategic   │  │ Promotions  │  │ Native      │|
| │ Marketing   │  │ Partnerships│  │ & Influence │  │ Apps        │|
| └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘|
|                                                                  |
| [Insight callout about multi-channel approach]                   |
+------------------------------------------------------------------+
```

### Card Design
- Compact cards with icon + title + one-sentence description
- 4 columns on desktop, 2 columns on mobile
- Remove the "story" badges to fit more content
- Keep consistent styling with other slides

---

## Slide 11: CompetitionSlide — Narrative + Quadrant

### Current Issues
- Cramped with both a positioning matrix AND a feature table
- No clear narrative structure
- Competitors listed don't match user's three categories

### New Design: Two-Column Layout

```text
+------------------------------------------------------------------+
| COMPETITION                                                      |
|                                                                  |
| Why We Win                                                       |
|                                                                  |
| ┌────────────────────────┐  ┌─────────────────────────────────┐  |
| │                        │  │                                 │  |
| │  MARKETPLACE           │  │          CAPABILITY             │  |
| │  (Agent.ai)            │  │     Basic ─────────── Advanced  │  |
| │  "They help you find   │  │            │                    │  |
| │   agents; we ensure    │  │  Affordable│   ★ELIXA           │  |
| │   they persist in      │  │            │                    │  |
| │   context."            │  │     COST   ├─────────────────   │  |
| │                        │  │            │         Sintra     │  |
| │  WORKFLOW AUTOMATION   │  │            │         Lindy      │  |
| │  (n8n, Make)           │  │  Expensive │                    │  |
| │  "They make you build  │  │            │                    │  |
| │   workflows; we        │  │      n8n   │   Motion           │  |
| │   provide ready AI     │  │            │                    │  |
| │   employees."          │  │                                 │  |
| │                        │  └─────────────────────────────────┘  |
| │  IN-HOUSE AI           │                                       |
| │  (Motion, Sintra)      │  "Elixa: Specialist AI employees     |
| │  "They are broad;      │   with context, affordable for       |
| │   we are role-         │   SMEs."                             |
| │   specific."           │                                       |
| │                        │                                       |
| └────────────────────────┘                                       |
+------------------------------------------------------------------+
```

### Left Column: Three Competitor Categories
Each section with:
- **Header** (bold, with competitor examples in parentheses)
- **One differentiating sentence** in quotes

| Category | Header | Differentiator |
|----------|--------|----------------|
| 1 | Marketplace (Agent.ai) | "They help you find agents; we ensure they persist in context." |
| 2 | Workflow Automation (n8n, Make) | "They make you build workflows; we provide ready AI employees." |
| 3 | In-House AI (Motion, Sintra) | "They are broad; we are role-specific." |

### Right Column: 2x2 Quadrant
- **Axes**: "Capability" (Basic to Advanced) and "Cost" (Affordable to Expensive)
- **Elixa position**: Advanced + Affordable quadrant (highlighted with star)
- **Competitors plotted**:
  - n8n: Basic + Affordable
  - Motion: Basic + Expensive
  - Sintra: Advanced + Expensive
  - Lindy: Advanced + Expensive

### Below Quadrant
A single summary line: **"Elixa: Specialist AI employees with context, affordable for SMEs."**

### Removal
- Remove the feature comparison table (too busy)
- Remove the insight callout box (summary line replaces it)

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `TitleSlide.tsx` | Remove mascot, value proposition paragraph, and accent orbs. Keep logo, tagline, badge, scroll indicator. |
| `GTMSlide.tsx` | Replace 4 strategies with 8 new ones. Change grid from 2x2 to 4x2. Update narrative paragraph. |
| `CompetitionSlide.tsx` | Complete restructure: left narrative column with 3 categories, right 2x2 quadrant, remove feature table. |

### Component Updates

**TitleSlide.tsx**
- Remove `ElixaMascot` import and component
- Remove value proposition `<p>` block
- Remove accent orb divs
- Reduce vertical spacing

**GTMSlide.tsx**
- New `strategies` array with 8 items
- Icons: `Users`, `Mail`, `MessageCircle`, `Target`, `FileText`, `Handshake`, `Gift`, `Smartphone`
- Grid: `md:grid-cols-2 lg:grid-cols-4`
- Smaller card padding for compact fit
- Updated narrative paragraph
- Remove Shopify-specific insight box

**CompetitionSlide.tsx**
- New `competitorCategories` array with 3 narrative sections
- Simplified `quadrantData` with only 4-5 competitors
- Remove `competitors` table array
- Grid: `lg:grid-cols-2` with narrative left, quadrant right
- Summary text below quadrant
- Remove feature table component entirely

---

## Visual Consistency

All three slides will maintain the deck's design language:
- Light gradient backgrounds
- White cards with `border-slate-200 rounded-2xl shadow-lg`
- Colored uppercase tracking-widest labels
- Consistent typography scale
- framer-motion animations (`fadeInUp`, `scaleIn`, `staggerContainer`)

