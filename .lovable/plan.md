
# Endpoint Agent Execution Model

## Overview
Transition from code-upload to an **endpoint-first** agent model. Developers register an external URL + manifest. Elixa acts as orchestration/control plane: it calls the endpoint, renders responses, manages approvals, and provides a Tool Gateway for OAuth-backed tool access.

## Phase 1: Data Model

### New Migration
Add columns to `agent_submissions` and create supporting tables:

**Extend `agent_submissions`:**
- `execution_mode` TEXT DEFAULT 'native' -- 'endpoint' or 'native'
- `endpoint_base_url` TEXT
- `endpoint_invoke_path` TEXT DEFAULT '/invoke'
- `endpoint_health_path` TEXT DEFAULT '/health'
- `endpoint_auth_type` TEXT DEFAULT 'none' -- 'none', 'api_key', 'hmac'
- `endpoint_secret` TEXT -- stored as-is for now (encrypted ref later)
- `input_schema` JSONB
- `output_schema` JSONB
- `capability_manifest` JSONB -- { toolsRequired: [...], canMutate: bool, riskTier: "sandbox"|"verified"|"privileged" }

**Create `agent_installations`:**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| agent_id | UUID FK -> agent_submissions | |
| workspace_id | UUID FK -> workspaces | |
| user_id | UUID FK (no FK constraint to auth.users) | |
| requires_approval | BOOLEAN DEFAULT true | |
| permissions | JSONB DEFAULT '{}' | effective tool scopes, budget caps |
| risk_tier | TEXT DEFAULT 'sandbox' | sandbox / verified / privileged |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ DEFAULT now() | |

RLS: Users can manage their own installations; service role can insert.

**Create `agent_proposals`:**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| installation_id | UUID FK -> agent_installations | |
| request_id | UUID | matches the requestId sent to endpoint |
| user_id | UUID | |
| title | TEXT | |
| data | JSONB | structured operations from endpoint |
| status | TEXT DEFAULT 'pending' | pending / approved / rejected / executed |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| resolved_at | TIMESTAMPTZ | |
| resolved_by | UUID | |

RLS: Users can view/update their own proposals.

## Phase 2: Endpoint Agent Submission UI

### Update `HostingTypeSelector`
Add a third option card: **"Endpoint Agent"** with a globe/link icon and description: "You host the logic. We call your endpoint with a structured contract."

### New component: `EndpointAgentFields`
Step 2 fields when `execution_mode === "endpoint"`:
- Base URL (required)
- Auth Type selector: None / API Key / HMAC
- Secret field (shown for api_key and hmac)
- Invoke Path (default `/invoke`)
- Health Path (default `/health`)
- Capability Manifest editor:
  - Tools Required (multi-select from AVAILABLE_TOOLS)
  - Can Mutate toggle
  - Risk Tier selector (sandbox / verified / privileged)

### Update `AgentSubmissionForm`
- Map the new "endpoint" hosting type to `execution_mode: "endpoint"`
- Skip code upload and platform-hosted fields for endpoint agents
- Show the new `EndpointAgentFields` on step 2
- On step 3: icon upload (no actions editor needed -- actions come from endpoint response)
- Review step shows endpoint config summary

### Update `AgentDetailSheet`
- For endpoint agents, show:
  - Endpoint URL + paths
  - Auth type
  - Capability manifest (tools required, risk tier)
  - Health check button (calls the health endpoint and shows status)
  - Installation count

### Update `AgentList`
- Show an endpoint icon/badge for `execution_mode === "endpoint"` agents (distinct from platform/self-hosted)

## Phase 3: Runtime Invocation Edge Function

### New edge function: `endpoint-invoke`
Handles the full endpoint agent request lifecycle:

1. **Load agent + installation** from database
2. **Build request payload** per the strict contract:
   - requestId, workspaceId, userId, agentId, installationId, threadId
   - message, memory (from user_memories), settings (from installation)
   - toolGateway: { baseUrl, sessionToken } -- short-lived JWT scoped to installation permissions
3. **Auth the outbound request:**
   - If `api_key`: set `Authorization: Bearer <secret>`
   - If `hmac`: compute HMAC-SHA256(secret, timestamp + "." + rawBody), set X-Elixa-Request-Id, X-Elixa-Timestamp, X-Elixa-Signature headers
