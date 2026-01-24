
# Phase 2 & 3 Implementation Plan: Chat Threads, Mentions, Audit Logging & Error Handling

## Executive Summary

Based on my deep analysis of the codebase, here's what needs to be completed to fulfill the SOW requirements. The backend enforcement for **AI Pause** and **Auto-Approval** is already implemented in `supabase/functions/chat/index.ts`. The remaining work focuses on UI integrations and wiring up existing components.

---

## Implementation Overview

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| Chat Threads Integration | Components exist, need wiring | High | Medium |
| @Mentions Integration | Components exist, need wiring | Medium | Medium |
| Audit Log Triggers | Utility exists, add calls | Medium | Low |
| AI Pause Error Handling | Backend done, add UI feedback | Low | Low |

---

## Phase 2A: Chat Threads Integration

### What Exists
- `ThreadView.tsx` - Complete slide-out sheet component for viewing/replying to threads
- `ThreadIndicator` - Button showing reply count
- Database columns: `parent_message_id`, `thread_count` in `chat_messages_v2`

### What's Missing
The `ThreadView` and `ThreadIndicator` are not wired into `Chat.tsx`

### Implementation Steps

1. **Add thread state to Chat.tsx**
   - `threadParentMessage: ChatMessage | null`
   - `threadReplies: ChatMessage[]`
   - `threadOpen: boolean`
   - `threadLoading: boolean`

2. **Update useChat.ts hook**
   Add two new functions:
   ```typescript
   // Load replies for a parent message
   loadThreadReplies(parentMessageId: string): Promise<ChatMessage[]>
   
   // Send a reply to a thread (sets parent_message_id)
   sendThreadReply(parentMessageId: string, content: string): Promise<void>
   ```

3. **Update MessageBubble component**
   - Add "Start Thread" button to action menu
   - Show `ThreadIndicator` below messages with `thread_count > 0`
   - Pass `onStartThread` and `onOpenThread` callbacks

4. **Wire ThreadView into Chat.tsx**
   - Import `ThreadView` component
   - Add handlers for opening/closing threads
   - Load thread replies when opening

5. **Database update on thread reply**
   - Insert message with `parent_message_id` set
   - Increment `thread_count` on parent message using an update

### Files to Modify
- `src/pages/Chat.tsx` - Add thread state and UI
- `src/hooks/useChat.ts` - Add thread functions
- No new files needed

---

## Phase 2B: @Mentions Integration

### What Exists
- `MentionAutocomplete.tsx` with `useMentionAutocomplete` hook
- `MentionPopover` component for displaying suggestions
- `mentions.ts` utility with `parseMentions`, `notifyMentionedUsers`, `fetchTeamMembers`
- Database column: `mentions` (text[]) in `chat_messages_v2`

### What's Missing
The mention components are not integrated into the Chat input

### Implementation Steps

1. **Load team members in Chat.tsx**
   ```typescript
   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
   
   useEffect(() => {
     if (user) {
       fetchTeamMembers(user.id).then(setTeamMembers);
     }
   }, [user]);
   ```

2. **Use the mention autocomplete hook**
   ```typescript
   const {
     showMentions,
     setShowMentions,
     handleInputChange,
     insertMention,
     filteredMembers,
   } = useMentionAutocomplete(teamMembers);
   ```

3. **Wrap textarea with MentionPopover**
   ```tsx
   <MentionPopover
     open={showMentions}
     onOpenChange={setShowMentions}
     members={filteredMembers}
     onSelect={(member) => insertMention(member, input, setInput)}
   >
     <Textarea ... onChange={(e) => {
       setInput(e.target.value);
       handleInputChange(e.target.value, e.target.selectionStart, textareaRef.current);
     }} />
   </MentionPopover>
   ```

4. **Parse and save mentions when sending**
   Update `handleSend` to:
   - Call `parseMentions(input, teamMembers)` to get mentioned user IDs
   - Pass mentions array to `sendMessage`
   - Call `notifyMentionedUsers` after message is sent

5. **Update useChat.ts**
   - Add `mentions?: string[]` parameter to `sendMessage`
   - Include mentions in the database insert

### Files to Modify
- `src/pages/Chat.tsx` - Add mention UI integration
- `src/hooks/useChat.ts` - Add mentions to message insert

---

## Phase 2C: Audit Log Triggers

### What Exists
- `admin_audit_log` database table
- `logAdminAction()` utility function in `src/utils/auditLog.ts`
- Admin Audit Log viewer in Admin dashboard

### What's Missing
Actual calls to `logAdminAction()` in settings pages

### Implementation Steps

