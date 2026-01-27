

# Pitch Deck Updates - Visual & Content Enhancement

## Overview
Update multiple slides with enhanced visuals, competitor logos, agent pricing, timeline with ARR projections, and improved market opportunity presentation.

---

## Changes Summary

| Slide | Changes |
|-------|---------|
| Solution Intro | Replace Lucide icons with actual N8N and UseMotion logos; enhance caption prominence |
| Our Solution | Add prominent mascot + Elixa logo header; improve visual hierarchy |
| Market Opportunity | Redesign with richer content, clearer TAM/SAM breakdown, visual callouts |
| Competition (Landscape) | Creative redesign with visual positioning; add Lindy AI as competitor |
| Pricing | Add agent counts (Starter: 2, Pro: 6, Unlimited: 12) + extra agent pricing (£10/mo) |
| Revenue Model | Replace entirely with Timeline + ARR Projections slide |

---

## Detailed Implementation

### 1. Solution Intro Slide (`SolutionIntroSlide.tsx`)

**Current State:**
- Uses Lucide icons (`Code`, `Wrench`, `Sparkles`)
- Captions styled as small italic text

**Changes:**
- Replace N8N's `Wrench` icon with `/logos/n8nLogo.png` (exists in project)
- Replace Motion's `Sparkles` icon with a new UseMotion logo image (will use external URL or add to public folder)
- Make captions larger and bolder with red/orange accent colors to stand out
- Add quotation styling to make the pain point messaging more prominent

```text
Layout:
+------------------+  +------------------+  +------------------+
| [Developer icon] |  | [N8N Logo]       |  | [Motion Logo]    |
| Private Devs     |  | N8N              |  | Motion           |
|                  |  |                  |  |                  |
| £500+            |  | £24/month        |  | £35/month        |
|                  |  |                  |  |                  |
| "EXPENSIVE"      |  | "DIY SOLUTION"   |  | "NOT VERY SMART" |
| (large, bold)    |  | (large, bold)    |  | (large, bold)    |
+------------------+  +------------------+  +------------------+
```

**Caption styling:**
- `text-lg font-bold uppercase tracking-wide`
- Color-coded: Red for expensive, Amber for DIY, Slate for "not smart"
- Add subtle background pill or underline for emphasis

---

### 2. Our Solution Slide (`OurSolutionSlide.tsx`)

**Current State:**
- Mascot hidden in bottom-right corner
- No Elixa logo prominent

**Changes:**
- Add hero section with large Elixa logo + mascot at the top
- Keep the 3-column layout below
- Make mascot larger and centered with logo

```text
New Layout:
+--------------------------------------------------+
|     [ELIXA LOGO]    [MASCOT - celebrating]       |
|     "AI Employee Talent Pool + Workspace"        |
|     "Think Slack + App Store"                    |
+--------------------------------------------------+
|  +------------+  +------------+  +------------+  |
|  | Made by    |  | Role-      |  | Unified    |  |
|  | Private    |  | Specific   |  | Workspace  |  |
|  | Developers |  | AI Roles   |  |            |  |
|  +------------+  +------------+  +------------+  |
+--------------------------------------------------+
```

**Mascot integration:**
- Use `ElixaMascot` with `pose="celebrating"` and `size="xl"`
- Position alongside `ElixaLogo` with gradient styling

---

### 3. Market Opportunity Slide (`MarketSlide.tsx`)

**Current State:**
- Simple concentric circles (TAM/SAM/SOM)
- Minimal context on how numbers are derived

**Changes:**
- Add market breakdown methodology (top-down vs bottom-up)
- Include visual callouts explaining each metric
- Add supporting stats and growth rates
- More visual richness with icons and data cards

```text
New Layout:
+--------------------------------------------------+
|           MARKET OPPORTUNITY                      |
|                                                   |
|  +----------------------------+  +-------------+ |
|  |                            |  | BREAKDOWN   | |
|  |    [TAM Circle - $150B]    |  | Top-Down    | |
|  |    [SAM Circle - $25B]     |  | Analysis    | |
|  |    [SOM Circle - $500M]    |  | SME Focus   | |
|  +----------------------------+  +-------------+ |
|                                                   |
|  +-------+ +-------+ +-------+ +-------+         |
|  | 35%   | | 50M   | | 64%   | | $3.5k |         |
|  | CAGR  | | SMEs  | | UK    | | waste |         |
|  +-------+ +-------+ +-------+ +-------+         |
+--------------------------------------------------+
```

**Content additions:**
- TAM: "Global AI Productivity Tools" - $150B (top-down from analyst reports)
- SAM: "SME AI Tools & Automation" - $25B (businesses <500 employees)
- SOM: "Year 5 Target" - $500M (realistic capture rate)
- Supporting metrics: 35% CAGR, 50M+ SMEs globally, 64% UK businesses are SMEs, $3,500 average SaaS waste

---

### 4. Competition Slide (`CompetitionSlide.tsx`)

