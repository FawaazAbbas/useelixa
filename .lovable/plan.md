

# Five Feature Updates

## 1. Workspace Join Code in Settings > Org Tab

Add the workspace join code display (with copy + regenerate for owners) to the Organization tab in `src/pages/Settings.tsx`. Reuse the same logic already in `Team.tsx`.

**Files modified:** `src/pages/Settings.tsx`

---

## 2. Auto-Create DM Chats When Users Join Workspace

When a new user joins a workspace via code, automatically create a direct-message thread between them and every existing workspace member. These DMs appear in the sidebar alongside agent chats.

**Database changes:**
- Create a `workspace_dms` table: `id`, `workspace_id`, `user_a`, `user_b`, `created_at` with a unique constraint on `(workspace_id, user_a, user_b)` (normalized so user_a < user_b)
- Create a `dm_messages` table: `id`, `dm_id`, `sender_id`, `content`, `created_at`
- RLS: users can only see/insert DMs where they are user_a or user_b
- Update the `join_workspace_by_code` RPC to insert DM rows for each existing member

**Frontend changes:**
- Update `ChatspaceSidebar.tsx` to show both agents AND DM contacts (two sections: "People" and "Agents")
- Create a DM chat view in the center pane of `AIEmployees.tsx` that loads from `dm_messages`
- Show user avatars, display names, and online indicators for people

**Files created:** None (inline in existing components)
**Files modified:** `src/components/ai-employees/ChatspaceSidebar.tsx`, `src/pages/AIEmployees.tsx`, `src/pages/JoinWorkspace.tsx`

---

## 3. Merge AI Chat into AI Employees as "Chats"

Move the main Elixa AI chat experience into the AI Employees page as just another chat in the sidebar (the first/default one). Rename the section from "AI Employees" to "Chats" across nav and page title.

**Changes:**
- In `MainNavSidebar.tsx`: rename "AI Chat" to "Chats", point to `/ai-employees`. Remove separate `/chat` nav item, keep `/chat` route as redirect to `/ai-employees`
- In `AIEmployees.tsx` sidebar: add "Elixa AI" as the first item (always present, not an installed agent). When selected, render the existing Chat.tsx experience (session list, message thread, model selector, etc.) inside the center pane
- Keep existing Chat.tsx logic but extract the core chat UI into a reusable component that can be embedded

**Files modified:** `src/components/MainNavSidebar.tsx`, `src/pages/AIEmployees.tsx`, `src/components/ai-employees/ChatspaceSidebar.tsx`, `src/App.tsx`
**Files created:** `src/components/chat/EmbeddedChat.tsx` (extracted from Chat.tsx)

---

## 4. Show Empty Kanban Board When No Tasks Exist

Instead of showing the empty state mascot when there are no tasks, render the actual `KanbanBoard` component with empty columns plus the `TaskStatsHeader` showing zeroes. This gives users a visual preview of the board structure.

**Files modified:** `src/pages/Tasks.tsx`

Change: Remove the `tasks.length === 0` empty state branch. Always show `TaskStatsHeader` and `KanbanBoard` (with `filteredTasks` which will be empty). The columns will render with their headers and "No tasks" placeholder.

---

## 5. Organization Hierarchy Section

Create a new "Hierarchy" page or section within Team that visualizes the org structure as a tree/org-chart.

**Database changes:**
- Add `reports_to UUID REFERENCES profiles(id)` and `job_title TEXT` columns to `org_members` table
- This allows building a tree: owner at root, admins/members arranged by reporting lines

**Frontend:**
- Create a new route `/hierarchy` with a visual org chart component
- Add to nav sidebar (or as a tab within Team page)
- Tree layout: each node shows avatar, name, role, job title
- Admins can edit reporting lines via drag or dropdown

**Files created:** `src/pages/Hierarchy.tsx`, `src/components/team/OrgChart.tsx`
**Files modified:** `src/App.tsx`, `src/components/MainNavSidebar.tsx`, `src/pages/Team.tsx`

---

## Implementation Order

1. Database migrations (workspace_dms, dm_messages, org_members columns)
2. Settings join code (small, independent)
3. Tasks empty board (small, independent)
4. Hierarchy page
5. DM auto-creation on workspace join
6. Merge AI Chat into Chats section (largest change)

