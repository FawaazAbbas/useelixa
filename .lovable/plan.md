
# Shopify OAuth Integration Plan

## Challenge Overview

Shopify OAuth is fundamentally different from other providers (Google, Microsoft, Notion, etc.). While most OAuth providers use centralized authorization endpoints, Shopify requires:

1. **Shop-specific authorization URL**: `https://{shop}.myshopify.com/admin/oauth/authorize`
2. **Shop-specific token exchange URL**: `https://{shop}.myshopify.com/admin/oauth/access_token`

This means we need to collect the user's Shopify store domain before initiating the OAuth flow.

## Current State

- Backend secrets already configured: `SHOPIFY_OAUTH_CLIENT_ID`, `SHOPIFY_OAUTH_CLIENT_SECRET`
- Frontend fallback Client ID: `44ad1408b7b236bb6dfe4d8ee9efff5d`
- Frontend currently returns `null` for Shopify OAuth URL (intentionally disabled)

## Implementation Plan

### 1. Create Shop Domain Input Dialog

Create a new dialog component that prompts users to enter their Shopify store domain before connecting.

**File**: `src/components/connections/ShopifyConnectDialog.tsx`

The dialog will:
- Show an input field for the store domain
- Accept formats: `my-store` or `my-store.myshopify.com`
- Validate the domain format
- Construct and redirect to the proper Shopify authorization URL

### 2. Update OAuth Configuration

**File**: `src/config/oauth.ts`

- Add a new function `getShopifyOAuthUrl(shopDomain: string)` that:
  - Normalizes the shop domain (adds `.myshopify.com` if needed)
  - Constructs the authorization URL with proper scopes
  - Returns the complete OAuth URL

- Define appropriate scopes for Shopify (e.g., `read_products,read_orders,read_customers`)

### 3. Update Connections Page

**File**: `src/pages/Connections.tsx`

- Show the Shopify Connect Dialog when user clicks "Connect" for Shopify
- Pass the shop domain to the OAuth flow via the state parameter

### 4. Update OAuth Callback

**File**: `src/pages/OAuthCallback.tsx`

- Extract shop domain from state parameter for Shopify
- Pass shop domain to the exchange function

### 5. Update Token Exchange Edge Function

**File**: `supabase/functions/exchange-oauth-token/index.ts`

- Add Shopify-specific handling
- Use the shop domain to construct the correct token endpoint URL
- Use form-urlencoded format (as per Shopify docs)
- Store the shop domain alongside the credential for future API calls

### 6. Update Token Refresh Edge Function

**File**: `supabase/functions/refresh-oauth-token/index.ts`

- Add Shopify-specific handling (note: Shopify offline access tokens don't expire by default, but may need rotation support)

---

## Technical Details

### Shopify Authorization URL Format
```text
https://{shop}.myshopify.com/admin/oauth/authorize
  ?client_id={api_key}
  &scope={scopes}
  &redirect_uri={redirect_uri}
  &state={nonce}
```

### Shopify Token Exchange
```text
POST https://{shop}.myshopify.com/admin/oauth/access_token
Content-Type: application/x-www-form-urlencoded

client_id={api_key}
client_secret={api_secret}
code={authorization_code}
```

### Recommended Scopes
For the AI assistant integration, typical scopes include:
- `read_products` - View products
- `read_orders` - View orders  
- `read_customers` - View customers
- `read_inventory` - View inventory levels
- `read_analytics` - View analytics (if available)

### Database Changes
The existing `user_credentials` table can store the shop domain in the `account_email` or a new `metadata` column. The shop domain is needed for:
- Future API calls to the Shopify Admin API
- Constructing the correct API endpoint URLs

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/connections/ShopifyConnectDialog.tsx` | Create |
| `src/config/oauth.ts` | Modify |
| `src/pages/Connections.tsx` | Modify |
| `src/pages/OAuthCallback.tsx` | Modify |
| `supabase/functions/exchange-oauth-token/index.ts` | Modify |
| `supabase/functions/refresh-oauth-token/index.ts` | Modify |

---

## Edge Cases

1. **Invalid shop domain**: Validate format before redirecting
2. **Store not found**: Handle Shopify 404 errors gracefully
3. **App not installed**: User must install the app via OAuth first
4. **Expired tokens**: Shopify offline tokens typically don't expire, but may need rotation for security
