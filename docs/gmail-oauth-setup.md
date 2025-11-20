# Setting Up Gmail OAuth for Agent Marketplace

This guide explains how to configure Gmail (Google) OAuth so users can connect their Gmail accounts to workflow-based agents.

## Prerequisites

You need a Google Cloud Project with OAuth 2.0 credentials configured.

## Step 1: Create Google Cloud OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API and Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API" and click "Enable"
   - Search for "Google Sheets API" and click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Agent Marketplace OAuth"
   - Authorized JavaScript origins:
     - Add your preview URL (e.g., `https://your-project.lovable.app`)
     - Add your production domain if deployed
   - Authorized redirect URIs:
     - Add `https://your-project.lovable.app/oauth/callback`
     - Add your production callback URL if deployed
   - Click "Create"

5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (or "Internal" if using Google Workspace)
3. Fill in application information:
   - App name: "Your Agent Marketplace"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send` - Send emails
   - `https://www.googleapis.com/auth/spreadsheets` - Read/write Google Sheets
   - `https://www.googleapis.com/auth/userinfo.email` - User email
   - `https://www.googleapis.com/auth/userinfo.profile` - User profile
5. Add test users (if app is not published)
6. Save

## Step 3: Add Secrets to Lovable Cloud

You need to add the Google OAuth credentials as secrets:

1. Open your Lovable Cloud backend
2. Go to Settings → Secrets
3. Add the following secrets:
   - `GOOGLEOAUTH2API_CLIENT_ID` = Your Google Client ID
   - `GOOGLEOAUTH2API_CLIENT_SECRET` = Your Google Client Secret
   - `SITE_URL` = Your application URL (e.g., `https://your-project.lovable.app`)

## Step 4: Update OAuth URLs in Code

After adding the secrets, you need to update the `getOAuthUrl` function in `AgentOAuthSetup.tsx` to use the actual client ID:

Replace this line:
```typescript
googleOAuth2Api: `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=YOUR_GOOGLE_CLIENT_ID&` +
```

With:
```typescript
googleOAuth2Api: `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
```

But since we can't access secrets on the frontend, we need to either:
1. Store just the Client ID in the environment (it's not sensitive)
2. Or create an edge function to generate the OAuth URL

**Recommended: Store Client ID as environment variable** (it's public anyway):
- Add `VITE_GOOGLE_CLIENT_ID` to your project settings in Lovable Cloud

## Step 5: Same Process for Other Services

### Notion OAuth
1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Set redirect URI to `https://your-project.lovable.app/oauth/callback`
4. Add secrets: `NOTIONAPI_CLIENT_ID` and `NOTIONAPI_CLIENT_SECRET`

### Slack OAuth
1. Go to https://api.slack.com/apps
2. Create a new app
3. Configure OAuth & Permissions with redirect URI
4. Add secrets: `SLACKOAUTH2API_CLIENT_ID` and `SLACKOAUTH2API_CLIENT_SECRET`

## How It Works

1. User installs a workflow-based agent
2. Agent detail page shows "Service Connections" section
3. User clicks "Connect" on Gmail
4. They're redirected to Google's OAuth consent screen
5. After approving, Google redirects back to `/oauth/callback?code=...&state=...`
6. The callback page calls `exchange-oauth-token` edge function
7. Edge function exchanges the code for access/refresh tokens
8. Tokens are stored in `agent_configurations` table
9. When agent runs, tools use these tokens to call Gmail API

## Testing

1. Install a workflow-based agent that requires Gmail
2. Go to the agent detail page
3. Click "Connect" on Gmail
4. You should be redirected to Google OAuth
5. After approving, you'll be redirected back and see "Connected" status

## Security Notes

- Client Secret is stored securely in Supabase Secrets
- Access tokens are stored in the database with encryption
- Refresh tokens allow automatic token renewal
- Users can disconnect at any time
- Tokens are scoped to minimum required permissions
