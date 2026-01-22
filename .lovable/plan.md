

## Fix: Calendly OAuth Client ID Not Available

### Problem
The `VITE_CALENDLY_CLIENT_ID` environment variable isn't available to the frontend because Vite injects `VITE_*` variables at build time. The secret was added, but the running app bundle doesn't have access to it until a rebuild occurs.

### Solution
Since OAuth Client IDs are **public identifiers** (not secrets), we can safely hardcode the Calendly Client ID directly in the code — the same pattern already used for Slack, Mailchimp, and Shopify.

### Changes Required

**File: `src/config/oauth.ts`**

Update line 11 from:
```typescript
CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || "",
```

To:
```typescript
CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || "Nnj-dmLFXc9lRSx6m7I5g2xEv33H4AEUCeQJA6rW-fI",
```

### Why This Is Safe
- OAuth Client IDs are designed to be public and are visible in authorization URLs
- The Client Secret (stored securely in backend secrets as `CALENDLY_OAUTH_CLIENT_SECRET`) remains protected
- This matches the existing pattern for Notion, Microsoft, Mailchimp, and Shopify

### Result
After this change, clicking "Connect" on Calendly will immediately work without requiring a rebuild or environment variable configuration.

