
# Pricing System Implementation Plan

## Overview

This plan implements your new 4-tier GBP pricing structure with a flexible slider-based credit top-up system at 2x markup over the highest GPT model cost.

---

## Pricing Summary

### Subscription Tiers

| Tier | Price | Monthly Credits | AI Models | Connectors |
|------|-------|----------------|-----------|------------|
| Free Trial (14 days) | £0 | 100 | Standard Elixa AI | 2 max |
| Starter | £5.99/mo | 1,000 | Standard Elixa AI | Unlimited |
| Pro | £14.99/mo | 5,000 | GPT + Gemini Premium | Unlimited |
| Unlimited | £29.99/mo | Unlimited | GPT + Gemini Premium | Unlimited |

### Credit Top-Up Pricing

**Pricing Logic:**
- GPT-5.2 (highest model) costs us approximately £0.03 per message
- At 2x markup: **£0.06 per credit**
- Credits sold in increments of 100 (minimum purchase: 100 credits)

| Credits | Price | Per Credit |
|---------|-------|------------|
| 100 | £6 | £0.06 |
| 200 | £12 | £0.06 |
| 500 | £30 | £0.06 |
| 1,000 | £60 | £0.06 |
| 2,000 | £120 | £0.06 |
| 5,000 | £300 | £0.06 |

---

## Technical Changes

### Phase 1: Database Schema Updates

**1.1 Update `orgs` table - Add tier management columns:**

```sql
-- Add columns for subscription tier management
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS connector_limit INTEGER DEFAULT 2;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS has_premium_models BOOLEAN DEFAULT false;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS monthly_credits INTEGER DEFAULT 100;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- Update existing orgs to be on trial with 14 day period
UPDATE orgs 
SET trial_ends_at = now() + interval '14 days',
    plan = 'trial'
WHERE plan = 'free';
```

**1.2 Remove fixed credit_packages table and add dynamic pricing:**

```sql
-- Clear old packages
DELETE FROM credit_packages;

-- Add dynamic pricing configuration
CREATE TABLE IF NOT EXISTS credit_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_credit_pence INTEGER NOT NULL DEFAULT 6, -- £0.06 = 6p
  min_credits INTEGER NOT NULL DEFAULT 100,
  credit_increment INTEGER NOT NULL DEFAULT 100,
  max_credits INTEGER NOT NULL DEFAULT 10000,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default pricing
INSERT INTO credit_pricing (price_per_credit_pence, min_credits, credit_increment, max_credits, currency)
VALUES (6, 100, 100, 10000, 'GBP');

-- RLS for credit_pricing
ALTER TABLE credit_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read credit pricing" ON credit_pricing FOR SELECT USING (true);
```

---

### Phase 2: Frontend - Credit Purchase Dialog

**File: `src/components/chat/CreditPurchaseDialog.tsx`**

Complete redesign with slider-based credit selection:

Key changes:
- Replace package cards with a slider component
- Show dynamic pricing (amount × £0.06)
- Display quick-select buttons for common amounts (100, 500, 1000, 2000)
- GBP currency formatting throughout
- Real-time price calculation as slider moves

New UI structure:
```text
┌─────────────────────────────────────────────────────┐
│ 💳 Buy Credits                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  How many credits do you need?                       │
│                                                      │
│  ○─────────────────●───────────────────────○        │
│  100              500                      10,000    │
│                                                      │
│  Quick select: [100] [500] [1,000] [2,000]          │
│                                                      │
│  ┌───────────────────────────────────────────┐      │
│  │  500 credits                              │      │
│  │  £30.00                                   │      │
│  │  £0.06 per credit                         │      │
│  └───────────────────────────────────────────┘      │
│                                                      │
│  Current balance: 47 credits                         │
│  After purchase: 547 credits                         │
│                                                      │
│              [Cancel]  [Purchase £30.00]             │
└─────────────────────────────────────────────────────┘
```

---

### Phase 3: Billing Page Updates

**File: `src/pages/Billing.tsx`**

Update with new 4-tier structure:

