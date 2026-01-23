

# Live AI Model Switching with Credit-Based Payment System

## Overview

This implementation enables users to switch between AI models on-the-fly directly from the chat interface, with a tiered credit system that ensures profitability. Different models consume different amounts of credits based on their actual cost.

## Solution Design

### Model Pricing Strategy (Credit Multipliers)

To prevent losses, each model has a credit cost multiplier based on real API costs:

| Model | Speed | Quality | Credit Cost | Notes |
|-------|-------|---------|-------------|-------|
| **Gemini 2.5 Flash Lite** | ⚡⚡⚡ | ★★☆ | 1 credit | Budget-friendly, simple tasks |
| **Gemini 2.5 Flash** | ⚡⚡ | ★★★ | 2 credits | Default - balanced |
| **GPT-5 Nano** | ⚡⚡⚡ | ★★★ | 2 credits | Fast OpenAI option |
| **GPT-5 Mini** | ⚡⚡ | ★★★★ | 4 credits | Good performance |
| **Gemini 2.5 Pro** | ⚡ | ★★★★★ | 5 credits | Heavy reasoning |
| **GPT-5** | ⚡ | ★★★★★ | 8 credits | Premium accuracy |
| **GPT-5.2** | ⚡ | ★★★★★★ | 10 credits | Enhanced reasoning |

### User Experience Flow

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Chat Header                                                          │
├──────────────────────────────────────────────────────────────────────┤
│  🤖 Elixa AI                    [GPT-5.2 ▼]  [💳 847 credits]        │
│                                                                       │
│  When clicked, dropdown shows:                                        │
│  ┌────────────────────────────────────────────┐                      │
│  │ ⚡ Gemini Flash Lite    1 credit   ○       │                      │
│  │ ⚡ Gemini Flash         2 credits  ○       │                      │
│  │ ⚡ GPT-5 Nano           2 credits  ○       │                      │
│  │    GPT-5 Mini           4 credits  ○       │                      │
│  │ 🧠 Gemini Pro           5 credits  ○       │                      │
│  │ 🧠 GPT-5                8 credits  ○       │                      │
│  │ 🧠 GPT-5.2 (Enhanced)  10 credits  ●       │  ← Currently selected│
│  └────────────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Credit Balance Display

A small credit indicator in the chat header shows remaining credits. When credits run low:
- **Warning at 50 credits**: Yellow badge with "Low credits" tooltip
- **Critical at 10 credits**: Red badge, prompt to purchase more
- **Zero credits**: Model defaults to cheapest (Gemini Flash Lite) with upgrade prompt

## Technical Implementation

### Step 1: Database Changes

**Add columns to `usage_stats` table:**
```sql
ALTER TABLE usage_stats 
ADD COLUMN credits_used integer DEFAULT 0,
ADD COLUMN credits_purchased integer DEFAULT 0;
```

**Add column to track user's selected model (per-session):**
```sql
ALTER TABLE chat_sessions_v2 
ADD COLUMN selected_model text DEFAULT 'google/gemini-2.5-flash';
```

**Create credit packages table:**
```sql
CREATE TABLE credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

INSERT INTO credit_packages (name, credits, price_cents, popular) VALUES
  ('Starter', 500, 499, false),
  ('Standard', 2000, 1499, true),
  ('Pro', 5000, 2999, false),
  ('Enterprise', 15000, 6999, false);
```

### Step 2: New Component - Model Selector

**File: `src/components/chat/ModelSelector.tsx`**

A dropdown component that:
- Shows all available models with credit costs
- Displays current credit balance
- Persists selection to the session
- Highlights recommended models based on task complexity

```typescript
const AI_MODELS = [
  { 
    id: "google/gemini-2.5-flash-lite", 
    name: "Flash Lite", 
    credits: 1, 
    speed: 3, 
    quality: 2,
    description: "Fast & budget-friendly" 
  },
  { 
    id: "google/gemini-2.5-flash", 
    name: "Gemini Flash", 
    credits: 2, 
    speed: 2, 
    quality: 3,
    description: "Balanced (default)",
    default: true 
  },
  { 
    id: "openai/gpt-5-nano", 
    name: "GPT-5 Nano", 
    credits: 2, 
    speed: 3, 
    quality: 3,
    description: "Fast OpenAI model" 
  },
  // ... more models
  { 
    id: "openai/gpt-5.2", 
    name: "GPT-5.2", 
    credits: 10, 
    speed: 1, 
    quality: 6,
    description: "Enhanced reasoning",
    premium: true 
  },
];
```