1. **AIBehaviorSettings.tsx - Settings Changes**
   Add logging in `handleSave`:
   ```typescript
   import { logAdminAction } from "@/utils/auditLog";
   
   // After successful save:
   await logAdminAction({
     actionType: formData.ai_paused !== settings?.ai_paused 
       ? (formData.ai_paused ? "ai_paused" : "ai_resumed")
       : "setting_change",
     entityType: "org_settings",
     entityId: settings?.id,
     oldValue: {
       ai_paused: settings?.ai_paused,
       auto_approved_tools: settings?.auto_approved_tools,
       ai_response_style: settings?.ai_response_style,
     },
     newValue: {
       ai_paused: formData.ai_paused,
       auto_approved_tools: formData.auto_approved_tools,
       ai_response_style: formData.ai_response_style,
     },
   });
   ```

2. **Team.tsx - Role Changes and Member Removal**
   Update `updateMemberRole` and `removeMember` in `useTeam.ts`:
   ```typescript
   // After role update:
   await logAdminAction({
     actionType: "role_change",
     entityType: "org_members",
     entityId: userId,
     oldValue: { role: oldRole },
     newValue: { role: newRole },
   });
   
   // After member removal:
   await logAdminAction({
     actionType: "member_removed",
     entityType: "org_members",
     entityId: userId,
     oldValue: { email: memberEmail, role: memberRole },
   });
   ```

3. **Connections.tsx - Integration Connect/Disconnect**
   Update `handleConnect` and `handleDisconnect`:
   ```typescript
   // After connect:
   await logAdminAction({
     actionType: "integration_connect",
     entityType: "user_credentials",
     newValue: { integration: integrationName },
   });
   
   // After disconnect:
   await logAdminAction({
     actionType: "integration_disconnect",
     entityType: "user_credentials",
     oldValue: { integration: integrationName, accountEmail },
   });
   ```

### Files to Modify
- `src/components/settings/AIBehaviorSettings.tsx`
- `src/hooks/useTeam.ts`
- `src/pages/Connections.tsx`

---

## Phase 2D: AI Pause Error Handling in Chat

### What Exists
- Backend returns 503 with `{ error: "...", code: "AI_PAUSED" }`
- Chat.tsx handles other error types

### What's Missing
Graceful UI handling for the AI_PAUSED error

### Implementation Steps

1. **Update useChat.ts sendMessage**
   ```typescript
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     
     // Handle AI paused error
     if (response.status === 503 && errorData.code === "AI_PAUSED") {
       return { error: "ai_paused", message: errorData.error };
     }
     // ... existing error handling
   }
   ```

2. **Update Chat.tsx handleSend**
   ```typescript
   const result = await sendMessage(...);
   
   if (result?.error === "ai_paused") {
     toast.error("AI Paused", {
       description: "The AI assistant has been temporarily paused by your organization admin.",
       duration: 5000,
     });
     return;
   }
   ```

3. **Optional: Add persistent banner**
   When AI_PAUSED is detected, show an alert banner at the top of the chat:
   ```tsx
   {aiPausedError && (
     <Alert variant="destructive" className="m-4">
       <AlertCircle className="h-4 w-4" />
       <AlertTitle>AI Paused</AlertTitle>
       <AlertDescription>
         The AI assistant has been temporarily disabled by your organization administrator.
       </AlertDescription>
     </Alert>
   )}
   ```

### Files to Modify
- `src/hooks/useChat.ts`
- `src/pages/Chat.tsx`

---

## Technical Summary

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Chat.tsx` | Thread state, ThreadView/ThreadIndicator integration, Mentions integration, AI paused error handling |
| `src/hooks/useChat.ts` | `loadThreadReplies()`, `sendThreadReply()`, mentions in sendMessage, AI paused error return |
| `src/components/settings/AIBehaviorSettings.tsx` | Add `logAdminAction()` call in handleSave |
| `src/hooks/useTeam.ts` | Add `logAdminAction()` calls in role/removal functions |
| `src/pages/Connections.tsx` | Add `logAdminAction()` calls in connect/disconnect handlers |

### No New Files Required
All components already exist - this is purely integration work.

### No Database Changes Required
The `parent_message_id`, `thread_count`, and `mentions` columns already exist in `chat_messages_v2`.

---

## Implementation Order

1. **Chat Threads** - Most visible feature gap, provides immediate collaboration value
2. **@Mentions** - Completes the collaboration story with notifications
3. **Audit Logging Triggers** - Important for compliance, quick to add
4. **AI Pause Error Handling** - Polish item, improves UX when admins pause AI

---

## Estimated Effort

| Phase | Time Estimate |
|-------|---------------|
| Chat Threads Integration | 30-45 mins |
| @Mentions Integration | 20-30 mins |
| Audit Log Triggers | 15-20 mins |
| AI Pause Error Handling | 10-15 mins |
| **Total** | ~75-110 mins |

All these features leverage existing components and infrastructure - the work is primarily about connecting the pieces.
