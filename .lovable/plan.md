

# Plan: Add Accessible Sign In/Sign Up Links for Users

## Current Problem
The sign in/sign up page exists at `/auth`, but users can't easily find it because:
- The landing page only shows "My Workspace" button (no "Sign In" or "Sign Up")
- There's no visible authentication link in the main navigation
- Users who want to create an account or log in have no clear path

## Solution Overview
Add clear, prominent Sign In and Sign Up buttons to the main landing page navbar so users can easily access authentication.

---

## Implementation Steps

### 1. Update the Landing Page Navbar (TalentPoolNavbar.tsx)

Add "Sign In" and "Sign Up" buttons to the navbar that:
- Show for users who are **not logged in**
- Hide when users **are logged in** (showing "My Workspace" instead)
- Are visible on both desktop and mobile

**Changes:**
- Import `useAuth` hook to check authentication status
- Add conditional rendering:
  - **Not logged in**: Show "Sign In" (outline style) + "Sign Up" (primary style) buttons
  - **Logged in**: Show "My Workspace" button (current behavior)

### 2. Desktop Layout
```
[Logo] [Search...] [spacer] [Blog] [Charts] [Sign In] [Sign Up]
```

### 3. Mobile Layout
```
[Logo] [spacer] [Sign In] [Sign Up]
```

### 4. Button Styling
- **Sign In**: Ghost/outline button for secondary action
- **Sign Up**: Primary button (highlighted) for main call-to-action

---

## Technical Details

**File to modify:** `src/components/TalentPoolNavbar.tsx`

**Changes:**
1. Import `useAuth` from `@/hooks/useAuth`
2. Get `user` from the hook
3. Replace the "My Workspace" button section with conditional logic:
   - If `user` exists → show "My Workspace"
   - If no `user` → show "Sign In" + "Sign Up" buttons
4. "Sign In" navigates to `/auth`
5. "Sign Up" also navigates to `/auth` (the page has tabs for both)

---

## Expected Outcome
- New visitors will see clear "Sign In" and "Sign Up" buttons
- Returning logged-in users will see "My Workspace" to access their dashboard
- Authentication becomes discoverable and accessible

