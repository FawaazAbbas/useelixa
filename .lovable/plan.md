

# Enhanced Sign-Up Forms for Both User and Developer Auth

## Overview
Both sign-up forms will collect richer information. The sign-in forms stay as email + password only.

## What users will see

**Main App Sign Up** (`/auth`) collects:
- Full Name
- Email
- Password
- Company / Organisation
- Phone Number

**Developer Sign Up** (`/developer/auth`) collects everything above, plus:
- Website URL

## Technical Details

### 1. Database Migration -- Add columns to `profiles`
Add `phone` and `company_name` columns to the `profiles` table (both nullable so existing users are unaffected).

```sql
ALTER TABLE public.profiles ADD COLUMN phone text;
ALTER TABLE public.profiles ADD COLUMN company_name text;
```

### 2. Update `handle_new_user` trigger
Modify the trigger function to read `phone` and `company_name` from `raw_user_meta_data` and store them in the new profile columns:

```sql
INSERT INTO public.profiles (id, display_name, avatar_url, phone, company_name)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
  NEW.raw_user_meta_data->>'avatar_url',
  NEW.raw_user_meta_data->>'phone',
  NEW.raw_user_meta_data->>'company_name'
);
```

### 3. Update `src/pages/Auth.tsx`
- Add state for `fullName`, `companyName`, `phone`
- Add form fields for all three on the Sign Up tab
- Pass them as `data` metadata in `supabase.auth.signUp({ options: { data: { display_name, phone, company_name } } })`
- Sign In tab stays as-is (email + password)

### 4. Update `src/pages/DeveloperAuth.tsx`
- Add state for `fullName`, `companyName`, `phone`, `website`
- Add form fields for all four on the Sign Up tab
- Pass name/company/phone as user metadata in `signUp`
- After sign-up, also update the `developer_profiles` row with `company_name` and `website`
- Sign In tab stays as-is (email + password)

### 5. Input Validation
- Full Name: required, max 100 chars
- Phone: optional, validated pattern
- Company: required, max 200 chars
- Website (developer only): optional, validated URL format
- Password: min 6 chars (existing)

