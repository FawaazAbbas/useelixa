
# Pitch Deck Page - Full Visual Remix

## Overview
Transform the text-based pitch deck PDF into an immersive, animated, full-screen scrolling presentation page for Elixa's Pre-Seed fundraise.

## Pitch Deck Content (13 Slides)

Based on the uploaded PDF, here's the content structure:

| Slide | Title | Key Content |
|-------|-------|-------------|
| 1 | Title | ELIXA - Pre-Seed Deck |
| 2 | Problem | Solopreneurs struggle with overhead - avg UK salary £39,039 + £5,106 tax |
| 3 | Solution Intro | AI employees are here...but £500+ for a simple chatbot |
| 4 | Our Solution | AI employee talent pool + workspace. Think "Slack + App Store" |
| 5 | Demo | AI Teams Chats, Cross-collaboration, 90+ tool integrations |
| 6 | Founder | Fawaaz Abbas - Marketing & programming, ex-Linvelles founder |
| 7 | Customer | SMEs: $3,500/year on SaaS, 120 hrs on admin, 10-30% software waste |
| 8 | Market | "Size of market, big numbers" (placeholder) |
| 9 | Shopify Focus | 5.5M merchants, $120/month on apps, 64% small businesses |
| 10 | Traction | 10,000 projected signups by end of February |
| 11 | Competition | Motion, Sintra, Alibaba, Google, ChatGPT, N8N, Salesforce |
| 12 | Advantage | Private developers, 90+ tools, no coding required |
| 13 | Timeline | Jan-Aug roadmap: Workspace → Integrations → Launch → 10k users |

---

## Technical Architecture

### New Files to Create

```text
src/pages/PitchDeck.tsx              # Main page component
src/components/pitch-deck/slides/    # Slide components folder
  ├── TitleSlide.tsx
  ├── ProblemSlide.tsx
  ├── SolutionIntroSlide.tsx
  ├── OurSolutionSlide.tsx
  ├── DemoSlide.tsx
  ├── FounderSlide.tsx
  ├── CustomerSlide.tsx
  ├── MarketSlide.tsx
  ├── ShopifyFocusSlide.tsx
  ├── TractionSlide.tsx
  ├── CompetitionSlide.tsx
  ├── AdvantageSlide.tsx
  └── TimelineSlide.tsx
```

### Update Existing Files

- `src/App.tsx` - Add `/pitch-deck` route
- `src/components/pitch-deck/SlideProgressIndicator.tsx` - Update slide labels
- `src/index.css` - Add pitch deck specific styles

---

## Design System

### Visual Language

