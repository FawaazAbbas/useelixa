

# Add Discount/Coupon Support to Payments

## Overview
Add the ability to apply discount codes (coupons and promotion codes) to both subscription plans and credit purchases. This will allow you to give discounts to customers during checkout.

---

## How Stripe Discounts Work

Stripe uses a two-tier system:
1. **Coupons** - The underlying discount definition (e.g., "20% off" or "£5 off")
2. **Promotion Codes** - Customer-facing codes that map to coupons (e.g., "WELCOME20", "EARLYADOPTER")

You can apply discounts in two ways:
- **Directly pass a coupon ID** to the checkout session
- **Enable promotion codes** so customers can enter codes at checkout

---

## Proposed Solution

### Option A: Enable Promotion Code Field (Simplest)
Let customers enter promotion codes directly on the Stripe Checkout page. You create coupons and promotion codes in Stripe Dashboard, and customers enter them during checkout.

### Option B: Apply Specific Coupon from App (More Control)
Pass a coupon code from your app to the checkout session, allowing you to control which discounts apply programmatically.

**Recommendation**: Implement both - enable the promotion code field by default, and add the ability to pass a specific coupon when needed.

---

## Changes Required

### 1. Update `stripe-checkout` Edge Function

**File:** `supabase/functions/stripe-checkout/index.ts`

Add support for:
- `allow_promotion_codes: true` - Shows a promo code field on Stripe Checkout
- `discounts` array - Apply a specific coupon directly
- Accept optional `couponId` or `promoCode` in the request body

```typescript
// Request body adds optional discount parameters
const { type, planId, creditAmount, couponId, promoCode } = await req.json();

// For subscription checkout - add discounts configuration
session = await stripe.checkout.sessions.create({
  // ... existing config
  allow_promotion_codes: !couponId, // Only show field if no coupon pre-applied
  discounts: couponId ? [{ coupon: couponId }] : 
             promoCode ? [{ promotion_code: promoCode }] : undefined,
});

// Same for credit purchase checkout
```

### 2. Update Billing Page to Support Coupons

**File:** `src/pages/Billing.tsx`

Add an optional input field for promo codes when upgrading:
- Add state for promo code input
- Show a collapsible "Have a promo code?" section
- Pass the code to the checkout function

### 3. Update Credit Purchase Dialog

**File:** `src/components/chat/CreditPurchaseDialog.tsx`

Add promo code support:
- Add optional promo code input field
- Pass promo code to checkout function
- Show discount preview if validated

### 4. Create Coupons in Stripe

Use the Stripe tools to create some initial coupons:
- Example: "WELCOME" - 20% off first subscription
- Example: "CREDITS10" - 10% off credit purchases

---

## Implementation Details

### Updated Checkout Function Flow

```text
┌─────────────────────────────────────────────────────────┐
│                   stripe-checkout                        │
├─────────────────────────────────────────────────────────┤
│ Request: { type, planId, creditAmount, couponId? }      │
│                                                          │
│ 1. Authenticate user                                     │
│ 2. Find/create Stripe customer                          │
│ 3. Build checkout session:                              │
│    - If couponId provided → apply via discounts[]       │
│    - Else → enable allow_promotion_codes                │
│ 4. Return checkout URL                                   │
└─────────────────────────────────────────────────────────┘
```

### UI Components

**Billing Page - Plan Upgrade:**
```text
┌─────────────────────────────────────────┐
│  Pro Plan - £14.99/month                │
│  ────────────────────────────           │
│  [Have a promo code? ▼]                 │
│  ┌─────────────────────────────────┐    │
│  │ Enter code: [WELCOME20    ]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Upgrade to Pro]                       │
└─────────────────────────────────────────┘
```

**Credit Purchase Dialog:**
```text
┌─────────────────────────────────────────┐
│  Buy Credits                            │
│  ────────────────────────────           │
│  Credits: [──────●──────] 500           │
│  Price: £30.00                          │
│                                         │
│  [Have a promo code? ▼]                 │
│  ┌─────────────────────────────────┐    │
│  │ [CREDITS10    ]  [Apply]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Purchase £30.00]                      │
└─────────────────────────────────────────┘
```

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/stripe-checkout/index.ts` | Add `couponId` parameter, enable `allow_promotion_codes` |
| `src/pages/Billing.tsx` | Add collapsible promo code input for plan upgrades |
| `src/components/chat/CreditPurchaseDialog.tsx` | Add optional promo code field |

---

## Creating Coupons

After implementation, you can create coupons via:

1. **Stripe Dashboard** (recommended for one-off coupons)
   - Go to Products > Coupons > New
   - Set percentage or fixed amount off
   - Create promotion codes customers can enter

2. **Stripe API Tools** (for programmatic creation)
   - Use the create_coupon tool to make coupons
   - Example: 20% off, once, named "Welcome Discount"

---

## Summary

This implementation:
- Enables the promo code field on Stripe Checkout by default
- Allows passing specific coupon IDs for programmatic discounts
- Adds UI elements for customers to enter promo codes before checkout
- Works for both subscriptions and one-time credit purchases
- You manage coupons and promotion codes in Stripe Dashboard

