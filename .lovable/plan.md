

# Fix: Handle ZIP Code Files in Test Agent

## Problem
Your agent's code file is uploaded as a **`.zip`** archive (`1770836816546.zip`). The `test-agent` edge function downloads this file and tries to execute it directly as JavaScript/TypeScript using `AsyncFunction`. Since the downloaded content is raw ZIP binary data (not valid code), it throws **"Invalid or unexpected token"**.

## Solution
Update the `test-agent` edge function to detect `.zip` files and extract the entry TypeScript/JavaScript file before executing it.

## Changes

### File: `supabase/functions/test-agent/index.ts`

1. **Detect file type** from the `code_file_url` extension
2. **If `.zip`**: use the JSZip library (available via CDN in Deno) to decompress, then locate the main entry file (e.g., `index.ts`, `main.ts`, or the file matching `entry_function`)
3. **If `.ts` or `.js`**: execute directly as before (plain text code)
4. After extracting the code text, proceed with the existing `AsyncFunction` execution logic

### ZIP Extraction Logic

```text
1. Download file from code_file_url
2. Check if URL ends with .zip
3. If ZIP:
   a. Use JSZip to decompress
   b. Search for index.ts, index.js, main.ts, or {entry_function}.ts
   c. Extract text content of the matched file
4. If plain file:
   a. Use text content directly
5. Execute via AsyncFunction as before
```

### No Frontend Changes Required
Only the backend edge function needs updating.

