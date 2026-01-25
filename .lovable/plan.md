

# Mascot Prominence Enhancement Plan

## Overview

This plan identifies additional strategic locations throughout the app where the Elixa mascot can be integrated to create a warmer, more inviting, and cohesive user experience. The goal is to make the mascot feel like a natural companion throughout the user journey.

---

## Integration Locations

### 1. Main Navigation Sidebar (Chat Entry Point)

**File:** `src/components/MainNavSidebar.tsx`

**Current:** Uses `Elixa-Responded.png` as a small 36px avatar for the AI Chat nav item.

**Enhancement:** Replace with the `ElixaMascot` component using the `default` pose with a subtle hover animation.

**Details:**
- Size: `xs` (current 36px dimension matches)
- Animation: Add scale/wave animation on hover for interactivity
- This is a highly visible location users see constantly

---

### 2. Chat Sidebar - Empty State

**File:** `src/components/ChatSidebar.tsx`

**Current:** Simple text "No conversations yet"

**Enhancement:** Add mascot with `waving` pose above the text.

**Details:**
- Size: `sm`
- Animation: `float`
- Message: Make it feel inviting to start a conversation

---

### 3. Settings Page - AI Behavior Section

**File:** `src/pages/Settings.tsx`

**Current:** Standard settings tabs with icons only.

**Enhancement:** Add a small mascot in the profile or AI settings tab to make settings feel less sterile.

**Details:**
- Size: `sm`
- Pose: `relaxed` or `sitting`
- Position: Decorative element in the card header or sidebar

---

### 4. Billing Page - Credit Exhausted State

**File:** `src/pages/Billing.tsx`

**Current:** Low credit warning shows AlertTriangle icon.

**Enhancement:** Add mascot with `thinking` or concerned pose to humanize the upgrade prompt.

**Details:**
- Size: `sm`
- Position: Beside the low credit warning text
- Makes the billing nudge feel less aggressive

---

### 5. Connections Page - Empty/First Time

**File:** `src/pages/Connections.tsx`

**Current:** Shows list of available integrations.

**Enhancement:** Add mascot with `pointing-right` pose when user has no connections, pointing toward integrations to connect.

**Details:**
- Size: `md`
- Animation: `float`
- Message: Encourage first-time connection

---

### 6. Digest Page - No Digest Available

**File:** `src/pages/Digest.tsx`

**Current:** Shows PageEmptyState when no digest is generated.

**Enhancement:** Use `thinking` pose mascot for empty state.

**Details:**
- Size: `lg`
- Animation: `pulse`
- Context: "Elixa is preparing your digest..."

---

### 7. Notifications Page - All Caught Up

**File:** `src/pages/Notifications.tsx`

**Current:** Bell icon with "You're all caught up!"

**Enhancement:** Replace with `celebrating` pose mascot.

**Details:**
- Size: `lg`
- Animation: `bounce`
- Makes the empty state feel rewarding

---

### 8. Error Boundary - Crash State

**File:** `src/components/ErrorBoundary.tsx`

**Current:** AlertTriangle icon with error message.

**Enhancement:** Add mascot with `thinking` or concerned pose to soften the error experience.

**Details:**
- Size: `md`
- Position: Above or beside the error message
- Makes errors feel less scary

---

### 9. Knowledge Base - Empty State

**File:** `src/pages/KnowledgeBase.tsx`

**Current:** FileText icon for "No documents yet"

**Enhancement:** Use `search` pose mascot holding magnifying glass.

**Details:**
- Size: `lg`
- Animation: `float`
- Encourages document upload

---

### 10. Calendar - No Events State

**File:** `src/pages/Calendar.tsx`

**Current:** Standard empty state.

**Enhancement:** Add `relaxed` or `sitting` mascot for empty calendar.

**Details:**
- Size: `md`
- Message: Peaceful, relaxed day vibe

---

### 11. Tasks - Empty Kanban Board

**File:** `src/pages/Tasks.tsx`

**Current:** Uses PageEmptyState.

**Enhancement:** Already partially implemented. Ensure mascot appears with `celebrating` pose when all tasks are done, `search` when no tasks exist.

