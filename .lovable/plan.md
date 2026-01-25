
# New Homepage Design Plan

## Overview
Create a compelling marketing homepage that clearly communicates what Elixa is: **an MCP connector platform** that bridges your favorite tools with AI assistants like Claude and Cursor. The homepage will precede the Tool Library section and feature a prominent "Try it out" CTA.

---

## Page Structure

### 1. Hero Section
**Purpose:** Immediately communicate the value proposition

**Content:**
- **Headline:** "Connect Your Tools to AI"
- **Subheadline:** "Elixa is the bridge between your favorite apps and AI assistants. Connect once, use everywhere."
- **Primary CTA:** "Try it out" button (navigates to `/auth` for signup, or `/chat` for logged-in users)
- **Secondary CTA:** "Browse Tools" (scrolls to tool library section)
- **Visual:** Animated graphic showing tool logos connecting to AI (Claude, Cursor icons)

---

### 2. "How It Works" Section
**Purpose:** Explain the concept in 3 simple steps

**Steps:**
1. **Connect Your Tools** - "Link your Gmail, Shopify, Calendar, Slack, and 30+ other services in one place."
2. **Generate MCP Token** - "Get a secure API token to authenticate your AI clients."
3. **Use with Any AI** - "Claude Desktop, Cursor, or any MCP-compatible client can now access your tools."

**Visual:** Step-by-step flow diagram or numbered cards

---

### 3. Integration Showcase Section
**Purpose:** Display the breadth of supported tools

**Content:**
- Grid of integration logos (Slack, Gmail, Google Calendar, Shopify, Notion, Stripe, HubSpot, Figma, etc.)
- Category pills: Communication, Productivity, E-commerce, CRM, Marketing, Payments
- Count badge: "30+ integrations and growing"
- Links to full Tool Library

---

### 4. Key Features Section
**Purpose:** Highlight core differentiators

**Feature Cards:**
1. **MCP Native** - "Built for the Model Context Protocol standard. Works with Claude Desktop, Cursor, and any MCP client."
2. **Secure OAuth** - "Enterprise-grade OAuth 2.0 with encrypted credential storage. Your tokens are never exposed."
3. **One Connection, Many AIs** - "Connect once and use across all your AI tools. No re-authentication needed."
4. **Built-in AI Chat** - "Don't have an MCP client? Use our built-in AI assistant to interact with your tools directly."

---

### 5. Use Cases Section
**Purpose:** Show practical applications

**Cards:**
- **Email Management** - "Ask Claude to summarize your inbox or draft responses"
- **Calendar Scheduling** - "Let AI find your free slots and create events"
- **E-commerce Insights** - "Get order summaries and inventory updates via chat"
- **CRM Updates** - "Create contacts and log interactions hands-free"

---

### 6. Social Proof / Trust Section
**Purpose:** Build credibility

**Elements:**
- Security badges (OAuth 2.0, encrypted storage)
- "Trusted by X teams" (placeholder for future metrics)
- Compatibility logos (Claude, Cursor, etc.)

---

### 7. Final CTA Section
**Purpose:** Drive conversion

**Content:**
- **Headline:** "Ready to supercharge your AI?"
- **Subheadline:** "Connect your tools in minutes. No credit card required."
- **CTA Button:** "Try it out"

---

### 8. Tool Library Section (Existing)
**Purpose:** Preserve the current integration browsing functionality

The existing TalentPool integration grid will be moved below the new marketing sections, serving as a "Browse All Tools" area.

---

## Technical Implementation

### New File Structure
```text
src/pages/Home.tsx         (New - Landing page with all sections)
src/pages/TalentPool.tsx   (Modify - Becomes tool-only view, no hero)
```

### Component Breakdown

**Home.tsx** - New landing page containing:
- `<TalentPoolNavbar />` - Existing navbar (reused)
- `<HeroSection />` - New component with headline, CTAs, and animated visual
- `<HowItWorksSection />` - 3-step process explanation
- `<IntegrationShowcase />` - Logo grid with category filters
- `<FeaturesSection />` - Feature cards
- `<UseCasesSection />` - Use case cards
- `<FinalCTASection />` - Conversion-focused CTA
- `<TalentPoolFooter />` - Existing footer (reused)

### Routing Changes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home.tsx` | New landing page |
| `/tool-library` | `TalentPool.tsx` | Tool browsing only |

### Design Tokens
- Use existing color palette from `tailwind.config.ts`
- Primary gradients: `from-primary/5 to-background`
- Card styling: Consistent with existing `Card` component
- Animations: Subtle fade-in on scroll using `framer-motion`

### Responsive Behavior
- Mobile: Single-column layout, stacked sections
- Tablet: 2-column grids where applicable
- Desktop: Full-width hero, 3-4 column grids

---

## Content Refinements

### Updated Messaging
- Remove all "AI employee" and "talent pool" language
- Focus on "tools," "connectors," and "integrations"
- Emphasize MCP compatibility as the primary differentiator
- Highlight security and ease of use

### Footer Updates
Update `TalentPoolFooter.tsx` to remove outdated links:
- Remove "Join the Waitlist" (app is live)
- Remove "Referral Program" (if not active)
- Remove "Become an Agent Developer" (old concept)
- Add "Documentation" link
- Add "MCP Setup Guide" link

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Home.tsx` | Create | New landing page |
| `src/pages/TalentPool.tsx` | Modify | Remove hero, keep tool grid |
| `src/components/home/HeroSection.tsx` | Create | Hero with CTA |
| `src/components/home/HowItWorksSection.tsx` | Create | 3-step process |
| `src/components/home/IntegrationShowcase.tsx` | Create | Logo grid |
| `src/components/home/FeaturesSection.tsx` | Create | Feature cards |
| `src/components/home/UseCasesSection.tsx` | Create | Use cases |
| `src/components/home/FinalCTASection.tsx` | Create | Bottom CTA |
| `src/components/TalentPoolFooter.tsx` | Modify | Update links |
| `src/pages/About.tsx` | Modify | Update outdated language |
| `src/App.tsx` | Modify | Update route for `/` |

---

## CTA Behavior

**"Try it out" Button Logic:**
```typescript
const handleTryItOut = () => {
  if (user) {
    navigate("/chat"); // Logged-in users go to chat
  } else {
    navigate("/auth"); // New users go to auth
  }
};
```

---

## Visual References

### Hero Animation Concept
```text
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │  Gmail  │     │ Shopify │     │  Slack  │
    └────┬────┘     └────┬────┘     └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────▼────┐
                    │  ELIXA  │
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │ Claude  │     │ Cursor  │     │   AI    │
    └─────────┘     └─────────┘     └─────────┘
```

### Color Scheme
- Hero background: Gradient from `primary/5` to `background`
- Accent colors: Use existing purple/rose gradient for CTAs
- Cards: Use `bg-card` with `border-border/50`

---

## Summary

This redesign transforms the homepage from a simple tool directory into a compelling marketing page that:
1. Clearly explains what Elixa does (MCP connector)
2. Shows the breadth of integrations (30+ tools)
3. Highlights key benefits (security, ease of use, MCP native)
4. Provides a clear path to action ("Try it out")
5. Maintains access to the tool library for browsing