4. **POST to endpoint** `{base_url}{invoke_path}`
5. **Validate response** against expected shape (assistantMessage required, actions/receipts optional)
6. **Process response:**
   - Render `assistantMessage` back to caller
   - If `actions` with `type: "proposal"` exist and `requires_approval` is true, store in `agent_proposals` as pending
   - If `actions` exist and `requires_approval` is false, execute tool calls via existing tool infrastructure
   - Store `receipts` in execution logs
7. **Log everything** in `agent_execution_logs`: requestId, latency, payload hash, status

### New edge function: `endpoint-health`
Simple proxy: calls `{base_url}{health_path}` with the same auth, returns status.

### Update `ai-employee-orchestrator`
Add a new routing branch:
```text
if execution_mode === "endpoint" && endpoint_base_url:
  -> invoke endpoint-invoke function
```

## Phase 4: Tool Gateway (Phase 2 delivery, stubbed now)

### New edge function: `tool-gateway`
Handles `POST /tool-gateway/{integration}/{action}` (e.g., `/tool-gateway/google_ads/query`).

- Validates the `sessionToken` from the request (short-lived JWT)
- Checks token's scoped permissions against the requested tool
- If the tool is a mutation and `requires_approval` is true:
  - Store as pending proposal, return `{ "status": "pending_approval", "proposalId": "..." }`
- If allowed:
  - Use Elixa's OAuth credentials to execute the tool call via existing integration edge functions
  - Return the result
- Log the tool call in `tool_execution_log`

For this initial implementation, the tool gateway will support a limited set of integrations (Google Ads query/mutate) and can be extended.

### Session Token Generation
- Create a utility in the `endpoint-invoke` function that generates a short-lived JWT (e.g., 15 min TTL)
- Token payload: `{ installationId, agentId, userId, permissions, exp }`
- Signed with a server-side secret (SUPABASE_SERVICE_ROLE_KEY or dedicated secret)

## Phase 5: Test Console + Health Check

### Update `AgentTestConsole`
For endpoint agents:
- Show the full invoke contract as the default request body (pre-populated with sample data)
- Send test requests through the `endpoint-invoke` edge function (not direct fetch)
- Parse and display the structured response: assistantMessage, actions, receipts in separate sections

### Health Check in Detail Sheet
- "Check Health" button calls `endpoint-health`
- Shows green/red status with response time

## Phase 6: Installation Flow (Workspace Side)

### Update AI Employees page
- When an approved endpoint agent exists, allow users to "Install" it into their workspace
- Installation creates a row in `agent_installations` with default permissions
- Installed endpoint agents appear alongside native AI employees
- Chat with installed endpoint agents routes through `endpoint-invoke`

## Files to Create
| File | Purpose |
|------|---------|
| `src/components/developer/EndpointAgentFields.tsx` | Submission form fields for endpoint agents |
| `supabase/functions/endpoint-invoke/index.ts` | Runtime invocation edge function |
| `supabase/functions/endpoint-health/index.ts` | Health check proxy |
| `supabase/functions/tool-gateway/index.ts` | Tool gateway for endpoint agents |

## Files to Modify
| File | Change |
|------|--------|
| `src/components/developer/HostingTypeSelector.tsx` | Add "Endpoint Agent" option |
| `src/components/developer/AgentSubmissionForm.tsx` | Wire up endpoint flow, new step logic |
| `src/components/developer/AgentDetailSheet.tsx` | Endpoint config display, health check |
| `src/components/developer/AgentList.tsx` | Endpoint badge/icon |
| `src/components/developer/AgentTestConsole.tsx` | Endpoint test mode |
| `src/hooks/useDeveloperPortal.ts` | Handle endpoint agent creation, update types |
| `supabase/functions/ai-employee-orchestrator/index.ts` | Route endpoint agents |
| `supabase/config.toml` | Register new edge functions |

## Implementation Order
1. Database migration (tables + columns)
2. Submission UI (HostingTypeSelector, EndpointAgentFields, form wiring)
3. `endpoint-invoke` + `endpoint-health` edge functions
4. Orchestrator routing update
5. Test console updates
6. `tool-gateway` edge function (stub with Google Ads support)
7. Installation flow on workspace side

## Security Considerations
- Endpoint secrets are stored in the database. A future improvement would encrypt them at rest using the existing `CREDENTIAL_ENCRYPTION_KEY` pattern.
- HMAC signing prevents replay attacks via timestamp window validation (5 min).
- Tool gateway session tokens are short-lived (15 min) and scoped to installation permissions.
- `requires_approval` defaults to true -- no mutating tool calls without user consent.
- RLS policies ensure users can only see/manage their own installations and proposals.
