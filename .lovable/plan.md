

# Developer Portal for AI Agent Uploads

## Overview

Build a dedicated developer portal where developers can sign up/log in and upload their custom AI agents to the Elixa platform. This includes a new "developer" role, a dedicated portal page, an agent submissions table with review workflow, and file storage for agent configuration files.

---

## Database Changes

### 1. Add "developer" to the app_role enum
Extend the existing `app_role` enum to include a `developer` role so developers are distinct from regular users.

### 2. Create `developer_profiles` table
Store developer-specific information (company name, website, bio, API contact info).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | References auth.users, unique |
| company_name | text | Nullable |
| website | text | Nullable |
| developer_bio | text | Nullable |
| is_verified | boolean | Default false, admin-verified |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### 3. Create `agent_submissions` table
Track uploaded AI agents with a review/approval workflow.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| developer_id | uuid | References developer_profiles(id) |
| name | text | Agent name |
| slug | text | URL-friendly identifier, unique |
| description | text | |
| category | text | e.g. "productivity", "sales", "research" |
| version | text | e.g. "1.0.0" |
| system_prompt | text | The agent's system prompt |
| allowed_tools | text[] | Tools the agent can use |
| icon_url | text | Agent avatar/icon |
| config_file_url | text | Optional JSON config file URL |
| status | text | "draft", "pending_review", "approved", "rejected" |
| review_notes | text | Admin feedback |
| submitted_at | timestamptz | |
| reviewed_at | timestamptz | |
| reviewed_by | uuid | |
| download_count | integer | Default 0 |
| is_public | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 4. RLS Policies
- Developers can CRUD their own submissions
- Developers can read/update their own developer_profiles
- Admins can read all submissions and update status
- Public users can read approved, public agents

### 5. Storage bucket
Create an `agent-assets` storage bucket for agent icons and config files, with RLS so developers can upload to their own folder.

---

## Frontend Components

### 1. Developer Auth Page (`src/pages/DeveloperAuth.tsx`)
- Separate login/signup page styled for developers
- On signup, assigns the "developer" role and creates a `developer_profiles` row
- Redirects to `/developer` portal on success

### 2. Developer Portal Page (`src/pages/DeveloperPortal.tsx`)
Main dashboard with:
- **Overview tab**: Stats (total agents, approved, pending, downloads)
- **My Agents tab**: List of submitted agents with status badges
- **Submit Agent tab**: Form to upload a new agent (name, description, category, system prompt, tools, icon upload)
- **Profile tab**: Edit developer profile (company, website, bio)

### 3. Agent Submission Form (`src/components/developer/AgentSubmissionForm.tsx`)
Multi-step form:
- Step 1: Basic info (name, description, category, version)
- Step 2: Configuration (system prompt, allowed tools selection)
- Step 3: Assets (icon upload, optional config file)
- Step 4: Review and submit

### 4. Agent List Component (`src/components/developer/AgentList.tsx`)
- Cards showing each agent with status badge (draft/pending/approved/rejected)
- Actions: Edit, Submit for Review, Delete
- Filter by status

### 5. Developer Profile Form (`src/components/developer/DeveloperProfileForm.tsx`)
- Company name, website, bio fields
- Verification badge display

### 6. Route and Navigation
- Add `/developer/auth` route for developer signup/login
- Add `/developer` route for the portal (protected, requires developer role)
- Add a "Developer Portal" link in the main nav or home page footer

---

## File Structure (new files)

```text
src/pages/DeveloperAuth.tsx
src/pages/DeveloperPortal.tsx
src/components/developer/AgentSubmissionForm.tsx
src/components/developer/AgentList.tsx
src/components/developer/DeveloperProfileForm.tsx
src/components/developer/DeveloperStats.tsx
src/hooks/useDeveloperPortal.ts
```

---

## Technical Details

### Role Assignment Flow
1. Developer signs up via `/developer/auth`
2. After auth, an edge function or trigger inserts a row in `user_roles` with role = `developer`
3. A `developer_profiles` row is created via a database trigger on user_roles insert (when role = 'developer')

### Agent Submission Flow
1. Developer fills out the submission form
2. Agent is saved with status = "draft"
3. Developer clicks "Submit for Review" to change status to "pending_review"
4. Admin reviews in the admin panel and approves/rejects
5. Approved agents become available in the AI Employees marketplace

### Security
- Developer portal is protected: only users with `developer` role can access
- File uploads go through storage with authenticated policies
- Agent submissions use RLS so developers only see their own
- The `has_role` function (already exists) is used in RLS policies

### Integration with Existing AI Employees
- Approved agents from `agent_submissions` can be "installed" by org users, creating an `ai_employees` row from the agent template
- This bridges the developer portal with the existing AI Employees feature