- **Full-screen slides**: Each slide = 100vh viewport
- **Dark theme**: Deep gradient backgrounds for cinematic feel
- **Accent colors**: Primary blue (#3B82F6) with gradient accents
- **Typography**: Bold headlines (text-6xl to text-8xl), clean body text
- **Animations**: Framer Motion scroll-triggered reveals
- **Mascot integration**: Elixa mascot in contextual poses

### Slide Backgrounds

Each slide uses unique gradient backgrounds:

```text
Title:      Deep blue to purple radial gradient
Problem:    Dark with red/orange accent (pain point)
Solution:   Blue to teal gradient (hope/possibility)
Demo:       Dark with workspace screenshot mockup
Founder:    Professional dark with subtle pattern
Market:     Dark with animated number counters
Timeline:   Dark with animated progress line
```

### Animation Patterns

Using existing `slideAnimations.ts`:
- `fadeInUp` - Default content reveal
- `staggerContainer` - Lists and grid items
- `scaleIn` - Key metrics and numbers
- `slideInLeft/Right` - Two-column layouts
- `floatUp` - Hero elements

---

## Detailed Slide Designs

### Slide 1: Title
- Full-screen gradient background (blue → purple)
- Large "ELIXA" logo with glow effect
- "PRE-SEED DECK" subtitle
- Elixa mascot (waving pose) with float animation
- Scroll indicator at bottom

### Slide 2: Problem
- **Headline**: "Solopreneurs struggle with overhead"
- Split layout: Story on left, stats on right
- Animated counter: "£39,039 + £5,106"
- Pain point illustration with stressed founder visual
- Red/orange accent to convey urgency

### Slide 3: Solution Intro
- "The solution? AI employees"
- "But where are they?"
- Price card: "£500+ for a simple chatbot"
- Creates tension before Elixa's solution

### Slide 4: Our Solution
- **Headline**: "AI Employee Talent Pool + Workspace"
- "Think Slack + App Store"
- Split visual: Talent pool grid + unified workspace
- Elixa mascot (pointing-right) introducing the concept

### Slide 5: Demo
- Full-width workspace mockup
- Floating feature cards:
  - AI Teams Chats
  - Cross collaboration
  - 90+ tools
  - One workspace
- "See it in action" CTA linking to `/chat`

### Slide 6: Founder
- Large profile photo area (placeholder or actual)
- **Fawaaz Abbas**
- Credentials list with icons:
  - Marketing & programming background
  - Ex-founder of Linvelles (fashion)
  - Expert in distribution & MVP builds

### Slide 7: Customer (SMEs)
- Animated statistics grid:
  - $3,500/year on SaaS
  - 120 hours/year on admin
  - 24 days on financial admin
  - 96 min lost daily
  - 1.8 hrs searching for info
  - 10-30% software waste
- Each stat animates in with counter effect

### Slide 8: Market Size
- Large animated numbers
- TAM/SAM/SOM concentric circles visualization
- Placeholder for "big numbers" to be added

### Slide 9: Shopify Focus
- Shopify logo integration
- Key metrics:
  - 5.5M merchants globally
  - $120/month on apps
  - 64% small businesses
- Niche-down strategy explanation

### Slide 10: Traction
- Large animated counter: "10,000"
- "Projected signups by February"
- Growth trajectory visualization
- Waitlist/signup CTA

### Slide 11: Competition
- Competitive landscape grid
- Logos: Motion, Sintra, Alibaba, Google, ChatGPT, N8N, Salesforce
- Visual differentiation showing Elixa's unique position

### Slide 12: Competitive Advantage
- Four advantage cards:
  1. Private developers
  2. One fully built workspace
  3. 90+ tool integrations
  4. No coding ever required
- Each card with icon and description

### Slide 13: Timeline
- Horizontal timeline visualization
- Animated progress through milestones:
  - Jan: Foundational workspace
  - Feb: 90+ integrations
  - Mar: Soft launch + invite users
  - Mar: Invite developers
  - May: AI employee section
  - Aug: 10k users

---

## Interactive Features

### Navigation
- **Slide Progress Indicator** (existing component, updated)
- Keyboard navigation: Arrow keys, Page Up/Down
- Scroll snap for clean slide transitions
- Touch/swipe support for mobile

### Scroll Behavior
```css
.pitch-deck-wrapper {
  scroll-snap-type: y mandatory;
}

section {
  scroll-snap-align: start;
  height: 100vh;
}
```

### Analytics Integration
Using existing analytics utilities:
- Track each slide view
- Track completion rate
- Track CTA clicks

---

## Responsive Design

### Desktop (1024px+)
- Full visual experience
- Side navigation indicator
- Large typography and animations

### Tablet (768px - 1023px)
- Scaled layouts
- Adjusted typography
- Simplified animations

### Mobile (< 768px)
- Vertical scrolling experience
- Stacked content layouts
- Touch-optimized navigation
- Reduced animation complexity

---

## Implementation Summary

1. **Create page component** (`PitchDeck.tsx`)
   - Full-screen scroll container
   - Keyboard event listeners
   - Analytics tracking

2. **Create 13 slide components**
   - Each self-contained with animations
   - Consistent structure: background → content → animations

3. **Update navigation**
   - Add route to App.tsx
   - Update slide labels in progress indicator

4. **Add CSS**
   - Scroll snap styles
   - Pitch deck specific utilities
   - Print styles for PDF export

5. **Testing**
   - All screen sizes
   - Keyboard navigation
   - Animation performance
