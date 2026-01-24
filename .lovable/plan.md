
# Fix Stripe Payment Redirect Issue

## Problem Analysis

After a successful Stripe payment, the redirect flow is broken because:

1. **Current behavior**: The `stripe-checkout` and `stripe-portal` edge functions use `req.headers.get("origin")` to determine where to redirect after payment
2. **Issue**: When testing from the preview URL, the origin header contains the preview URL which may:
   - Redirect to an old version of the app
   - Have stale state
   - Cause infinite loading on the billing page

3. **Expected behavior**: After payment, users should be redirected to the primary application URL (`https://workspace.elixa.app`) which is stable

---

## Solution

Use the `SITE_URL` environment secret instead of the dynamic `origin` header for constructing Stripe redirect URLs. The `SITE_URL` secret is already configured as `https://workspace.elixa.app`.

---

## Changes Required

### 1. Update `stripe-checkout` Edge Function

**File:** `supabase/functions/stripe-checkout/index.ts`

Replace the dynamic origin detection:
```typescript
// BEFORE (line 66)
const origin = req.headers.get("origin") || "https://useelixa.lovable.app";

// AFTER
const siteUrl = Deno.env.get("SITE_URL") || "https://workspace.elixa.app";
```

Then update all URL references to use `siteUrl`:
- `success_url` for subscriptions (line 81)
- `cancel_url` for subscriptions (line 82)  
- `success_url` for credits (line 114)
- `cancel_url` for credits (line 115)

### 2. Update `stripe-portal` Edge Function

**File:** `supabase/functions/stripe-portal/index.ts`

Apply the same fix:
```typescript
// BEFORE (line 54)
const origin = req.headers.get("origin") || "https://useelixa.lovable.app";

// AFTER
const siteUrl = Deno.env.get("SITE_URL") || "https://workspace.elixa.app";
```

Update the `return_url` (line 57) to use `siteUrl`.

---

## Technical Details

### Why Use SITE_URL Instead of Origin?

| Approach | Pros | Cons |
|----------|------|------|
| `origin` header | Works for any domain automatically | Unreliable for preview URLs; can redirect to stale versions |
| `SITE_URL` secret | Consistent, predictable redirects | Requires secret to be set; always redirects to production |

### Affected Functions

| Function | Current Origin Source | New Origin Source |
|----------|----------------------|-------------------|
| `stripe-checkout` | `req.headers.get("origin")` | `Deno.env.get("SITE_URL")` |
| `stripe-portal` | `req.headers.get("origin")` | `Deno.env.get("SITE_URL")` |
| `check-subscription` | N/A (no redirects) | No changes needed |
| `stripe-webhook` | N/A (no redirects) | No changes needed |

### Files Modified
1. `supabase/functions/stripe-checkout/index.ts`
2. `supabase/functions/stripe-portal/index.ts`

---

## After Implementation

- Payments completed from any URL (preview or published) will redirect to `https://workspace.elixa.app/billing`
- The billing page will display success/error toasts based on URL parameters
- Users won't get stuck in redirect loops or see old versions of the app
