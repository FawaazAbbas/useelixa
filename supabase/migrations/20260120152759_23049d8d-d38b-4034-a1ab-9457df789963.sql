-- Step 1: Attach the existing handle_new_user function to auth.users
-- This ensures workspace is created automatically on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Remove duplicate INSERT policies on workspaces table
DROP POLICY IF EXISTS "Users can create their own workspace" ON public.workspaces;

-- Keep only one INSERT policy
CREATE POLICY "Users can create own workspace" ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);