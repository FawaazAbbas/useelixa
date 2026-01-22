
Goal: Fix Calendly OAuth “invalid_client” (401) during token exchange.

What the logs show
- The OAuth callback is reaching the backend function successfully, and the backend confirms it can read the Calendly Client ID + Client Secret (“✓ OAuth config found for calendlyApi”).
- Calendly’s token endpoint responds 401 with: “unknown client, no client authentication included, or unsupported authentication method.”
- This specific Calendly error commonly occurs when the token request uses the wrong client authentication method (not using the required Basic auth header), even if the client ID/secret values are correct.

Root cause (most likely)
- Our Calendly token exchange currently sends `client_id` and `client_secret` in the x-www-form-urlencoded body.
- Calendly expects client authentication via an `Authorization: Basic base64(client_id:client_secret)` header for the token call (with `Content-Type: application/x-www-form-urlencoded`), plus PKCE `code_verifier` in the body.
- Because the backend is not authenticating the client in the supported way, Calendly returns `invalid_client`.

Implementation changes (code)
1) Update backend token exchange for Calendly to use Basic Auth
   - File: `supabase/functions/exchange-oauth-token/index.ts`
   - In the `credentialType === "calendlyApi"` branch:
     - Build a Basic header:
       - `const basicAuth = btoa(`${clientId}:${clientSecret}`);`
     - Send request with headers:
       - `Authorization: Basic ${basicAuth}`
       - `Content-Type: application/x-www-form-urlencoded`
       - (Optional but safe) `Accept: application/json`
     - Send body params WITHOUT `client_secret` (and often also without `client_id`, since Basic auth covers it):
       - `grant_type=authorization_code`
       - `code=...`
       - `redirect_uri=...`
       - `code_verifier=...`
     - Keep PKCE requirement (already present) and keep returning structured JSON on failure (already present).

   Why this should work:
   - It matches Calendly’s supported client authentication method for the token endpoint and aligns with real-world working examples.

2) (Recommended hardening) Remove the Calendly hardcoded fallback Client ID on the frontend
   - File: `src/config/oauth.ts`
   - Change:
     - `CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || "Nnj-..."`
   - To:
     - `CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || ""`
   - Add a guard similar to Google’s:
     - If `OAUTH_CLIENT_IDS.CALENDLY` is empty, return `null` from `getOAuthUrl("calendly")` and show a clear error/toast.
   Why:
   - Prevents future mismatches where the UI silently uses a fallback while the backend uses configured secrets, causing confusing OAuth failures.

Verification plan (after implementation)
1) Retry Calendly connect from `/connections`.
2) If it still fails, use the correlation ID to inspect backend logs again and confirm:
   - The request includes `Authorization: Basic ...` (we won’t log the value, but we can log that the header is being set).
   - The body includes `code_verifier` and `redirect_uri`.
3) If still `invalid_client` after Basic auth is implemented:
   - The remaining likely cause is an incorrect Calendly Client Secret in `CALENDLY_OAUTH_CLIENT_SECRET` (or the client is from a different Calendly app/environment than the secret).
   - Next step would be to re-check/re-enter the Calendly Client Secret in Lovable Cloud secrets and retry.

Edge cases to keep in mind
- Redirect URI must match exactly (it appears correct: `https://workspace.elixa.app/oauth/callback`).
- Authorization codes are one-time use; repeated retries may require starting a fresh connect flow.
- PKCE verifier is stored in sessionStorage; private browsing or strict settings could clear it, but we already confirmed the earlier “missing code_verifier” issue is fixed.

Deliverables
- Backend fix: Calendly token exchange uses Basic auth (primary fix).
- Frontend hardening: remove fallback client id for Calendly to avoid future drift (recommended).

No backend schema changes required.
