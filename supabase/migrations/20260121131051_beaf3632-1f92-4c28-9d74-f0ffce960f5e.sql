-- Add position column for task ordering
ALTER TABLE public.tasks ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing tasks to have sequential positions
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) as rn
  FROM public.tasks
)
UPDATE public.tasks
SET position = numbered.rn
FROM numbered
WHERE tasks.id = numbered.id;