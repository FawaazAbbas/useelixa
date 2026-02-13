

# Platform Cleanup: Dead Code, Unused Dependencies, and Legacy Remnants

## Summary

After auditing the full codebase, here is everything that is dead, unused, or inefficient -- grouped by severity.

---

## 1. Completely Unused Component Files (safe to delete)

These files are never imported anywhere in the codebase:

| File | Reason |
|------|--------|
| `src/components/AuthDialog.tsx` | Zero imports -- replaced by the `/auth` page |
| `src/components/LoadingSkeleton.tsx` | Zero imports -- pages use inline Skeleton or Loader2 |
| `src/components/FileIcon.tsx` | Zero imports |
| `src/components/SidebarActionButton.tsx` | Zero imports |
| `src/components/SidebarActionMenu.tsx` | Zero imports |
| `src/components/MascotAvatar.tsx` | Zero imports |
| `src/components/developer/PlatformHostedFields.tsx` | Zero imports -- legacy hosting model removed |
| `src/components/developer/SelfHostedFields.tsx` | Zero imports -- legacy hosting model removed |
| `src/components/developer/DeveloperStats.tsx` | Zero imports |
| `src/components/developer/DeveloperProfileForm.tsx` | Zero imports |
| `src/components/ai-employees/CreateEmployeeDialog.tsx` | Zero imports -- replaced by agent submission flow |

**Total: 11 dead component files**

---

## 2. Dead Pages (routed but redirect-only or hidden)

| Page File | Status |
|-----------|--------|
| `src/pages/TalentPool.tsx` | Route redirects to `/` -- page code is never rendered |
| `src/pages/Workspace.tsx` | Route redirects to `/chat` -- page code is never rendered |
| `src/pages/Blog.tsx` | Routes are commented out in App.tsx -- never reachable |
| `src/pages/BlogPost.tsx` | Routes are commented out in App.tsx -- never reachable |
| `src/pages/PitchDeck.tsx` | Internal-only, not in navigation -- consider if still needed |

**Action:** Delete TalentPool.tsx, Workspace.tsx, Blog.tsx, and BlogPost.tsx since they are unreachable. Confirm PitchDeck status with you.

---

## 3. Unused npm Dependencies

These packages are installed but never imported anywhere in the source:

| Package | Reason |
|---------|--------|
| `react-pull-to-refresh` | Zero imports |
| `react-infinite-scroll-component` | Zero imports |
| `react-swipeable` | Zero imports |
| `@playwright/test` | Test framework -- only used in config files, not runtime. Can keep if tests are planned |

**Action:** Uninstall the first 3 packages to reduce bundle size.

---

## 4. Legacy Backend Functions (no longer called)

| Edge Function | Status |
|---------------|--------|
| `execute-python-agent` | Legacy self-hosted model removed -- never invoked |
| `test-agent` | Legacy agent testing -- never invoked |
| `ai-employee-orchestrator` | References deprecated `ai_employees` table |

**Action:** Delete `execute-python-agent` and `test-agent`. Review `ai-employee-orchestrator` for whether it should be updated or removed.

---

## 5. Blog Infrastructure (hidden but still present)

The blog routes are commented out, but all supporting code remains:

- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`  
- `src/components/admin/AdminBlogTab.tsx`
- `src/components/admin/RichTextEditor.tsx`
- `src/components/admin/BlogCoverUpload.tsx`
- Related tiptap dependencies (`@tiptap/*`)
- Database table `blog_posts` still exists

**Action:** If Blog is permanently shelved, delete the 5 files and uninstall the 6 tiptap packages. If it may return, leave as-is but note the bloat.

---

## 6. Naming Inconsistency: "TalentPool" Components

`TalentPoolNavbar` and `TalentPoolFooter` are used by Home, About, Contact, Privacy, Terms (the public-facing pages) -- not by any "Talent Pool" feature. The name is a legacy leftover.

**Action:** Rename to `PublicNavbar` and `PublicFooter` for clarity.

---

## 7. Duplicate Toast Systems

The project imports both:
- `@/components/ui/toaster` (Radix-based toast)  
- `sonner` (Sonner toast)

Both are mounted in `App.tsx` and used inconsistently across the codebase.

**Action:** Standardise on one (recommend Sonner as it's simpler and already used more broadly), then remove the Radix toast system.

---

## Implementation Plan

### Phase 1 -- Delete dead files (zero risk)
Delete the 11 unused component files listed in section 1.

### Phase 2 -- Delete dead pages
Delete `TalentPool.tsx`, `Workspace.tsx`, `Blog.tsx`, `BlogPost.tsx`.

### Phase 3 -- Remove unused npm packages
Uninstall `react-pull-to-refresh`, `react-infinite-scroll-component`, `react-swipeable`.

### Phase 4 -- Delete legacy edge functions
Delete `execute-python-agent` and `test-agent` functions.

### Phase 5 -- Rename TalentPool components
Rename `TalentPoolNavbar` to `PublicNavbar` and `TalentPoolFooter` to `PublicFooter`, updating all imports.

### Phase 6 -- Blog decision
Pending your decision: keep or remove the blog infrastructure entirely.

### Phase 7 -- Toast consolidation
Standardise on Sonner and remove the Radix toast setup (lower priority, more files to touch).

