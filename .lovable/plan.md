

# Enable Test Console for Platform-Hosted Agents

## Problem
The Test Console is currently restricted to self-hosted agents only. Platform-hosted agents (like your "google Ads" agent) cannot be tested from the detail sheet.

## Solution
Extend the Test Console visibility to also cover platform-hosted agents that have a `code_file_url` and are in "ready" execution status. For platform-hosted agents, the console will call the agent through a backend function proxy (since the code runs server-side, not at a browser-accessible URL).

## Changes

### 1. Update `AgentDetailSheet.tsx`
Change the visibility condition to also show the test console for platform-hosted agents with `execution_status === "ready"`:

```
Before: self_hosted && external_endpoint_url
After:  (self_hosted && external_endpoint_url) OR (platform && execution_status === "ready")
```

### 2. Update `AgentTestConsole.tsx`
- For platform-hosted agents, send the test request through a backend function (`test-agent`) instead of directly to an external URL
- Remove the action selector for platform agents (they only have the single `handle` entry point)
- Show target as the agent name rather than a URL for platform agents

### 3. Create Edge Function `supabase/functions/test-agent/index.ts`
A new backend function that:
- Accepts `{ agent_id, message }` in the request body
- Looks up the agent's `code_file_url` and `entry_function` from the database
- Executes the agent's code and returns the result
- Requires authentication (developer must own the agent)

## Technical Details

### Files to Modify
| File | Change |
|------|--------|
| `src/components/developer/AgentDetailSheet.tsx` | Expand test console visibility condition |
| `src/components/developer/AgentTestConsole.tsx` | Add platform-hosted path using edge function proxy |

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/test-agent/index.ts` | Backend proxy to execute platform-hosted agent code for testing |

### Test Console Behavior by Hosting Type

**Self-Hosted**: No change -- sends requests directly to the agent's external URL with configured auth headers.

**Platform-Hosted**: Sends a POST request to the `test-agent` backend function with the agent ID and test message. The backend function handles execution and returns the response.

