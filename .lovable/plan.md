
# Automatic Agent Validation on Submission

## The Problem
Right now, you can submit a broken agent and have no idea it doesn't work until you manually open the Test Console and hit "Send Request". There's zero upfront validation -- no syntax checking, no test execution, no feedback. The submission form also shows Python examples even when TypeScript is selected, and the file upload accepts `.py` but not `.ts` files for TypeScript agents.

## The Solution
Add a comprehensive **automatic validation step** that runs right after submission, catching all problems before the agent can be submitted for review. This includes:

1. **Automatic validation run after agent creation** -- immediately test-executes the agent and stores the result
2. **Health status badge on every agent card** -- so you can see at a glance if your agent works
3. **Detailed validation report** -- shown in the agent detail sheet with clear error messages
4. **Block "Submit for Review" on broken agents** -- can't submit what doesn't work
5. **Fix submission form issues** -- correct file types, runtime-aware examples

---

## Changes

### 1. Edge Function: `supabase/functions/test-agent/index.ts`
- Improve error handling to catch and return detailed, categorized errors:
  - **Download errors** (code file unreachable)
  - **ZIP extraction errors** (no valid entry file found)
  - **Syntax errors** (code can't be parsed)
  - **Runtime errors** (entry function missing, throws exception)
  - **Timeout errors** (execution takes too long)
- Strip `import`/`export` statements from code before `AsyncFunction` execution (since `AsyncFunction` doesn't support ES modules) and provide a clear warning
- Return structured error responses with `error_type` and `error_details` fields

### 2. Hook: `src/hooks/useDeveloperPortal.ts`
- After `createAgent` succeeds, automatically invoke the `test-agent` edge function with a test message
- Update `agent_submissions.execution_status` to `"error"` and `execution_error` to the error message if the test fails
- Update to `"ready"` if the test passes
- Add a `validateAgent(id)` function that can be called manually to re-validate

### 3. Component: `src/components/developer/AgentSubmissionForm.tsx`
- After the agent is created, show a validation progress indicator ("Validating your agent...")
- Display validation results inline: green checkmark if it works, red error panel with details if it fails
- Navigate the user to the agent detail sheet on completion so they can see the full report

### 4. Component: `src/components/developer/PlatformHostedFields.tsx`
- Update the code example block to show TypeScript or Python based on the selected `runtime`
- Update file accept attribute: `.ts,.zip` for TypeScript, `.py,.zip` for Python
- Update the label accordingly

### 5. Component: `src/components/developer/AgentList.tsx`
- Add a health indicator icon to each agent card:
  - Green checkmark for `execution_status === "ready"` 
  - Red alert icon for `execution_status === "error"` (with tooltip showing the error)
  - Yellow spinner for `execution_status === "building"`

### 6. Component: `src/components/developer/AgentDetailSheet.tsx`
- Add a prominent **Validation Status** section near the top
- If there's an error, show it in a clear error panel with the full error message
- Add a "Re-validate" button that re-runs the test
- Block the "Submit for Review" button if `execution_status === "error"` with a message explaining why

---

## Technical Details

### Import Statement Handling in AsyncFunction
The `AsyncFunction` constructor cannot handle `import` or `export` statements. The edge function will:
1. Strip `import ... from "..."` and `export` keywords from the code
2. If imports are detected, include a warning in the response: "Note: import statements were stripped. Your agent should be self-contained or use only Deno globals."
3. Catch syntax errors from `AsyncFunction` construction separately and report them clearly

### Validation Flow
```text
1. User clicks "Create Agent"
2. Code file uploads to storage
3. Agent record created in database (status: "building")
4. Auto-validation runs:
   a. Call test-agent with { message: "__validation_test__" }
   b. If success: update execution_status = "ready"
   c. If error: update execution_status = "error", execution_error = detailed message
5. UI shows result immediately
6. "Submit for Review" only enabled when execution_status = "ready"
```

### Error Categories Returned
| Category | Example | User Message |
|----------|---------|-------------|
| `download_error` | 404 on code file | "Could not download your code file. Please re-upload." |
| `zip_error` | No entry file in ZIP | "No TypeScript/JavaScript file found in your ZIP. Include an index.ts or main.ts." |
| `syntax_error` | Invalid JS/TS syntax | "Your code has a syntax error: [details]" |
| `missing_entry` | No `handle` function | "Entry function 'handle' not found in your code." |
| `runtime_error` | Uncaught exception | "Your agent threw an error: [message]" |
| `timeout` | Execution > 10s | "Your agent took too long to respond (>10s)." |
