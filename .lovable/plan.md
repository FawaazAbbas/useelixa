

# Add Billing Navigation Access

## Overview
Add clear navigation paths to the Billing page so users can easily manage their subscription, view usage, and purchase credits without relying on contextual prompts.

## Proposed Solution
Add Billing access in **three locations** for comprehensive discoverability:

---

## Changes

### 1. Settings Page - Add Billing Tab
Add a new "Billing" tab to the Settings page that redirects to the dedicated Billing page or embeds billing content.

**File:** `src/pages/Settings.tsx`
- Add `CreditCard` icon import from lucide-react
- Add new `TabsTrigger` for "Billing" 
- Add corresponding `TabsContent` with a quick summary and link to full Billing page

### 2. Main Sidebar - Add Billing Link
Add Billing to the main navigation sidebar for quick access.

**File:** `src/components/MainNavSidebar.tsx`
- Import `CreditCard` icon
- Add Billing to `navItems` array with path `/billing`

### 3. Mobile Navigation - Add to "More" Menu
Include Billing in the mobile "More" sheet for mobile users.

**File:** `src/components/MobileBottomNav.tsx`
- Import `CreditCard` icon
- Add Billing to `moreItems` array

### 4. User Dropdown Menu - Add Billing Option
Add Billing as a quick access option in the user avatar dropdown menu.

**File:** `src/components/MainNavSidebar.tsx`
- Add a new `DropdownMenuItem` for Billing between Settings and Sign Out

---

## Summary of Navigation Locations

| Location | How to Access |
|----------|---------------|
| Main Sidebar | Click the Credit Card icon labeled "Billing" |
| Settings Page | Click Settings → Billing tab |
| Mobile "More" Menu | Tap "More" → "Billing" |
| User Dropdown | Click avatar → "Billing" |

---

## Technical Details

### Files Modified
1. `src/components/MainNavSidebar.tsx` - Add nav item and dropdown menu item
2. `src/components/MobileBottomNav.tsx` - Add to moreItems array
3. `src/pages/Settings.tsx` - Add Billing tab with summary card

### Icon Used
- `CreditCard` from lucide-react (consistent with Billing page)

### Implementation Order
1. Update MainNavSidebar (sidebar + dropdown)
2. Update MobileBottomNav
3. Update Settings page

