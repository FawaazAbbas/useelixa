
# Fix Email Integration - Secret Name Mismatch

## Problem Summary

The Email page shows a 500 error because the Gmail integration edge function cannot refresh the expired OAuth token. The token refresh function uses incorrect environment variable names.

## Root Cause

**Secret naming mismatch in `gmail-integration/index.ts`:**

| Current Code (Wrong) | Configured Secret (Correct) |
|---------------------|----------------------------|
| `GOOGLE_OAUTH_CLIENT_ID` | `GOOGLEOAUTH2API_CLIENT_ID` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `GOOGLEOAUTH2API_CLIENT_SECRET` |

The refresh function on lines 433-434 looks for secrets that don't exist, causing it to return null and fail the refresh.

## Solution

Update the `refreshGoogleToken` function in `supabase/functions/gmail-integration/index.ts` to use the correct secret names.

### Change Required

**File:** `supabase/functions/gmail-integration/index.ts`

**Lines 433-434:**

```text
Before:
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");

After:
  const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");
```

## Technical Details

The flow after the fix:

```text
1. User opens Email page
2. gmail-integration is called with action: "list"
3. Credentials fetched (bundle_type: "gmail_calendar") ✓
4. Tokens decrypted successfully ✓
5. Token expiry detected (expired Jan 23) ✓
6. Refresh token used with CORRECT client ID/secret ✓ (fix)
7. New access token saved
8. Gmail API called successfully
9. Emails displayed
```

## Impact

- **Fix applies to:** Gmail list, read, send, reply, search, labels, trash, markRead actions
- **No user action required:** Token will auto-refresh on next request
- **Time to fix:** ~1 minute code change + edge function redeployment
