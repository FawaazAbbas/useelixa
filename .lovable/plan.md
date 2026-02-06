

# Fix: AnimatedCounter Not Showing Numbers on Shopify Deep Dive and Market Slides

## Problem Analysis

The `AnimatedCounter` components on the Shopify Deep Dive (Slide 7) and Market/TAM slides (Slide 6) appear to not show numbers properly. 

### Root Cause

The counters start their animation immediately on component mount (via `useEffect`), but they're nested inside Framer Motion containers that start with `opacity: 0`. The animation runs while the parent is invisible, so by the time the parent fades in, the counter animation may have already completed at its final value, or there's a timing mismatch causing display issues.

**Key Issue in `AnimatedCounter`:**
```tsx
const [hasAnimated, setHasAnimated] = useState(false);

useEffect(() => {
  if (!hasAnimated) {
    setHasAnimated(true);  // Immediately starts animation on mount
    // Animation runs while parent may still be invisible
  }
}, [hasAnimated, end]);
```

The `hasAnimated` flag is set to `true` immediately, but the parent `motion.div` with `staggerContainer` or `scaleIn` might still be animating from `opacity: 0` to `opacity: 1`.

---

## Solution

Delay the counter animation start until parent animations are complete. Two approaches:

### Approach A: Add delay to counter animation (Recommended)
Add a configurable delay before the counter starts animating, synchronized with the parent's animation duration:

```tsx
const AnimatedCounter = ({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 500, // Wait for parent animation to complete
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Delay start until parent animation is likely complete
    const delayTimer = setTimeout(() => {
      if (!hasAnimated) {
        setHasAnimated(true);
        let start = 0;
        const increment = end / 120;
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, 1000 / 60);
      }
    }, delay);
    
    return () => clearTimeout(delayTimer);
  }, [hasAnimated, end, delay]);

  // ... rest of component
};
```

### Approach B: Use Framer Motion's onAnimationComplete
Use Framer Motion's animation callbacks to trigger counter after parent animation:

```tsx
<motion.div
  variants={scaleIn}
  onAnimationComplete={() => setStartCounter(true)}
>
  {startCounter && <AnimatedCounter ... />}
</motion.div>
```

---

## Implementation Plan

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/pitch-deck/slides/ShopifyDeepDiveSlide.tsx` | Add delay prop to AnimatedCounter, sync with stagger timing |
| `src/components/pitch-deck/slides/MarketSlide.tsx` | Add delay prop to AnimatedCounter, sync with nested scale timing |
| `src/components/pitch-deck/slides/TractionRoadmapSlide.tsx` | Add delay prop to AnimatedCounter (already working but include for consistency) |

### Specific Changes

**ShopifyDeepDiveSlide.tsx:**
1. Modify `AnimatedCounter` to accept a `delay` prop (default 600ms)
2. The KPI tiles use `staggerContainer` with 0.15s stagger × 4 items = 0.6s total + 0.5s animation = ~1.1s
3. Set delay to 800ms to ensure visibility before counter starts

**MarketSlide.tsx:**
1. Modify `AnimatedCounter` to accept a `delay` prop
2. The SOM circle is nested 3 levels deep with `scaleIn` animations (0.5s each)
3. Set delay to 1000ms for the innermost counter

---

## Alternative: Extract Shared AnimatedCounter Component

Create a single reusable component at `src/components/pitch-deck/AnimatedCounter.tsx` with:
- Configurable delay before animation starts
- Support for decimals, prefix, suffix
- Consistent easing and duration
- Import into all 3 slides that use it

This improves maintainability and ensures consistent behavior across all slides.

---

## Expected Result

After this fix:
- Counters will wait for parent animation to complete before starting
- Numbers will animate visibly from 0 to their target values
- All KPI tiles and market metrics will display correctly
- Animation timing will feel synchronized and polished

