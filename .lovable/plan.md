

# Switch Stripe from Test Mode to Live Mode

## Overview
Switch your payment system from Stripe's test environment to live/production mode so you can process real payments from customers.

---

## Current Setup (Test Mode)

Your Stripe integration currently uses test mode with these **test mode** credentials and IDs:

| Component | Current Test Mode Values |
|-----------|--------------------------|
| Secret Key | `STRIPE_SECRET_KEY` (test key starting with `sk_test_...`) |
| Webhook Secret | `STRIPE_WEBHOOK_SECRET` (test webhook secret) |
| Products | Already created in test mode (Starter, Pro, Unlimited, Credits) |
| Price IDs | Test price IDs in `stripe-checkout` function |

---

## What Needs to Change

To go live, you need to:

1. **Create live mode products and prices** (or copy from test mode)
2. **Update the Stripe secret key** to your live mode key
3. **Create a new live webhook** and update the webhook secret
4. **Update all product/price IDs** in your code to live mode IDs

---

## Step-by-Step Plan

### Step 1: Create Live Mode Products in Stripe

You'll need to recreate your products in live mode. I can help create them using the Stripe tools:

| Product | Price | Type |
|---------|-------|------|
| Elixa Starter | £X.XX/month | Subscription |
| Elixa Pro | £X.XX/month | Subscription |
| Elixa Unlimited | £X.XX/month | Subscription |
| Elixa Credits | Dynamic pricing | One-time |

**Note:** I'll need you to confirm the prices you want for each plan before creating them.

---

### Step 2: Update Stripe Secret Key

Your current `STRIPE_SECRET_KEY` is a test key. You need to replace it with your live secret key.

**How to get your live key:**
1. Go to [Stripe Dashboard API Keys](https://dashboard.stripe.com/apikeys)
2. Make sure you're viewing **live mode** (toggle at the top)
3. Copy your **Secret key** (starts with `sk_live_...`)

I'll use a tool to prompt you to enter the new live secret key securely.

---

### Step 3: Create Live Webhook & Update Secret

Your webhook endpoint needs to be registered in Stripe's live mode:

**Webhook URL:** `https://okkybxipbxpoyzqmtosz.supabase.co/functions/v1/stripe-webhook`

**Events to listen for:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

**How to create:**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Make sure you're in **live mode**
3. Click "Add endpoint"
4. Enter the webhook URL above
5. Select the events listed above
6. Copy the **Signing secret** (starts with `whsec_...`)

I'll prompt you to enter the new webhook secret.

---

### Step 4: Update Product & Price IDs in Code

After creating live products, update these files with the new IDs:

**File: `supabase/functions/stripe-checkout/index.ts`**
```typescript
// Update with LIVE price IDs
const PLAN_PRICES: Record<string, string> = {
  starter: "price_LIVE_STARTER_ID",
  pro: "price_LIVE_PRO_ID",
  unlimited: "price_LIVE_UNLIMITED_ID",
};

// Update credits product
product: "prod_LIVE_CREDITS_ID",
```

**File: `supabase/functions/stripe-webhook/index.ts`**
```typescript
// Update with LIVE product IDs
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_LIVE_STARTER_ID": "starter",
  "prod_LIVE_PRO_ID": "pro",
  "prod_LIVE_UNLIMITED_ID": "unlimited",
};
```

**File: `supabase/functions/check-subscription/index.ts`**
```typescript
// Same product ID updates
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_LIVE_STARTER_ID": "starter",
  "prod_LIVE_PRO_ID": "pro",
  "prod_LIVE_UNLIMITED_ID": "unlimited",
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/stripe-checkout/index.ts` | Update price IDs and credits product ID |
| `supabase/functions/stripe-webhook/index.ts` | Update product ID mappings |
| `supabase/functions/check-subscription/index.ts` | Update product ID mappings |

## Secrets to Update

| Secret | New Value |
|--------|-----------|
| `STRIPE_SECRET_KEY` | Your live secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Your live webhook signing secret (`whsec_...`) |

---

## Implementation Order

1. **First** - Confirm your subscription prices (I'll ask)
2. **Second** - Create live mode products and prices in Stripe
3. **Third** - You update the `STRIPE_SECRET_KEY` to live mode
4. **Fourth** - You create the live webhook and update `STRIPE_WEBHOOK_SECRET`
5. **Fifth** - I update all product/price IDs in the code

---

## Important Considerations

- **Test thoroughly** before announcing to customers
- **Existing test customers** won't carry over - live mode is a fresh start
- **Refunds and disputes** are real in live mode
- Consider starting with a **small test purchase** yourself to verify everything works

---

## Questions I Need Answered

Before proceeding, please confirm:

1. **What are your subscription prices?**
   - Starter: £___/month
   - Pro: £___/month  
   - Unlimited: £___/month

2. **What's the credit pricing?** (Currently 6p per credit - is this correct for live?)

Once you confirm the prices, I'll create the live products and guide you through updating the secrets.

