

# Connecting Developer Agents to User OAuth: End-to-End Plan

## The Problem

Right now there are three disconnected pieces:

1. **Developer Side**: When submitting an agent, the developer selects "Tools Required" (e.g. Gmail, Google Sheets, Slack) in the capability manifest -- but there's no guidance on what code to write to actually *use* those tools via the Tool Gateway.

2. **User Side**: When a user installs an agent from the marketplace, the system doesn't check whether they have the required OAuth connections. The agent gets installed, then fails silently when it tries to call the Tool Gateway for an integration the user hasn't connected.

3. **Runtime**: The Tool Gateway checks permissions from the session token but doesn't verify whether the user actually has valid OAuth credentials for the requested integration.

## The Solution

Wire up all three layers so that:
- Developers get clear, copy-paste code examples for calling the Tool Gateway
- Users see exactly which connections an agent needs *before* installing, and are prompted to connect missing ones
- The Tool Gateway validates credential availability at runtime and returns a clear error if missing

---

## Phase 1: Improve Developer Docs and Submission UX

### 1a. Enhanced API Docs -- Tool Gateway Code Samples

Update `src/components/developer/ApiDocsPage.tsx` to add a new section with **language-specific code examples** showing how an agent should call the Tool Gateway from its `/invoke` handler:

```text
# From your /invoke handler, use the toolGateway object:

POST {toolGateway.baseUrl}
Authorization: Bearer {toolGateway.sessionToken}

Body:
{
  "integration": "gmail",
  "action": "list_messages",
  "params": { "maxResults": 10 }
}
```

Include examples in Python (requests), Node.js (fetch), and a curl snippet. List all available integrations and their supported actions.

### 1b. Submission Form -- Integration Picker with Descriptions

Update `src/components/developer/EndpointAgentFields.tsx` to show each tool badge with a tooltip explaining what it unlocks (e.g. "Gmail -- read/send emails via Tool Gateway"). This helps developers understand what selecting a tool actually means.

---

## Phase 2: Pre-Install OAuth Check for Users

### 2a. Marketplace Card -- Show Required Connections

Update `src/components/ai-employees/AgentMarketplace.tsx` to display the `toolsRequired` from each agent's `capability_manifest`. Show badges like "Requires: Gmail, Slack" on each card.

### 2b. Install Flow -- Check and Prompt for Missing OAuth

Update the `installAgent` function in `src/pages/AIEmployees.tsx`:

1. Before inserting into `agent_installations`, fetch the agent's `capability_manifest.toolsRequired`
2. Cross-reference against the user's `user_credentials` to find missing connections
3. If connections are missing, show a dialog listing what's needed with "Connect" buttons that link to `/connections`
4. Allow the user to proceed anyway (with a warning) or connect first

Create a new component `src/components/ai-employees/MissingConnectionsDialog.tsx`:
- Lists required integrations with their logos
- Shows green checkmarks for connected ones, red X for missing
- "Connect Now" buttons that navigate to `/connections` with a return parameter
- "Install Anyway" button with a warning that the agent may not work fully

### 2c. Agent Detail / Settings -- Connection Status

Update `src/components/ai-employees/AgentSettingsPanel.tsx` to show a "Required Connections" section that displays the status of each OAuth connection the agent needs, with quick-connect links.

---

## Phase 3: Runtime Credential Validation in Tool Gateway

### 3a. Add Credential Check to Tool Gateway

Update `supabase/functions/tool-gateway/index.ts`:

Before routing to the integration function, check that the user has valid credentials:

```text
1. Extract userId from the session token
2. Look up user_credentials for the requested integration
3. If no credential found, return 403 with a clear message:
   { "error": "missing_connection", "integration": "gmail",
     "message": "User has not connected Gmail. Please connect it in Settings > Connections." }
4. If credential is expired, attempt auto-refresh; if refresh fails, return the same error
```

This prevents cryptic failures deep in integration functions.

### 3b. Surface Gateway Errors in Chat

Update the chat UI to handle `missing_connection` errors from agent responses gracefully -- showing a toast or inline prompt to connect the missing service rather than a generic error.

---

## Phase 4: OAuth Credential Mapping Table

Create a shared mapping (used by both frontend and backend) that connects:

```text
Tool Gateway integration name --> credential_type --> OAuth provider --> bundle_type
```

For example:
| Gateway Integration | credential_type    | OAuth Provider | bundle_type      |
|--------------------|--------------------|----------------|------------------|
| gmail              | googleOAuth2Api    | google         | gmail            |
| google_sheets      | googleOAuth2Api    | google         | google_sheets    |
| slack              | slackOAuth2Api     | slack          | (none)           |
| notion             | notionApi          | notion         | (none)           |
| shopify            | shopifyApi         | shopify        | (none)           |
| stripe             | stripeApi          | stripe         | (none)           |

This mapping currently exists partially in `Connections.tsx` (frontend) and `tool-gateway/index.ts` (backend) but they're not aligned. We'll create a shared config file.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ai-employees/MissingConnectionsDialog.tsx` | Pre-install OAuth check dialog |
| `src/config/integrationMapping.ts` | Shared integration-to-credential mapping |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/developer/ApiDocsPage.tsx` | Add Tool Gateway code examples (Python, Node, curl) |
| `src/components/developer/EndpointAgentFields.tsx` | Add tool descriptions/tooltips |
| `src/components/ai-employees/AgentMarketplace.tsx` | Show required connections on cards |
| `src/pages/AIEmployees.tsx` | Pre-install credential check + dialog trigger |
| `src/components/ai-employees/AgentSettingsPanel.tsx` | Show connection status for installed agent |
| `supabase/functions/tool-gateway/index.ts` | Add credential existence check before routing |

## No Database Changes Required

The `capability_manifest` JSON column on `agent_submissions` already stores `toolsRequired`. The `user_credentials` table already tracks connected services. We just need to connect these two pieces.

