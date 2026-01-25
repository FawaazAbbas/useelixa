
# Integration Fixes Plan

## Executive Summary
This plan addresses critical issues across multiple integrations that prevent OAuth connections from working properly. The fixes are prioritized by severity and organized into logical groups.

---

## Issues Identified

### Critical Priority (Blocking Functionality)

#### 1. Shopify Integration - Credential Type Mismatch
**Problem**: The `shopify-integration` edge function looks for credentials with type `"shopify"`, but the OAuth flow stores them as `"shopifyApi"`.

**Files Affected**:
- `supabase/functions/shopify-integration/index.ts` (line 21, 30)

**Current Code**:
```typescript
.eq("credential_type", "shopify")
```

**Fix**: Change to `"shopifyApi"` to match what `exchange-oauth-token` stores.

---

#### 2. Calendar Integration - Wrong Secret Names for Token Refresh
**Problem**: The `calendar-integration` edge function uses incorrect environment variable names for Google OAuth token refresh.

**Files Affected**:
- `supabase/functions/calendar-integration/index.ts` (lines 329-330)

**Current Code**:
```typescript
const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
```

**Correct Secret Names** (as used by `gmail-integration` and `exchange-oauth-token`):
```typescript
const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");
```

---

#### 3. Google Sheets Integration - Custom Decryption Method
**Problem**: The `google-sheets-integration` uses a custom decryption method that expects a raw base64 encryption key, while the shared `_shared/crypto.ts` uses PBKDF2 key derivation with a salt.

**Files Affected**:
- `supabase/functions/google-sheets-integration/index.ts` (lines 10-42, 44-102)

**Current Implementation**:
- Lines 12-42: Custom `decryptToken` function that:
  - Expects raw base64-encoded key from `CREDENTIAL_ENCRYPTION_KEY`
  - Directly imports as raw AES key (no PBKDF2 derivation)
  - Different IV/ciphertext format

**Shared Implementation** (`_shared/crypto.ts`):
- Uses PBKDF2 with salt `"elixa_credential_salt_v1"` and 100,000 iterations
- Stores IV prepended to ciphertext in base64 format

**Fix**: Replace custom implementation with shared utilities from `_shared/credentials.ts`.

---

### Medium Priority (Partial Functionality)

#### 4. Frontend Shopify Client ID
**Problem**: The `VITE_SHOPIFY_CLIENT_ID` environment variable exists in secrets but the fallback in `oauth.ts` was removed.

**Current State**:
- Secret exists: `VITE_SHOPIFY_CLIENT_ID` 
- Frontend code: `SHOPIFY: import.meta.env.VITE_SHOPIFY_CLIENT_ID || ""`