```typescript
const plans = [
  {
    name: "Free Trial",
    price: "£0",
    description: "14-day trial to explore Elixa",
    features: [
      "100 AI credits",
      "Standard Elixa AI only",
      "2 connectors maximum",
      "14-day access",
    ],
    limits: { credits: 100, connectors: 2, premiumModels: false },
    trial: true,
  },
  {
    name: "Starter",
    price: "£5.99",
    period: "/month",
    description: "For individuals getting started",
    features: [
      "1,000 AI credits/month",
      "Standard Elixa AI",
      "Unlimited connectors",
      "Email support",
    ],
    limits: { credits: 1000, connectors: Infinity, premiumModels: false },
  },
  {
    name: "Pro",
    price: "£14.99",
    period: "/month",
    description: "For power users",
    features: [
      "5,000 AI credits/month",
      "Access to GPT & Gemini Pro",
      "Unlimited connectors",
      "Priority support",
    ],
    limits: { credits: 5000, connectors: Infinity, premiumModels: true },
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "£29.99",
    period: "/month",
    description: "No limits, full power",
    features: [
      "Unlimited AI credits",
      "Access to GPT & Gemini Pro",
      "Unlimited connectors",
      "Dedicated support",
    ],
    limits: { credits: Infinity, connectors: Infinity, premiumModels: true },
  },
];
```

Additional updates:
- Add "Top Up Credits" button that opens the CreditPurchaseDialog
- Show credit top-up rate (£0.06/credit) in the usage section
- Display trial countdown for trial users

---

### Phase 4: Model Access Control

**File: `src/components/chat/ModelSelector.tsx`**

Add tier-based model gating:

```typescript
// Define model tiers
const STANDARD_MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash", 
  "openai/gpt-5-nano",
];

const PREMIUM_MODELS = [
  "openai/gpt-5-mini",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5.2",
];
```

Changes:
- Fetch `has_premium_models` flag from user's org
- Show lock icon and "Upgrade to Pro" tooltip on premium models for non-premium users
- Disable selection of premium models for Standard/Starter tier users

---

### Phase 5: Backend Enforcement

**File: `supabase/functions/chat/index.ts`**

Add validation for model access and unlimited credits:

```typescript
// Check if user can use the requested model
async function validateModelAccess(
  supabase: any, 
  orgId: string, 
  model: string
): Promise<{ allowed: boolean; error?: string }> {
  const { data: org } = await supabase
    .from("orgs")
    .select("has_premium_models, is_unlimited, plan")
    .eq("id", orgId)
    .single();

  const isPremium = PREMIUM_MODELS.includes(model);
  
  if (isPremium && !org?.has_premium_models && !org?.is_unlimited) {
    return { 
      allowed: false, 
      error: "This model requires a Pro or Unlimited plan" 
    };
  }
  
  return { allowed: true };
}

// Skip credit deduction for unlimited users
async function deductCredits(
  supabase: any,
  orgId: string, 
  credits: number
): Promise<boolean> {
  const { data: org } = await supabase
    .from("orgs")
    .select("is_unlimited")
    .eq("id", orgId)
    .single();

  if (org?.is_unlimited) {
    return true; // No deduction needed
  }

  // Existing credit deduction logic...
}
```

---

### Phase 6: Trial Banner Component

**New file: `src/components/billing/TrialBanner.tsx`**

Show countdown for trial users:

```text
┌────────────────────────────────────────────────────────┐
│ ⏱️  You have 7 days left on your free trial           │
│     Upgrade now to keep full access →  [Upgrade]       │
└────────────────────────────────────────────────────────┘
```

Display in the main layout for trial users with logic:
- Calculate days remaining from `trial_ends_at`
- Show urgency styling when < 3 days remaining
- Link to Billing page upgrade flow

---

### Phase 7: Connector Limit Enforcement

**File: `src/pages/Connections.tsx`**

Add connector limit validation:

- Fetch `connector_limit` from org
- Count current `org_integrations` 
- Show "X/2 connectors used" for trial users
- Disable additional connections when limit reached
- Display "Upgrade to add more connectors" message

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/billing/TrialBanner.tsx` | Trial countdown banner |
| `src/components/billing/CreditSlider.tsx` | Reusable slider for credit selection |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/chat/CreditPurchaseDialog.tsx` | Replace packages with slider, GBP pricing |
| `src/pages/Billing.tsx` | New 4-tier structure, GBP currency, top-up button |
| `src/components/chat/ModelSelector.tsx` | Add premium model gating |
| `src/pages/Connections.tsx` | Add connector limit enforcement |
| `supabase/functions/chat/index.ts` | Model access validation, unlimited credits |
| `src/components/PageLayout.tsx` | Add TrialBanner integration |

### Database Migrations
- Add columns to `orgs` table (trial_ends_at, connector_limit, has_premium_models, monthly_credits, is_unlimited)
- Create `credit_pricing` table for dynamic pricing config
- Update existing users to trial status

---

## Implementation Order

1. **Database migration** - Add new columns and pricing table
2. **CreditPurchaseDialog** - Slider-based top-up with GBP pricing
3. **Billing page** - New 4-tier structure
4. **ModelSelector** - Premium model gating
5. **Chat edge function** - Backend model/credit validation
6. **TrialBanner** - Trial countdown component
7. **Connections page** - Connector limit enforcement
