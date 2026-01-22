

# Plan: Fix Calendly OAuth Client ID Mismatch

## Problem

The Calendly OAuth is failing with `invalid_client` (401) because there's a **Client ID mismatch** between the frontend and backend:

| Component | Source | Current Value |
|-----------|--------|---------------|
| Frontend | `VITE_CALENDLY_CLIENT_ID` in `.env` | Empty (`""`), falls back to hardcoded: `Nnj-dmLFXc9lRSx6m7I5g2xEv33H4AEUCeQJA6rW-fI` |
| Backend | `CALENDLY_OAUTH_CLIENT_ID` secret | Unknown (likely different value) |

When Calendly receives the authorization code with one Client ID but the token exchange uses a different Client ID, it returns `invalid_client`.

## Solution

Ensure both frontend and backend use the **same** Calendly OAuth Client ID.

### Option A: Update `.env` file (Recommended)

Set `VITE_CALENDLY_CLIENT_ID` in the `.env` file to match the value stored in `CALENDLY_OAUTH_CLIENT_ID` secret.

**Steps:**
1. Retrieve the correct Client ID from your Calendly OAuth application settings
2. Update `.env` to set `VITE_CALENDLY_CLIENT_ID` to that value
3. Ensure `CALENDLY_OAUTH_CLIENT_ID` secret has the same value

### Option B: Remove hardcoded fallback

Update `src/config/oauth.ts` to remove the hardcoded fallback and require the environment variable:

```typescript
CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || "",
```

Then add a check to show an error if the Client ID is not configured.

## Calendly Developer Portal Setup Verification

Before connecting, verify in the [Calendly Developer Portal](https://developer.calendly.com/):

1. **Redirect URI** is set to: `https://workspace.elixa.app/oauth/callback`
2. **Client ID** matches what's in both `.env` and the secrets
3. **Client Secret** matches `CALENDLY_OAUTH_CLIENT_SECRET` secret

## Implementation Steps

1. **Update `.env`**: Set `VITE_CALENDLY_CLIENT_ID` to your actual Calendly Client ID
2. **Verify secrets**: Ensure `CALENDLY_OAUTH_CLIENT_ID` and `CALENDLY_OAUTH_CLIENT_SECRET` in Lovable Cloud secrets match your Calendly app
3. **Test connection**: Click Connect on Calendly in the Connections page

## What You Need To Do

Please confirm or provide:
1. What is your Calendly OAuth Client ID? (You can find this in the Calendly Developer Portal under your app's settings)
2. Is the redirect URI `https://workspace.elixa.app/oauth/callback` configured in your Calendly app?

Once confirmed, I can update the configuration to ensure both frontend and backend use matching credentials.