**Verification Needed**: Confirm `VITE_SHOPIFY_CLIENT_ID` is set correctly (the secret exists but we can't see its value).

---

#### 5. Missing Backend Functions
**Problem**: Some integrations have OAuth mapping but no corresponding edge function.

| Integration | Has OAuth Mapping | Has Edge Function |
|------------|------------------|-------------------|
| Mailchimp | Yes | No |
| Slack | Yes | No |

**Impact**: Users can complete OAuth flow but the AI cannot use these integrations.

---

### Low Priority (Configuration Issues)

#### 6. Slack OAuth - Backend Secrets Missing
**Problem**: Slack OAuth requires backend secrets that don't exist.

**Required Secrets**:
- `SLACK_OAUTH_CLIENT_ID` (not in secrets list)
- `SLACK_OAUTH_CLIENT_SECRET` (not in secrets list)

**Current State**: Frontend has hardcoded client ID `8186913077078.8224803663382` but token exchange will fail without backend secrets.

---

## Implementation Plan

### Phase 1: Critical Fixes (Immediate)

#### Task 1.1: Fix Shopify credential type
**File**: `supabase/functions/shopify-integration/index.ts`

Change credential type lookup from `"shopify"` to `"shopifyApi"`:
- Line 21: Update query filter
- Line 30: Update `getDecryptedCredentials` call

```text
Modified lines:
- Line 21: .eq("credential_type", "shopifyApi")
- Line 30: getDecryptedCredentials(supabase, userId, "shopifyApi")
```

---

#### Task 1.2: Fix Calendar token refresh secret names
**File**: `supabase/functions/calendar-integration/index.ts`

Update the `refreshGoogleToken` function (lines 324-369):

```text
Modified lines:
- Line 329: const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
- Line 330: const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");
```

---

#### Task 1.3: Refactor Google Sheets to use shared crypto
**File**: `supabase/functions/google-sheets-integration/index.ts`

Major refactor needed:
1. Remove custom `decryptToken` function (lines 12-42)
2. Import and use shared utilities:
   ```typescript
   import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";
   ```
3. Replace `getValidAccessToken` function (lines 44-102) with pattern from `gmail-integration`

---

### Phase 2: Consistency Improvements

#### Task 2.1: Add missing integration edge functions (Future)

Create placeholder edge functions for:
- `mailchimp-integration/index.ts`
- `slack-integration/index.ts` (using Lovable connector gateway pattern)

These would follow the same pattern as existing integrations.

---

## Technical Details

### Credential Type Mapping Reference

| Integration | Frontend Slug | Credential Type | Bundle Type |
|------------|--------------|-----------------|-------------|
| Gmail | gmail | googleOAuth2Api | gmail |
| Google Calendar | google-calendar | googleOAuth2Api | google_calendar |
| Google Ads | google-ads | googleOAuth2Api | google_ads |
| Google Analytics | google-analytics | googleOAuth2Api | google_analytics |
| Google Sheets | google-sheets | googleOAuth2Api | google_sheets |
| Shopify | shopify | shopifyApi | - |
| Notion | notion | notionApi | - |
| Calendly | calendly | calendlyApi | - |
| Microsoft Teams | microsoft-teams | microsoftOAuth2Api | teams |
| Outlook | outlook | microsoftOAuth2Api | outlook |
| OneDrive | onedrive | microsoftOAuth2Api | onedrive |

---

### Secrets Verification

Available secrets needed for integrations:
- `GOOGLEOAUTH2API_CLIENT_ID`
- `GOOGLEOAUTH2API_CLIENT_SECRET`
- `SHOPIFY_OAUTH_CLIENT_ID`
- `SHOPIFY_OAUTH_CLIENT_SECRET`
- `MICROSOFT_OAUTH_APPLICATION_ID`
- `MICROSOFT_OAUTH_CLIENT_SECRET`
- `NOTION_OAUTH_CLIENT_ID`
- `NOTION_OAUTH_CLIENT_SECRET`
- `CALENDLY_OAUTH_CLIENT_ID`
- `CALENDLY_OAUTH_CLIENT_SECRET`
- `MAILCHIMP_OAUTH_CLIENT_ID`
- `MAILCHIMP_OAUTH_CLIENT_SECRET`
- `CREDENTIAL_ENCRYPTION_KEY`
- `VITE_SHOPIFY_CLIENT_ID`

**Missing**:
- `SLACK_OAUTH_CLIENT_ID`
- `SLACK_OAUTH_CLIENT_SECRET`

---

## Files to Modify

1. `supabase/functions/shopify-integration/index.ts` - Fix credential type
2. `supabase/functions/calendar-integration/index.ts` - Fix secret names
3. `supabase/functions/google-sheets-integration/index.ts` - Use shared crypto

---

## Testing Recommendations

After implementing fixes, test each integration:

1. **Shopify**: Connect a store → Verify credentials stored with `shopifyApi` type → Test shop info retrieval
2. **Google Calendar**: Connect account → Let token expire → Verify refresh works
3. **Google Sheets**: Connect account → List spreadsheets → Verify encrypted token decryption works

---

## Risk Assessment

| Fix | Risk Level | Rollback Complexity |
|-----|-----------|---------------------|
| Shopify credential type | Low | Simple string change |
| Calendar secret names | Low | Simple string change |
| Google Sheets crypto refactor | Medium | Larger code change, but uses proven shared code |

All changes are backward compatible - existing credentials will continue to work as the shared utilities support both encrypted and plaintext tokens.