### Step 3: Update Chat Page

**File: `src/pages/Chat.tsx`**

Changes:
- Add `selectedModel` state, initialized from session or default
- Add ModelSelector component to the header
- Pass selected model to `sendMessage`
- Show credit balance badge

### Step 4: Update useChat Hook

**File: `src/hooks/useChat.ts`**

Changes:
- Accept `model` parameter in `sendMessage`
- Include model in the request body to the chat function
- Update session's `selected_model` when changed

### Step 5: Update Chat Edge Function

**File: `supabase/functions/chat/index.ts`**

Changes:
- Accept `model` from request body
- Validate model against allowed list
- Calculate credit cost based on model
- Check if user has sufficient credits before proceeding
- Deduct credits after successful response
- Use the requested model in AI gateway calls

```typescript
const MODEL_CREDITS: Record<string, number> = {
  "google/gemini-2.5-flash-lite": 1,
  "google/gemini-2.5-flash": 2,
  "openai/gpt-5-nano": 2,
  "openai/gpt-5-mini": 4,
  "google/gemini-2.5-pro": 5,
  "openai/gpt-5": 8,
  "openai/gpt-5.2": 10,
};

// In serve handler:
const { messages, sessionId, model } = await req.json();
const selectedModel = MODEL_CREDITS[model] ? model : "google/gemini-2.5-flash";
const creditCost = MODEL_CREDITS[selectedModel];

// Check credits before proceeding
const { data: usage } = await serviceSupabase
  .from("usage_stats")
  .select("credits_purchased, credits_used")
  .eq("org_id", orgId)
  .single();

const availableCredits = (usage?.credits_purchased || 1000) - (usage?.credits_used || 0);
if (availableCredits < creditCost) {
  return new Response(
    JSON.stringify({ 
      error: "Insufficient credits", 
      required: creditCost, 
      available: availableCredits 
    }),
    { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// After successful response, deduct credits
await serviceSupabase
  .from("usage_stats")
  .update({ credits_used: (usage?.credits_used || 0) + creditCost })
  .eq("org_id", orgId);
```

### Step 6: Credit Purchase UI

**File: `src/components/chat/CreditPurchaseDialog.tsx`**

A dialog that appears when:
- User clicks "Buy Credits" 
- Credits are insufficient for selected model
- Credit balance is critically low

Shows available packages with Stripe checkout integration (future).

### Step 7: Update Billing Page

**File: `src/pages/Billing.tsx`**

Add:
- Credit balance display (separate from AI calls)
- Credit purchase section with package options
- Credit usage breakdown (by model)

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Add credits columns, credit_packages table, session model |
| `src/components/chat/ModelSelector.tsx` | Create | New dropdown component for model selection |
| `src/components/chat/CreditPurchaseDialog.tsx` | Create | Dialog for purchasing credit packages |
| `src/pages/Chat.tsx` | Modify | Add ModelSelector to header, track selected model |
| `src/hooks/useChat.ts` | Modify | Pass model to chat function |
| `supabase/functions/chat/index.ts` | Modify | Handle model selection, credit deduction |
| `src/pages/Billing.tsx` | Modify | Add credit purchase UI section |

## Credit System Economics

**Free Tier Allocation:**
- New orgs get 1,000 credits/month (enough for ~500 messages with default model)
- Resets monthly

**Credit Package Pricing:**
| Package | Credits | Price | Per Credit |
|---------|---------|-------|------------|
| Starter | 500 | $4.99 | $0.01 |
| Standard | 2,000 | $14.99 | $0.0075 |
| Pro | 5,000 | $29.99 | $0.006 |
| Enterprise | 15,000 | $69.99 | $0.0047 |

**Sustainability:**
- Gemini Flash Lite costs ~$0.001/call → 1 credit = $0.01 → 10x margin
- GPT-5.2 costs ~$0.05/call → 10 credits = $0.10 → 2x margin
- Blended margin ensures profitability across all usage patterns

## Expected Outcome

1. Users can switch AI models instantly from the chat interface
2. Credit costs are transparent - users see exactly what each message costs
3. Premium models are available but appropriately priced
4. Low credit warnings prevent surprise service interruptions
5. Simple credit purchase flow encourages upgrades
6. Organization admins can still set default/allowed models in Settings

