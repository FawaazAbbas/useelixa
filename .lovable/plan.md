
# Two Hosting Options for AI Agents: Self-Hosted vs Platform-Hosted

## Overview

Give developers two ways to deploy their AI agents:

1. **Self-Hosted** -- Developer runs their agent on their own infrastructure and provides an API endpoint URL. The platform calls that endpoint when the agent is invoked.
2. **Hosted by Elixa** -- Developer uploads their Python code (as a `.py` or `.zip` file) to the platform. The orchestrator stores the code and executes it via a secure sandboxed runner.

---

## Database Changes

Add new columns to `agent_submissions`:

| Column | Type | Purpose |
|--------|------|---------|
| `hosting_type` | text | `"platform"` (default, hosted by us) or `"self_hosted"` |
| `runtime` | text | `"python"`, `"typescript"`, or `"other"` -- defaults to `"python"` |
| `external_endpoint_url` | text | Required when self-hosted -- the URL we call |
| `external_auth_header` | text | Optional auth header key for self-hosted endpoints |
| `external_auth_token` | text | Optional auth token value (stored securely) |
| `code_file_url` | text | For platform-hosted -- URL to uploaded Python code in storage |
| `requirements` | text | For platform-hosted -- pip requirements as text (e.g. contents of requirements.txt) |
| `entry_function` | text | For platform-hosted -- the function to call, defaults to `"handle"` |

---

## Submission Form Changes (Step-by-Step)

### Step 1 (Basic Info) -- Add hosting type selector

Two clear cards the developer chooses between:

- **"Host with Elixa"** -- Upload your Python code and we run it for you. No infrastructure needed.
- **"Self-Hosted"** -- You run the agent on your own server and give us the endpoint URL.

### Step 2 (Configuration) -- Changes based on hosting type

**If Platform-Hosted:**
- Python code file upload (`.py` or `.zip`, stored in `agent-assets` bucket)
- Requirements text area (paste your `requirements.txt` contents)
- Entry function name (defaults to `handle`)
- System prompt (optional, can be baked into the code)
- Allowed tools selection (same as before)

**If Self-Hosted:**
- Endpoint URL field (required)
- Authentication header name (optional, e.g. `X-API-Key`)
- Authentication token (optional)
- A collapsible section showing the expected API contract:
  - Request format: `POST` with `{ message, user_id, context }`
  - Response format: `{ response, tools_used }`

### Step 4 (Review) -- Show hosting details

Display the hosting type, runtime, and relevant fields (endpoint URL or uploaded file name).

---

## Agent List Changes

- Show a badge on each agent card: "Platform Hosted" or "Self-Hosted"
- Show the runtime (Python / TypeScript) as a small label

---

## Orchestrator Changes

Update `ai-employee-orchestrator` edge function to handle both types:

1. Look up the agent's `hosting_type`
2. **If `"self_hosted"`**: Make a `fetch()` call to the `external_endpoint_url` with the standardized payload, including auth headers if configured
3. **If `"platform"`**: For now, store the code reference and call a future code execution service. Initially, platform-hosted agents will use the existing native flow (system prompt + tools) while code execution is built out -- the uploaded code serves as a reference during the review process

---

## Storage

Use the existing `agent-assets` bucket for uploaded Python code files alongside icons. Files will be stored under the developer's user ID folder (e.g., `{userId}/code/{timestamp}.py`).

---

## Files to Modify

- **New migration**: Add columns to `agent_submissions`
- **`src/components/developer/AgentSubmissionForm.tsx`**: Add hosting type selector, conditional fields for each type, code upload
- **`src/components/developer/AgentList.tsx`**: Add hosting type and runtime badges
- **`src/hooks/useDeveloperPortal.ts`**: Update `AgentSubmission` interface with new fields
- **`supabase/functions/ai-employee-orchestrator/index.ts`**: Add self-hosted endpoint routing logic
