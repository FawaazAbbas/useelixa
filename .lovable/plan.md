

# Separate Accounts from Workspaces with Code-Based Joining

## Overview
Decouple user accounts from workspaces. Users create an account, then join a workspace by entering a readable word-based code (e.g. `blue-falcon-42`). Multiple users can join the same workspace, enabling true multi-tenancy.

## Current State
- `handle_new_user` trigger auto-creates a workspace + org on every signup
- Auth page redirects straight to `/chat` after login
- No concept of workspace invite codes

## Architecture

```text
Sign Up → Account Created (profile only, no workspace)
                ↓
         /join-workspace (enter code)
                ↓
         Code validated → workspace_members row inserted
                ↓
              /chat (workspace-scoped)
```

## Database Changes

### Migration 1: Add join_code to workspaces + word generator
- Add `join_code TEXT UNIQUE` column to `workspaces`
- Create a `generate_workspace_join_code()` function that produces readable codes (`adjective-noun-number` format from a curated word list)
- Backfill existing workspaces with generated codes
- Create `join_workspace_by_code(code TEXT)` RPC function that:
  1. Looks up workspace by code
  2. Inserts into `workspace_members` with role `member`
  3. Returns the workspace_id

### Migration 2: Update handle_new_user trigger
- Remove workspace creation, workspace_members insertion
- Keep: profile creation, user_role assignment, org creation, org_members insertion

### Migration 3: Create workspace via UI
- Add `create_workspace_with_code(name TEXT, description TEXT)` RPC that creates a workspace with an auto-generated join code and adds the creator as `owner`

## New Pages & Components

### `/join-workspace` page
- Shows after login if user has no workspace memberships
- Input field for the join code
- "Join" button calls the `join_workspace_by_code` RPC
- "Create New Workspace" option for users who want to start fresh (calls `create_workspace_with_code`)
- Mascot with friendly messaging

### `/create-workspace` page (or dialog within join page)
- Name + description fields
- On creation, shows the generated join code with copy button
- Redirects to `/chat`

## Auth Flow Changes

### `useAuth` / routing guard
- After login, check `workspace_members` for the user
- If no memberships → redirect to `/join-workspace`
- If memberships exist → redirect to `/chat` (or workspace picker if multiple)

### `Auth.tsx`
- After sign-in success, navigate to `/join-workspace` instead of `/chat`
- The join-workspace page handles the redirect to `/chat` once a workspace is confirmed

## Workspace Management (Team/Settings)

### Team page updates
- Show the workspace join code prominently
- "Regenerate Code" button (owner/admin only) — invalidates old code
- Member list with roles

## Files to Create
| File | Purpose |
|------|---------|
| `src/pages/JoinWorkspace.tsx` | Join/create workspace screen |
| `src/hooks/useWorkspaceGuard.tsx` | Redirect logic for workspace membership |

## Files to Modify
| File | Change |
|------|---------|
| `src/App.tsx` | Add `/join-workspace` route, fix auth redirect |
| `src/pages/Auth.tsx` | Redirect to `/join-workspace` instead of `/chat` |
| `src/hooks/useWorkspace.tsx` | Support multiple workspaces, active workspace selection |
| `src/pages/Team.tsx` | Show join code, regenerate button |
| `src/pages/Chat.tsx` | Add workspace guard |

## Build Error Fix (included)
Fix `.catch()` on `PromiseLike` in 4 edge functions by wrapping in `Promise.resolve()` or using `void` pattern.

## RLS Considerations
- `join_workspace_by_code` uses `SECURITY DEFINER` so it can read workspaces table and insert into workspace_members
- Workspace join codes are not exposed via SELECT policies to non-members (only owners/admins see them via the Team page RPC)

