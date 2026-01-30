

# Redesign Problem Slide Stats for Clarity

## Current Issue

The stats currently display as:
```
"Burning out from wearing every hat"
        46%
"of smallest UK businesses report burnout..."
```

The percentage (46%, 32%) is visually dominant but meaningless without reading the small text. Viewers see "46%" and think "46% of what?"

---

## Solution: Inline Contextual Stats

Restructure each card so the stat is embedded within a readable sentence, making the meaning immediately clear.

---

## New Card Designs

### Card 1: Burnout
**Current:** `46%` with small text below  
**New Layout:**

```text
┌─────────────────────────────────────┐
│  [Icon]                             │
│                                     │
│  46% of small business              │
│  owners report burnout              │
│                                     │
│  Nearly half of UK businesses with  │
│  1-9 employees say they're burning  │
│  out from wearing every hat.        │
└─────────────────────────────────────┘
```

**Visual Treatment:**
- "46%" in bold gradient text (orange-red)
- "of small business owners report burnout" in regular dark text
- Creates a readable headline: "46% of small business owners report burnout"

---

### Card 2: Growth Blocked
**Current:** `32%` with small text below  
**New Layout:**

```text
┌─────────────────────────────────────┐
│  [Icon]                             │
│                                     │
│  32% can't grow because             │
│  they're too busy                   │
│                                     │
│  Nearly 1 in 3 owners say daily     │
│  operations prevent them from       │
│  hiring or expanding.               │
└─────────────────────────────────────┘
```

---

### Card 3: Hiring Cost
**Current:** `£30,800` with small text below  
**New Layout:**

```text
┌─────────────────────────────────────┐
│  [Icon]                             │
│                                     │
│  £30,800 to hire                    │
│  just one employee                  │
│                                     │
│  The average UK salary—before NI,   │
│  pension, and recruitment costs.    │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Data Structure Change

```typescript
const painPoints = [
  { 
    icon: Users, 
    statValue: "46%",
    statContext: "of small business owners",
    headline: "report burnout",
    detail: "Nearly half of UK businesses with 1-9 employees say they're burning out from wearing every hat."
  },
  { 
    icon: TrendingDown, 
    statValue: "32%",
    statContext: "can't grow because",
    headline: "they're too busy",
    detail: "Nearly 1 in 3 owners say daily operations prevent them from hiring or expanding."
  },
  { 
    icon: PoundSterling, 
    statValue: "£30,800",
    statContext: "to hire just",
    headline: "one employee",
    detail: "The average UK salary—before NI, pension, and recruitment costs."
  },
];
```

### Visual Hierarchy

| Element | Styling |
|---------|---------|
| **Stat Value** | `text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent` |
| **Stat Context** | `text-xl md:text-2xl font-semibold text-slate-800` (same line as stat) |
| **Headline** | `text-xl md:text-2xl font-semibold text-slate-800` (second line) |
| **Detail** | `text-sm text-slate-500 mt-3` |

### Layout Change

Switch from separate "stat + label + context" blocks to a **sentence-style layout** where the stat flows naturally into the meaning:

```tsx
<div className="text-center">
  <span className="text-3xl font-bold text-gradient">46%</span>
  <span className="text-xl text-slate-800"> of small business owners</span>
  <br />
  <span className="text-xl font-semibold text-slate-900">report burnout</span>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `ProblemSlide.tsx` | Restructure `painPoints` array and card rendering to use inline contextual stats |

---

## Expected Result

Before: Viewer sees "46%" → confused → reads small text → understands  
After: Viewer sees "46% of small business owners report burnout" → instantly understands

The stat becomes part of a readable statement, not a standalone number requiring interpretation.

