

# Execute Developers' Exact Python Code on the Platform

## The Problem

Currently, when a developer uploads Python code and selects "Host with Elixa," the orchestrator ignores their code and instead uses the system prompt + tools via the internal chat function. The uploaded file is just stored as a reference.

## Solution: External Code Execution Service

Since the platform runs on TypeScript/Deno (no Python runtime), we need a bridge to execute Python. The approach is to create a new edge function (`execute-python-agent`) that calls an external sandboxed Python execution API.

### How It Works

1. Developer uploads their `.py` or `.zip` code file during submission
2. When the agent is invoked, the orchestrator detects `hosting_type = "platform"` and `code_file_url` is present
3. The orchestrator calls the new `execute-python-agent` edge function
4. That function downloads the developer's code from storage, sends it to a sandboxed Python execution service, and returns the result

### Execution Service Options

We'll use a **code execution API** (such as Piston, Judge0, or a self-hosted runner). The edge function will:
- Download the developer's code from the `agent-assets` storage bucket
- POST the code + the user's message to the execution API
- The execution API runs the code in a sandboxed container with the specified requirements installed
- Return the agent's response back through the orchestrator

For the initial implementation, we'll use **Piston API** (open-source, supports Python, free to self-host) or a configurable endpoint so you can swap in any runner later.

---

## Database Changes

Add a column to `agent_submissions`:

| Column | Type | Purpose |
|--------|------|---------|
| `execution_status` | text | "ready", "building", "error" -- tracks if the agent's environment is set up |
| `execution_error` | text | Last error from code execution, for developer debugging |

---

## New Edge Function: `execute-python-agent`

A new edge function that:

1. Receives: `{ code_file_url, entry_function, requirements, message, user_id, context }`
2. Downloads the Python code from storage
3. Wraps it with a runner script that:
   - Calls the developer's `entry_function` (e.g., `handle`) with `{ "message": "...", "user_id": "...", "context": {} }`
   - Captures stdout/return value as the response
4. Sends the wrapped code to the Python execution API
5. Returns `{ response, tools_used }` back to the orchestrator

### Runner Wrapper (injected around developer code)

The execution service receives something like:

```text
# Developer's uploaded code is loaded here
{developer_code}

# Platform runner - calls their entry function
import json
_input = json.loads('''{input_json}''')
_result = {entry_function}(_input)
print(json.dumps(_result))
```

This ensures the developer's exact code runs -- we just call their specified entry function with the standardized input.

---

## Orchestrator Changes

Update the `platform` branch in `ai-employee-orchestrator`:

- Instead of falling through to the internal `chat` function, check if `code_file_url` exists
- If yes: invoke the `execute-python-agent` function with the code URL, entry function, requirements, and user message
- If no code file (legacy agents): fall back to the existing system prompt + tools flow

---

## Secret Required

A new secret for the Python execution service:

| Secret | Purpose |
|--------|---------|
| `PYTHON_EXECUTOR_URL` | Base URL of the code execution API (e.g., a Piston instance or custom runner) |
| `PYTHON_EXECUTOR_API_KEY` | Optional API key for the execution service |

---

## Frontend Changes

### PlatformHostedFields.tsx
- Add a note explaining: "Your exact code will be executed when your agent is invoked. We call your entry function with a standardized JSON input."
- Show the expected function signature:
  ```
  def handle(input: dict) -> dict:
      # input = { "message": "...", "user_id": "...", "context": {} }
      # return { "response": "...", "tools_used": [] }
  ```

### AgentList.tsx
- Show `execution_status` on agent cards (Ready / Building / Error)
- If error, show a tooltip with `execution_error`

---

## Files to Create/Modify

- **New**: `supabase/functions/execute-python-agent/index.ts` -- the Python execution bridge
- **New migration**: Add `execution_status` and `execution_error` columns to `agent_submissions`
- **Modify**: `supabase/functions/ai-employee-orchestrator/index.ts` -- route platform-hosted agents with code to the new executor
- **Modify**: `src/components/developer/PlatformHostedFields.tsx` -- add function signature docs
- **Modify**: `src/components/developer/AgentList.tsx` -- show execution status
- **Modify**: `src/hooks/useDeveloperPortal.ts` -- add new fields to the type

---

## Security Considerations

- Code runs in a sandboxed container (no access to platform infrastructure)
- Execution timeout enforced (e.g., 30 seconds max)
- Network access within the sandbox can be restricted
- The execution service is external to the platform -- developer code never runs inside edge functions directly
- Auth tokens for the execution API are stored as secrets, not exposed to developers

