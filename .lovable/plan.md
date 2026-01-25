
# Fix: Shopify Integration "Not Configured" Error

## Problem
The Shopify connect dialog shows "Shopify integration is not configured" because the frontend environment variable `VITE_SHOPIFY_CLIENT_ID` is empty.

## Root Cause Analysis
```text
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (ShopifyConnectDialog.tsx)                           │
│  ↓                                                              │
│  Reads: OAUTH_CLIENT_IDS.SHOPIFY                               │
│  ↓                                                              │
│  Which uses: import.meta.env.VITE_SHOPIFY_CLIENT_ID            │
│  ↓                                                              │
│  Current value in .env: "" (empty string)                      │
│  ↓                                                              │
│  Check fails: if (!clientId) → Shows error                     │
└─────────────────────────────────────────────────────────────────┘
```

**Backend secrets exist and are configured correctly:**
- `SHOPIFY_OAUTH_CLIENT_ID` ✓
- `SHOPIFY_OAUTH_CLIENT_SECRET` ✓

**Frontend is missing the Client ID:**
- `VITE_SHOPIFY_CLIENT_ID` = "" (empty)

## Solution

### Step 1: Update the .env file
Add the Shopify Client ID to the `.env` file. This is the **same value** as the `SHOPIFY_OAUTH_CLIENT_ID` secret:

```env
VITE_SHOPIFY_CLIENT_ID="your-shopify-client-id-here"
```

### Why This Is Safe
Shopify Client IDs (like all OAuth Client IDs) are **public/publishable keys**. They are safe to include in frontend code because:
- They only identify your app to Shopify
- They cannot be used to access any data without the user completing OAuth
- The secret (`SHOPIFY_OAUTH_CLIENT_SECRET`) remains securely stored in Supabase secrets

## Technical Details

### Files Involved
| File | Purpose |
|------|---------|
| `.env` | Stores `VITE_SHOPIFY_CLIENT_ID` for frontend |
| `src/config/oauth.ts` | Reads the env var as `OAUTH_CLIENT_IDS.SHOPIFY` |
| `src/components/connections/ShopifyConnectDialog.tsx` | Uses it to build OAuth URL |
| Supabase Secrets | Stores `SHOPIFY_OAUTH_CLIENT_ID` and `SHOPIFY_OAUTH_CLIENT_SECRET` for backend |

### OAuth Flow After Fix
1. User enters shop domain → Dialog uses `VITE_SHOPIFY_CLIENT_ID` to build auth URL
2. User authorizes on Shopify → Redirected back with auth code
3. Backend (`exchange-oauth-token`) uses `SHOPIFY_OAUTH_CLIENT_ID` and `SHOPIFY_OAUTH_CLIENT_SECRET` to exchange code for token

## Action Required
You need to provide the Shopify Client ID value to populate in the `.env` file. This should match what you have configured in your Shopify Partner Dashboard app.
