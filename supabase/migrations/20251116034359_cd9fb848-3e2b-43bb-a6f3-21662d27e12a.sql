-- Add task_id to automations table
ALTER TABLE public.automations 
ADD COLUMN task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_automations_task_id ON public.automations(task_id);

-- Add progress tracking to automations
ALTER TABLE public.automations
ADD COLUMN progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN result_data jsonb;

-- Add computed fields to tasks for automation tracking
ALTER TABLE public.tasks
ADD COLUMN automation_count integer DEFAULT 0,
ADD COLUMN completed_automation_count integer DEFAULT 0;

-- Create trigger function to auto-update task statistics
CREATE OR REPLACE FUNCTION update_task_automation_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.tasks
    SET 
      automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = OLD.task_id
      ),
      completed_automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = OLD.task_id 
          AND status = 'completed'
      )
    WHERE id = OLD.task_id;
    RETURN OLD;
  ELSE
    UPDATE public.tasks
    SET 
      automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = NEW.task_id
      ),
      completed_automation_count = (
        SELECT COUNT(*) 
        FROM public.automations 
        WHERE task_id = NEW.task_id 
          AND status = 'completed'
      )
    WHERE id = NEW.task_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER automation_task_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION update_task_automation_stats();

-- Update RLS policy for automations
DROP POLICY IF EXISTS "Users can view workspace automations" ON public.automations;

CREATE POLICY "Users can view automations"
ON public.automations FOR SELECT
USING (
  auth.uid() = created_by 
  OR EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = automations.workspace_id
      AND workspace_members.user_id = auth.uid()
  )
  OR task_id IN (
    SELECT id FROM public.tasks WHERE user_id = auth.uid()
  )
);