**Details:**
- Different poses for different states
- Completed all tasks = celebrating
- No tasks yet = pointing toward "Add Task"

---

### 12. Notes - No Note Selected

**File:** `src/pages/Notes.tsx`

**Current:** PageEmptyState with "Select a note" message.

**Enhancement:** Use `sitting` or `relaxed` pose mascot.

**Details:**
- Size: `md`
- Animation: `float`
- Calm, contemplative vibe

---

### 13. Logs Page - No Logs State

**File:** `src/pages/Logs.tsx`

**Current:** PageEmptyState for sign-in required.

**Enhancement:** Add mascot for empty logs state.

**Details:**
- Size: `md`
- Pose: `search` when no logs found
- Makes analytics page feel less cold

---

### 14. Trial Banner - Upgrade Prompt

**File:** `src/components/billing/TrialBanner.tsx`

**Current:** Clock icon with days remaining.

**Enhancement:** Add tiny mascot beside the upgrade button.

**Details:**
- Size: `xs`
- Pose: `waving` or `pointing-right`
- Softens the commercial message

---

### 15. Notification List - Empty State

**File:** `src/components/notifications/NotificationList.tsx`

**Current:** Bell icon with "No notifications yet"

**Enhancement:** Use `relaxed` pose mascot.

**Details:**
- Size: `md`
- Animation: `float`
- Peaceful "nothing to worry about" vibe

---

## Implementation Summary

| Location | Pose | Size | Animation | Purpose |
|----------|------|------|-----------|---------|
| MainNavSidebar (Chat) | default | xs | hover-scale | Always visible |
| ChatSidebar empty | waving | sm | float | Welcome new users |
| Settings page | sitting | sm | none | Warm up settings |
| Billing low credit | thinking | sm | none | Soften upgrade nudge |
| Connections empty | pointing-right | md | float | Encourage connections |
| Digest empty | thinking | md | pulse | Processing indicator |
| Notifications empty | celebrating | lg | bounce | Reward "caught up" |
| ErrorBoundary | thinking | md | none | Soften errors |
| Knowledge Base empty | search | lg | float | Encourage uploads |
| Calendar empty | relaxed | md | float | Peaceful day |
| Tasks completed | celebrating | md | bounce | Celebrate success |
| Notes empty | sitting | md | float | Contemplative |
| Logs empty | search | md | none | Analytics warmth |
| Trial banner | waving | xs | none | Friendly upgrade |
| NotificationList empty | relaxed | md | float | Peace of mind |

---

## Files to Modify

1. `src/components/MainNavSidebar.tsx`
2. `src/components/ChatSidebar.tsx`
3. `src/pages/Settings.tsx`
4. `src/pages/Billing.tsx`
5. `src/pages/Connections.tsx`
6. `src/pages/Digest.tsx`
7. `src/pages/Notifications.tsx`
8. `src/components/ErrorBoundary.tsx`
9. `src/pages/KnowledgeBase.tsx`
10. `src/pages/Calendar.tsx`
11. `src/pages/Tasks.tsx`
12. `src/pages/Notes.tsx`
13. `src/pages/Logs.tsx`
14. `src/components/billing/TrialBanner.tsx`
15. `src/components/notifications/NotificationList.tsx`

---

## Technical Notes

- All implementations will use the existing `ElixaMascot` component from `src/components/ElixaMascot.tsx`
- Supported poses: `default`, `waving`, `thinking`, `sitting`, `relaxed`, `pointing-left`, `pointing-right`, `celebrating`, `search`
- Supported sizes: `xs` (32px), `sm` (48px), `md` (80px), `lg` (128px), `xl` (192px), `2xl` (256px)
- Supported animations: `none`, `float`, `bounce`, `pulse`, `wave`

---

## Expected Outcome

After implementation, the Elixa mascot will appear naturally throughout the app:
- Greeting users when they start new conversations
- Celebrating when tasks are completed or notifications are cleared
- Gently guiding users toward features like connections and document uploads
- Softening error states and commercial messages
- Creating a consistent, friendly brand presence

