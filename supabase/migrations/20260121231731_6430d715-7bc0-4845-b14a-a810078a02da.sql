-- Complete the remaining security hardening (real-time already enabled)

-- Verify tool_execution_log policy was created (idempotent check)
-- If previous migration partially succeeded, this is a no-op safety check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tool_execution_log' 
    AND policyname = 'Authenticated users can insert own logs'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated users can insert own logs"
    ON public.tool_execution_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;