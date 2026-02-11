

# Fix Test Console for TypeScript Agents

## Problem
The test-agent edge function currently routes ALL platform-hosted agents through `execute-python-agent`, which requires an external Python sandbox (Piston). Your agent is TypeScript, so this path fails.

## Solution
Update the `test-agent` edge function to handle TypeScript agents directly. Since edge functions already run in a Deno/TypeScript environment, we can dynamically import and execute TypeScript agent code without any external service.

For TypeScript agents, the function will:
1. Download the agent's code file from storage
2. Execute it inline using `eval` or dynamic import (with the standardized `handle` contract)
3. Return the result directly

For Python agents, the existing `execute-python-agent` path remains unchanged (for future use when Piston is configured).

## Changes

### File: `supabase/functions/test-agent/index.ts`

Update the execution logic to branch by runtime:

- **TypeScript agents** (`runtime === "typescript"`): Download the code, use dynamic import via a data URI to execute the entry function directly in the Deno runtime. No external service needed.
- **Python agents** (`runtime === "python"`): Keep the existing proxy to `execute-python-agent` (requires `PYTHON_EXECUTOR_URL`).

The agent lookup query will be updated to also fetch `runtime` from the `agent_submissions` table.

### Execution Flow for TypeScript Agents

```text
1. Authenticate user, verify agent ownership
2. Fetch agent record (including runtime, code_file_url, entry_function)
3. If runtime === "typescript":
   a. Download code from code_file_url
   b. Create a Blob/data URI from the code
   c. Dynamically import and call the entry function
   d. Return the result
4. If runtime === "python":
   a. Proxy to execute-python-agent (existing flow)
```

### No Frontend Changes Required
The `AgentTestConsole.tsx` already sends requests to the `test-agent` function correctly -- only the backend logic changes.

