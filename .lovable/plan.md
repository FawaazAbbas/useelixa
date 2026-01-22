
# Deep Analysis: Gmail Email Sending Not Working

## Root Causes Identified

After extensive investigation, I found **multiple issues** preventing Gmail email sending:

### Issue 1: AI Model Not Invoking Tools (Primary Issue)
The chat message history reveals that when users ask to "send an email", the AI often responds with text questions instead of invoking the `gmail_send_email` tool. For example:
- User: "send an email to fawaazabbas2@gmail.com about something random"
- AI: "I can help with that! What would you like the subject and body of the email to be?"

The AI should instead **invoke the tool directly** when the user provides enough information, or compose a sensible email and request confirmation.

**Cause**: The system prompt needs stronger guidance to proactively use tools rather than asking follow-up questions.

### Issue 2: Missing Execute Handlers for New Gmail Tools
The `execute-pending-action` function only handles 3 tools:
- `gmail_send_email` (handled)
- `calendar_create_event` (handled)
- `notes_create` (handled)

**Missing handlers for**:
- `gmail_reply`
- `gmail_modify_labels`
- `gmail_trash`

When users approve these actions, they will fail with "Unknown tool" error.

### Issue 3: Scope Verification May Be Blocking
The `verifyToolScope` function checks `tool_scope_requirements` table. If Gmail tools are listed there but scopes don't match, the tool won't execute.

---

## Solution Plan

### Step 1: Update AI System Prompt
Modify the system prompt in `supabase/functions/chat/index.ts` to be more proactive:
- When user says "send email to X about Y", compose a reasonable email and invoke the tool
- Only ask for clarification if critical information (recipient) is truly missing
- Use the "REQUIRES CONFIRMATION" mechanism rather than asking via text

### Step 2: Add Missing Execute Handlers
Update `supabase/functions/execute-pending-action/index.ts` to handle:
- `gmail_reply` - call gmail-integration with action "reply"
- `gmail_modify_labels` - call gmail-integration with action "modifyLabels"
- `gmail_trash` - call gmail-integration with action "trash"
- `gcal_create_event` - fix the mismatched tool name (should match chat function)

### Step 3: Verify Scope Requirements
Query and update the `tool_scope_requirements` table to ensure Gmail tools are properly configured.

### Step 4: Enhance Error Logging
Add more detailed logging to the chat function to track when tools are invoked vs when the AI decides not to invoke them.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/chat/index.ts` | Update SYSTEM_PROMPT to be more proactive about using Gmail tools |
| `supabase/functions/execute-pending-action/index.ts` | Add handlers for `gmail_reply`, `gmail_modify_labels`, `gmail_trash`, and fix `gcal_create_event` |

---

## Technical Details

### Updated System Prompt (Key Section)
The prompt should instruct the AI:
```text
When a user asks you to send an email:
1. If they provide a recipient email, compose a sensible email based on context
2. Include subject and body in the gmail_send_email tool call
3. The user will approve/deny via the confirmation UI - DO NOT ask for confirmation in text
4. Only ask questions if the recipient email is missing

Example: "send an email to john@example.com about our meeting"
Action: Call gmail_send_email with to="john@example.com", subject="Regarding Our Meeting", body="Hi John,\n\nI wanted to follow up about our upcoming meeting..."
```

### Execute Handler Additions
```typescript
case "gmail_reply": {
  const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reply", params: toolArgs }),
  });
  result = await response.json();
  break;
}

case "gmail_modify_labels": {
  const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "modifyLabels", params: toolArgs }),
  });
  result = await response.json();
  break;
}

case "gmail_trash": {
  const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "trash", params: toolArgs }),
  });
  result = await response.json();
  break;
}

case "gcal_create_event": {
  const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "google_create", params: toolArgs }),
  });
  result = await response.json();
  break;
}
```

---

## Expected Outcome
After implementation:
1. AI will proactively compose and send emails when given sufficient context
2. Users will see Approve/Deny buttons for email actions
3. Clicking Approve will successfully send the email via Gmail API
4. All Gmail write tools (send, reply, modify labels, trash) will work end-to-end