**Current State:**
- Basic table with checkmarks
- Missing Lindy AI (close competitor found in research)

**Changes:**
- Redesign as visual positioning map (2x2 matrix or bubble chart)
- Add Lindy AI as competitor (they have workspace + talent pool similar to Elixa)
- Add more columns/dimensions for differentiation
- Make Elixa stand out visually

**New Competitor - Lindy AI:**
- Workspace: Yes
- Integrations: Yes (they claim 3000+)
- AI Talent Pool: Yes (they have AI employee concept)
- However: Credit-based pricing, complex, enterprise-focused

```text
New Layout Option - Positioning Matrix:

                 SMART/CAPABLE
                      ^
                      |
           ChatGPT    |    Elixa ★
                      |    Lindy
    SIMPLE -----------+----------- INTEGRATED
                      |
           N8N        |    Salesforce
           Motion     |    Einstein
                      |
                      v
               BASIC/LIMITED

+ Comparison Table (simplified) below
```

**Updated competitor list:**
1. ChatGPT
2. N8N
3. Motion
4. Sintra AI
5. Lindy AI (NEW)
6. Salesforce Einstein
7. Elixa (Us)

---

### 5. Pricing Slide (`PricingSlide.tsx`)

**Current State:**
- Shows credits and connectors
- Missing agent counts

**Changes:**
- Add agent counts to each plan:
  - Trial: 1 agent
  - Starter: 2 agents
  - Pro: 6 agents
  - Unlimited: 12 agents
- Add "Additional Agents" pricing section: £10/month each

```text
Updated Pricing Cards:
+----------+ +----------+ +----------+ +----------+
| Trial    | | Starter  | | Pro ★    | | Unlimited|
| £0       | | £4.99/mo | | £14.99/mo| | £29.99/mo|
|          | |          | |          | |          |
| 1 agent  | | 2 agents | | 6 agents | | 12 agents|
| 100 cred | | 1k cred  | | 5k cred  | | Unlimited|
| ...      | | ...      | | ...      | | ...      |
+----------+ +----------+ +----------+ +----------+

Additional Costs:
+-------------------+ +-------------------+ +-------------------+
| Storage           | | Credits           | | Extra Agents      |
| TBC               | | 6p per credit     | | £10/month each    |
+-------------------+ +-------------------+ +-------------------+
```

---

### 6. Timeline Slide (Replace `RevenueSlide.tsx`)

**Current State:**
- "Revenue Model" / "Business Model" with metrics and projections

**Changes:**
- Rename to "Timeline & Projections"
- Show horizontal timeline with milestones
- Overlay ARR projection targets at key points
- Use your provided timeline:

```text
Timeline:
Jan 2025        Feb           Mar           Mar           May           Aug
   |             |             |             |             |             |
   v             v             v             v             v             v
+------+     +------+     +------+     +------+     +------+     +------+
|Found-|     |90+   |     |Soft  |     |Invite|     |AI    |     |10k   |
|ational|    |Integr-|    |Launch|     |Devs  |     |Employ|     |Users |
|Work- |     |ations|     |+Users|     |      |     |Section|    |      |
|space |     |      |     |      |     |      |     |      |     |      |
+------+     +------+     +------+     +------+     +------+     +------+

ARR Targets:
                                              £50k ARR   £250k ARR
```

**ARR Projections overlaid:**
- Mar (Soft Launch): First revenue
- May (AI Employees): £50k ARR target
- Aug (10k users): £250k ARR target (based on 10k users @ avg £25/mo = £250k ARR)

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/pitch-deck/slides/SolutionIntroSlide.tsx` | Replace icons with logos, enhance captions |
| `src/components/pitch-deck/slides/OurSolutionSlide.tsx` | Add prominent mascot + logo header |
| `src/components/pitch-deck/slides/MarketSlide.tsx` | Rich redesign with methodology + stats |
| `src/components/pitch-deck/slides/CompetitionSlide.tsx` | Add Lindy AI, create positioning visual |
| `src/components/pitch-deck/slides/PricingSlide.tsx` | Add agent counts + extra agent pricing |
| `src/components/pitch-deck/slides/RevenueSlide.tsx` | Complete rewrite as Timeline slide |
| `src/components/pitch-deck/SlideProgressIndicator.tsx` | Update "Revenue" label to "Timeline" |
| `src/pages/PitchDeck.tsx` | Update import if file is renamed |

---

## Visual Assets Needed

| Asset | Source |
|-------|--------|
| N8N Logo | `/logos/n8nLogo.png` (already exists) |
| UseMotion Logo | External URL or add to public folder |
| Elixa Logo | `ElixaLogo` component (already exists) |
| Mascot | `ElixaMascot` component (already exists) |

For UseMotion logo, will use an external CDN URL or create a simple styled text representation if image is unavailable.

---

## Technical Notes

- All changes maintain the existing light mode theme
- Framer Motion animations preserved
- Responsive layouts maintained
- Print styles unaffected

